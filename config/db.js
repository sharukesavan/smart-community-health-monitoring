// Mock Database Pool
// Running in-memory database store mode (no MySQL server needed)

module.exports = {
  execute: async () => [[]],
  getConnection: async () => ({
    beginTransaction: async () => {},
    commit: async () => {},
    rollback: async () => {},
    release: () => {}
  })
};
