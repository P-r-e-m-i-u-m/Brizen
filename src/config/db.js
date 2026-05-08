module.exports = {
  raw: async () => [{ health_check: 1 }],
  pool: {
    connect: async () => ({
      query: async () => ({ rows: [{ health_check: 1 }] }),
      release: () => {}
    })
  }
};
