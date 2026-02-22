const rooms = {};

module.exports = {
  create(roomId, room) {
    rooms[roomId] = room;
    return room;
  },

  findById(roomId) {
    return rooms[roomId];
  },

  getAll() {
    return Object.values(rooms);
  },

  getAllIds() {
    return Object.keys(rooms);
  },

  delete(roomId) {
    delete rooms[roomId];
  },

  exists(roomId) {
    return !!rooms[roomId];
  }
};
