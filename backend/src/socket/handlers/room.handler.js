const roomService = require('../../services/room.service');
const userService = require('../../services/user.service');
const logger = require('../../services/logger.service');
const { validateUsername, validateRoomId, parseData } = require('../../utils/validators');
const { EVENTS, ROLES, ERROR_MESSAGES } = require('../../config/constants');

function handleRoomEvents(io, socket) {
  
  socket.on(EVENTS.CREATE_ROOM, (data) => {
    const parsed = parseData(data);
    
    const validation = validateUsername(parsed?.username);
    if (!validation.valid) {
      socket.emit(EVENTS.ERROR, { message: validation.error });
      return;
    }
    
    const { username } = parsed;
    const room = roomService.createRoom(socket.id, username);
    userService.addUser(socket.id, username, room.id, ROLES.HOST);
    
    socket.join(room.id);
    
    socket.emit(EVENTS.ROOM_CREATED, {
      roomId: room.id,
      role: ROLES.HOST,
      users: room.users
    });
    
    logger.roomCreated(room.id, username);
  });

  socket.on(EVENTS.JOIN_ROOM, (data) => {
    const parsed = parseData(data);
    
    const roomValidation = validateRoomId(parsed?.roomId);
    if (!roomValidation.valid) {
      socket.emit(EVENTS.JOIN_ERROR, { message: roomValidation.error });
      return;
    }
    
    const userValidation = validateUsername(parsed?.username);
    if (!userValidation.valid) {
      socket.emit(EVENTS.JOIN_ERROR, { message: userValidation.error });
      return;
    }
    
    const { roomId, username } = parsed;
    const room = roomService.findRoom(roomId);
    
    if (!room) {
      socket.emit(EVENTS.JOIN_ERROR, { message: ERROR_MESSAGES.ROOM_NOT_FOUND });
      return;
    }
    
    if (room.isFull()) {
      socket.emit(EVENTS.JOIN_ERROR, { message: ERROR_MESSAGES.ROOM_FULL });
      return;
    }
    
    if (room.hasUsername(username)) {
      socket.emit(EVENTS.JOIN_ERROR, { message: ERROR_MESSAGES.USERNAME_TAKEN });
      return;
    }
    
    const newUser = roomService.addUserToRoom(roomId, socket.id, username);
    userService.addUser(socket.id, username, roomId, ROLES.MEMBER);
    
    socket.join(roomId);
    
    // 🔥 FIX #1: Send updated room data to joining user
    socket.emit(EVENTS.JOINED_ROOM, {
      roomId,
      role: ROLES.MEMBER,
      users: room.users,  // ✅ Updated users with new member
      chatLog: room.chatLog,
      myRole: ROLES.MEMBER
    });
    
    // 🔥 FIX #2: Notify ALL room members (including host) about new user
    // ✅ Changed: socket.to() → io.to() to notify everyone including sender
    // ✅ Changed: Send full `users` array instead of just totalUsers
    io.to(roomId).emit(EVENTS.USER_JOINED, {
      user: newUser,
      users: room.users,  // ✅ CRITICAL: Send full users array!
      totalUsers: room.users.length
    });
    
    logger.userJoined(username, roomId);
  });

  socket.on(EVENTS.GET_ROOM_INFO, () => {
    const user = userService.findUser(socket.id);
    if (!user) {
      console.warn("⚠️ User not found for get-room-info");
      return;
    }
    
    const room = roomService.findRoom(user.roomId);
    if (!room) {
      console.warn("⚠️ Room not found for get-room-info");
      return;
    }
    
    // 🔥 FIX #3: Add console logging for debugging
    console.log(`📊 GET_ROOM_INFO - Room: ${room.id}, Users: ${room.users.length}`);
    
    socket.emit(EVENTS.ROOM_INFO, {
      roomId: room.id,
      users: room.users,
      host: room.host,
      myRole: user.role,
      chatLog: room.chatLog
    });
  });
}

module.exports = handleRoomEvents;
