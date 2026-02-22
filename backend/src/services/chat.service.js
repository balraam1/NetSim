const { Message } = require('../models');
const { saveChatLog } = require('../utils/fileSystem');

class ChatService {
  createMessage(username, messageText) {
    return new Message(username, messageText);
  }

  addMessageToRoom(room, message) {
    room.addMessage(message);
    saveChatLog(room.id, message);
    return message;
  }
}

module.exports = new ChatService();
