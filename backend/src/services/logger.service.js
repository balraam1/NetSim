class LoggerService {
  info(message) {
    console.log(`ℹ️  ${message}`);
  }

  success(message) {
    console.log(`✅ ${message}`);
  }

  error(message) {
    console.error(`❌ ${message}`);
  }

  debug(message) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`🐛 ${message}`);
    }
  }

  roomCreated(roomId, username) {
    console.log(`🏠 Room ${roomId} created by ${username}`);
  }

  userJoined(username, roomId) {
    console.log(`👤 ${username} joined room ${roomId}`);
  }

  userLeft(username, roomId) {
    console.log(`👋 ${username} left room ${roomId}`);
  }

  roomClosed(roomId) {
    console.log(`🔒 Room ${roomId} closed`);
  }

  messageReceived(roomId, username, message) {
    console.log(`💬 [${roomId}] ${username}: ${message}`);
  }

  privateChannelCreated(user1, user2) {
    console.log(`🔗 Private channel: ${user1} <-> ${user2}`);
  }



  fileTransfer(action, fileName, protocol, roomId) {
    const timestamp = new Date().toISOString();
    const message = `[FILE TRANSFER] Action: ${action} | File: ${fileName} | Protocol: ${protocol} | Room: ${roomId}`;
    
    switch(action) {
      case 'init':
        console.log(`📡 ${message}`);
        break;
      case 'send':
        console.log(`📤 ${message}`);
        break;
      case 'accept':
        console.log(`✅ ${message}`);
        break;
      case 'reject':
        console.error(`❌ ${message}`);
        break;
      case 'complete':
        console.log(`🎉 ${message}`);
        break;
      default:
        console.log(`📝 ${message}`);
    }
    
    // Write to log file if needed
    this.writeToFile(message);
  }

  // 🔥 NEW: Error logging
  error(message) {
    const timestamp = new Date().toISOString();
    console.error(`❌ [ERROR] ${timestamp} - ${message}`);
    this.writeToFile(`[ERROR] ${message}`);
  }

  // Helper to write logs
  writeToFile(message) {
    // Optional: write to file if logging to disk
    if (this.logFile) {
      // fs.appendFileSync(this.logFile, `${message}\n`);
    }
  }
}

module.exports = new LoggerService();
