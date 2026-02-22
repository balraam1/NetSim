const crypto = require('crypto');
const config = require('../config/environment');

function generateRoomId() {
  return crypto
    .randomBytes(config.ROOM_ID_LENGTH)
    .toString('hex')
    .toUpperCase();
}

function generateChannelId(socketId1, socketId2) {
  const sorted = [socketId1, socketId2].sort();
  return crypto.createHash('md5')
    .update(sorted.join('-'))
    .digest('hex')
    .substring(0, 16);
}

module.exports = { generateRoomId, generateChannelId };
