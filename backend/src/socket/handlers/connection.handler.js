const userService = require('../../services/user.service');
const roomService = require('../../services/room.service');
const logger = require('../../services/logger.service');
const { EVENTS } = require('../../config/constants');

function handleDisconnect(io, socket) {
  socket.on('disconnect', () => {
    const user = userService.findUser(socket.id);
    if (!user) return;
    
    const room = roomService.findRoom(user.roomId);
    if (!room) return;
    
    if (room.host === socket.id) {
      io.to(user.roomId).emit(EVENTS.ROOM_CLOSED, {
        message: 'Host has left. Room closed.'
      });
      
      room.users.forEach(u => userService.removeUser(u.socketId));
      roomService.deleteRoom(user.roomId);
      
      logger.roomClosed(user.roomId);
    } else {
      roomService.removeUserFromRoom(user.roomId, socket.id);
      userService.removeUser(socket.id);
      
      socket.to(user.roomId).emit(EVENTS.USER_LEFT, {
        username: user.username,
        remainingUsers: room.users
      });
      
      logger.userLeft(user.username, user.roomId);
    }
  });
}

module.exports = handleDisconnect;
