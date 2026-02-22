const fs = require('fs');
const path = require('path');
const config = require('../config/environment');

function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function saveChatLog(roomId, chatEntry) {
  const logsDir = config.CHAT_LOGS_DIR;
  ensureDirectoryExists(logsDir);
  
  const logFile = path.join(logsDir, `${roomId}_chat.txt`);
  const logLine = `[${chatEntry.timestamp}] ${chatEntry.username}: ${chatEntry.message}\n`;
  
  try {
    fs.appendFileSync(logFile, logLine, 'utf8');
  } catch (error) {
    console.error(`Failed to save chat log: ${error.message}`);
  }
}

module.exports = {
  ensureDirectoryExists,
  saveChatLog
};
