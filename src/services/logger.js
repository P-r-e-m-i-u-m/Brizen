const fs = require("fs");
const path = require("path");

class Logger {
  constructor(context = "app", options = {}) {
    this.context = context;
    this.logDir = options.logDir || path.join(process.cwd(), "logs");
  }

  _format(level, msg, meta = {}) {
    return JSON.stringify({
      level,
      msg,
      context: this.context,
      ...meta,
      ts: new Date().toISOString()
    });
  }

  _write(level, msg, meta = {}) {
    const line = this._format(level, msg, meta);
    if (level === "error") {
      process.stderr.write(line + "\n");
    } else {
      process.stdout.write(line + "\n");
    }
    this._writeToFile(level, line);
  }

  _writeToFile(level, line) {
    try {
      fs.mkdirSync(this.logDir, { recursive: true });
      fs.appendFileSync(path.join(this.logDir, level + ".log"), line + "\n");
    } catch (err) {
      if (err.code === "EROFS" || err.code === "EACCES") {
        return;
      }
      throw err;
    }
  }

  info(msg, meta = {}) {
    this._write("info", msg, meta);
  }

  warn(msg, meta = {}) {
    this._write("warn", msg, meta);
  }

  error(msg, errOrMeta = {}) {
    const meta = errOrMeta instanceof Error
      ? { error: errOrMeta.message, stack: errOrMeta.stack }
      : errOrMeta;
    this._write("error", msg, meta);
  }

  child(name) {
    return new Logger(this.context + ":" + name, { logDir: this.logDir });
  }

  time(operation) {
    const start = Date.now();
    return {
      end: () => this.info(operation + " completed", { durationMs: Date.now() - start })
    };
  }
}

const defaultLogger = new Logger("daily-activity");

module.exports = defaultLogger;
module.exports.Logger = Logger;
