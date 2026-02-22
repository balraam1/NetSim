class Message {
  constructor(username, message) {
    this.id = Date.now();
    this.username = username;
    this.message = message;
    this.timestamp = new Date().toISOString();
  }
}

module.exports = Message;
