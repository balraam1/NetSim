const userService = require('../../services/user.service');
const roomService = require('../../services/room.service');
const chatService = require('../../services/chat.service');
const logger = require('../../services/logger.service');
const { validateMessage, parseData } = require('../../utils/validators');
const { EVENTS } = require('../../config/constants');

function handleChatEvents(io, socket) {
  
  socket.on(EVENTS.SEND_MESSAGE, (data) => {
    const parsed = parseData(data);
    
    const validation = validateMessage(parsed?.message);
    if (!validation.valid) {
      socket.emit(EVENTS.ERROR, { message: validation.error });
      return;
    }
    
    const user = userService.findUser(socket.id);
    if (!user) return;
    
    const room = roomService.findRoom(user.roomId);
    if (!room) return;
    
    const message = chatService.createMessage(user.username, parsed.message);
    chatService.addMessageToRoom(room, message);
    
    io.to(user.roomId).emit(EVENTS.NEW_MESSAGE, message);
    
    logger.messageReceived(user.roomId, user.username, parsed.message);
  });
}

module.exports = handleChatEvents;
