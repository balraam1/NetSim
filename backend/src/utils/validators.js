function validateUsername(username) {
  if (!username || typeof username !== 'string') {
    return { valid: false, error: 'Username is required' };
  }
  if (username.length > 20) {
    return { valid: false, error: 'Username too long (max 20 characters)' };
  }
  if (username.trim().length === 0) {
    return { valid: false, error: 'Username cannot be empty' };
  }
  return { valid: true };
}

function validateRoomId(roomId) {
  if (!roomId || typeof roomId !== 'string') {
    return { valid: false, error: 'Room ID is required' };
  }
  if (roomId.length !== 8) {
    return { valid: false, error: 'Invalid room ID format' };
  }
  return { valid: true };
}

function validateMessage(message) {
  if (!message || typeof message !== 'string') {
    return { valid: false, error: 'Message is required' };
  }
  if (message.length > 500) {
    return { valid: false, error: 'Message too long (max 500 characters)' };
  }
  return { valid: true };
}

function parseData(data) {
  if (typeof data === 'string') {
    try {
      return JSON.parse(data);
    } catch (err) {
      return null;
    }
  }
  return data;
}

module.exports = {
  validateUsername,
  validateRoomId,
  validateMessage,
  parseData
};
