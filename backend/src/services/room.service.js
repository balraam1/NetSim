const { Room } = require('../models');
const roomsStorage = require('../storage/rooms.storage');
const { generateRoomId } = require('../utils/roomId.generator');

class RoomService {
  createRoom(hostSocketId, hostUsername) {
    const roomId = generateRoomId();
    const room = new Room(roomId, hostSocketId, hostUsername);
    roomsStorage.create(roomId, room);
    return room;
  }

  findRoom(roomId) {
    return roomsStorage.findById(roomId);
  }

  deleteRoom(roomId) {
    roomsStorage.delete(roomId);
  }

  getRoomStats() {
    const rooms = roomsStorage.getAll();
    return rooms.map(room => ({
      roomId: room.id,
      users: room.users.length,
      host: room.users.find(u => u.role === 'host')?.username
    }));
  }

  addUserToRoom(roomId, socketId, username) {
    const room = this.findRoom(roomId);
    if (!room) return null;
    
    return room.addUser(socketId, username, 'member');
  }

  removeUserFromRoom(roomId, socketId) {
    const room = this.findRoom(roomId);
    if (!room) return;
    
    room.removeUser(socketId);
  }
}

module.exports = new RoomService();
