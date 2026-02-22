class Room {
  constructor(id, hostSocketId, hostUsername) {
    this.id = id;
    this.host = hostSocketId;
    this.users = [
      {
        socketId: hostSocketId,
        username: hostUsername,
        role: 'host',
        connectedAt: Date.now(),
        privateChannels: []
      }
    ];
    this.maxUsers = 10;
    this.createdAt = Date.now();
    this.chatLog = [];
    this.privateChannels = [];
    this.topology = {
      type: 'custom',
      connections: []
    };
  }

  addUser(socketId, username, role = 'member') {
    const user = {
      socketId,
      username,
      role,
      connectedAt: Date.now(),
      privateChannels: []
    };
    this.users.push(user);
    return user;
  }

  removeUser(socketId) {
    this.users = this.users.filter(u => u.socketId !== socketId);
  }

  findUser(socketId) {
    return this.users.find(u => u.socketId === socketId);
  }

  hasUsername(username) {
    return this.users.some(u => u.username === username);
  }

  isFull() {
    return this.users.length >= this.maxUsers;
  }

  addMessage(message) {
    this.chatLog.push(message);
  }

  addPrivateChannel(channel) {
    this.privateChannels.push(channel);
  }

  findPrivateChannel(channelId) {
    return this.privateChannels.find(c => c.channelId === channelId);
  }

  removePrivateChannel(channelId) {
    this.privateChannels = this.privateChannels.filter(c => c.channelId !== channelId);
  }
}

module.exports = Room;
