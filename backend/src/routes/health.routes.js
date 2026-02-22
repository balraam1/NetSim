const express = require('express');
const router = express.Router();
const roomService = require('../services/room.service');
const userService = require('../services/user.service');
const roomsStorage = require('../storage/rooms.storage');

router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    activeRooms: roomsStorage.getAllIds().length,
    connectedUsers: userService.getUserCount(),
    rooms: roomService.getRoomStats()
  });
});

module.exports = router;
