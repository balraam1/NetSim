const userSockets = {};

module.exports = {
  add(socketId, user) {
    userSockets[socketId] = user;
    return user;
  },

  findBySocketId(socketId) {
    return userSockets[socketId];
  },

  remove(socketId) {
    delete userSockets[socketId];
  },

  getAll() {
    return Object.values(userSockets);
  },

  exists(socketId) {
    return !!userSockets[socketId];
  }
};
