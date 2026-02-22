require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 3001,
  HOST: process.env.HOST || '0.0.0.0',
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // CORS settings
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
  
  // Room settings
  MAX_USERS_PER_ROOM: parseInt(process.env.MAX_USERS_PER_ROOM) || 10,
  ROOM_ID_LENGTH: 4,
  
  // Paths
  LOGS_DIR: process.env.LOGS_DIR || './logs',
  CHAT_LOGS_DIR: process.env.CHAT_LOGS_DIR || './logs/chat'
};
