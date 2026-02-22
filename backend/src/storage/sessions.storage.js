// Placeholder for future session management
const sessions = {};

module.exports = {
  create(sessionId, data) {
    sessions[sessionId] = data;
  },

  findById(sessionId) {
    return sessions[sessionId];
  },

  delete(sessionId) {
    delete sessions[sessionId];
  }
};
