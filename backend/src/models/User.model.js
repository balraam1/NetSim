class User {
  constructor(socketId, username, roomId, role = 'member') {
    this.socketId = socketId;
    this.username = username;
    this.roomId = roomId;
    this.role = role;
    this.connectedAt = Date.now();
  }
}

module.exports = User;
