class PrivateChannel {
  constructor(channelId, participant1, participant2) {
    this.channelId = channelId;
    this.participants = [participant1, participant2];
    this.createdAt = Date.now();
    this.messageLog = [];
  }

  addMessage(message) {
    this.messageLog.push(message);
  }

  isParticipant(socketId) {
    return this.participants.includes(socketId);
  }
}

module.exports = PrivateChannel;
