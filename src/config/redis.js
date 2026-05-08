const client = {
  get: async () => null,
  setex: async () => "OK",
  del: async () => 1,
  ping: async () => "PONG",
  info: async () => "",
  zremrangebyscore: async () => 0,
  zcard: async () => 0,
  zadd: async () => 1,
  pexpire: async () => 1,
  zrange: async () => [],
  zpopmin: async () => [],
  lpush: async () => 1,
  llen: async () => 0
};

module.exports = client;
