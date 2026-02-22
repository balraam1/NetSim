const userService = require('../../services/user.service');
const roomService = require('../../services/room.service');
const logger = require('../../services/logger.service');
const { PrivateChannel } = require('../../models');
const { generateChannelId } = require('../../utils/roomId.generator');
const { parseData } = require('../../utils/validators');
const { EVENTS, ERROR_MESSAGES } = require('../../config/constants');

function handlePrivateChannelEvents(io, socket) {
  
  socket.on(EVENTS.CREATE_PRIVATE_CHANNEL, (data) => {
    const { targetSocketId } = parseData(data);
    const user = userService.findUser(socket.id);
    
    if (!user) {
      socket.emit(EVENTS.ERROR, { message: ERROR_MESSAGES.NOT_IN_ROOM });
      return;
    }
    
    const room = roomService.findRoom(user.roomId);
    if (!room) return;
    
    const targetUser = room.findUser(targetSocketId);
    if (!targetUser) {
      socket.emit(EVENTS.ERROR, { message: ERROR_MESSAGES.TARGET_NOT_FOUND });
      return;
    }
    
    const channelId = generateChannelId(socket.id, targetSocketId);
    
    const existingChannel = room.findPrivateChannel(channelId);
    if (existingChannel) {
      socket.emit(EVENTS.PRIVATE_CHANNEL_EXISTS, { channelId });
      return;
    }
    
    const newChannel = new PrivateChannel(channelId, socket.id, targetSocketId);
    room.addPrivateChannel(newChannel);
    
    const userInRoom = room.findUser(socket.id);
    const targetInRoom = room.findUser(targetSocketId);
    
    if (userInRoom && !userInRoom.privateChannels) userInRoom.privateChannels = [];
    if (targetInRoom && !targetInRoom.privateChannels) targetInRoom.privateChannels = [];
    
    userInRoom?.privateChannels.push(targetSocketId);
    targetInRoom?.privateChannels.push(socket.id);
    
    room.topology.connections.push({
      from: socket.id,
      to: targetSocketId
    });
    
    socket.emit(EVENTS.PRIVATE_CHANNEL_CREATED, {
      channelId,
      peer: targetUser
    });
    
    io.to(targetSocketId).emit(EVENTS.PRIVATE_CHANNEL_CREATED, {
      channelId,
      peer: userInRoom
    });
    
    io.to(room.host).emit(EVENTS.TOPOLOGY_UPDATED, {
      topology: room.topology,
      users: room.users
    });
    
    logger.privateChannelCreated(user.username, targetUser.username);
  });

  socket.on(EVENTS.SEND_PRIVATE_MESSAGE, (data) => {
    const { channelId, message } = parseData(data);
    const user = userService.findUser(socket.id);
    
    if (!user) return;
    
    const room = roomService.findRoom(user.roomId);
    if (!room) return;
    
    const channel = room.findPrivateChannel(channelId);
    if (!channel) {
      socket.emit(EVENTS.ERROR, { message: ERROR_MESSAGES.CHANNEL_NOT_FOUND });
      return;
    }
    
    if (!channel.isParticipant(socket.id)) {
      socket.emit(EVENTS.ERROR, { message: ERROR_MESSAGES.NOT_AUTHORIZED });
      return;
    }
    
    const messageObj = {
      id: Date.now(),
      channelId,
      username: user.username,
      socketId: socket.id,
      message,
      timestamp: new Date().toISOString()
    };
    
    channel.addMessage(messageObj);
    
    channel.participants.forEach(participantId => {
      io.to(participantId).emit(EVENTS.PRIVATE_MESSAGE_RECEIVED, messageObj);
    });
  });

  socket.on(EVENTS.CLOSE_PRIVATE_CHANNEL, (data) => {
    const { channelId } = parseData(data);
    const user = userService.findUser(socket.id);
    
    if (!user) return;
    
    const room = roomService.findRoom(user.roomId);
    if (!room) return;
    
    const channel = room.findPrivateChannel(channelId);
    if (!channel) return;
    
    room.removePrivateChannel(channelId);
    
    room.users.forEach(u => {
      if (u.privateChannels) {
        u.privateChannels = u.privateChannels.filter(
          id => !channel.participants.includes(id)
        );
      }
    });
    
    room.topology.connections = room.topology.connections.filter(
      conn => !(
        (conn.from === channel.participants[0] && conn.to === channel.participants[1]) ||
        (conn.from === channel.participants[1] && conn.to === channel.participants[0])
      )
    );
    
    channel.participants.forEach(participantId => {
      io.to(participantId).emit(EVENTS.PRIVATE_CHANNEL_CLOSED, { channelId });
    });
    
    io.to(room.host).emit(EVENTS.TOPOLOGY_UPDATED, {
      topology: room.topology,
      users: room.users
    });
  });

  socket.on(EVENTS.GET_TOPOLOGY, () => {
    const user = userService.findUser(socket.id);
    if (!user) return;
    
    const room = roomService.findRoom(user.roomId);
    if (!room) return;
    
    if (room.host !== socket.id) {
      socket.emit(EVENTS.ERROR, { message: ERROR_MESSAGES.ONLY_HOST });
      return;
    }
    
    socket.emit(EVENTS.TOPOLOGY_DATA, {
      topology: room.topology || { type: 'custom', connections: [] },
      users: room.users,
      privateChannels: room.privateChannels
    });
  });
}

module.exports = handlePrivateChannelEvents;
