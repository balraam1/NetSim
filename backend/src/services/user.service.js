const { User } = require('../models');
const usersStorage = require('../storage/users.storage');

class UserService {
  addUser(socketId, username, roomId, role = 'member') {
    const user = new User(socketId, username, roomId, role);
    usersStorage.add(socketId, user);
    return user;
  }

  findUser(socketId) {
    return usersStorage.findBySocketId(socketId);
  }

  removeUser(socketId) {
    usersStorage.remove(socketId);
  }

  getUserCount() {
    return usersStorage.getAll().length;
  }
}

module.exports = new UserService();
