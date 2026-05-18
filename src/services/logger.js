const writeToFile = (filePath, line) => {
  try {
    fs.appendFileSync(filePath, line + "\n");
  } catch (err) {
    if (err.code === "EROFS" || err.code === "EACCES") {
      process.stdout.write(line + "\n");
    }
  }
};  // Fixed readonly fs fallback - Updated: 2026-05-18
// build: 1779114559
