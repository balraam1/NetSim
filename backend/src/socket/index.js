const { Server } = require('socket.io');
const socketConfig = require('../config/socket.config');
const logger = require('../services/logger.service');

// Import all event handlers
const handleRoomEvents = require('./handlers/room.handler');
const handleChatEvents = require('./handlers/chat.handler');
const handleDisconnect = require('./handlers/connection.handler');
const handlePrivateChannelEvents = require('./handlers/privateChannel.handler');
const handleFileEvents = require('./handlers/file.handler'); // 🔥 NEW

function initializeSocket(server) {
  const io = new Server(server, socketConfig);
  
  io.on('connection', (socket) => {
    logger.success(`✅ User connected: ${socket.id}`);
    console.log(`🎯 Socket ID: ${socket.id}`);
    console.log(`📊 Active connections: ${io.engine.clientsCount}`);
    
    // Register all event handlers in order
    handleRoomEvents(io, socket);
    handleChatEvents(io, socket);
    handlePrivateChannelEvents(io, socket);
    handleFileEvents(io, socket); // 🔥 NEW: Register file transfer handler
    handleDisconnect(io, socket);

    // 🔥 NEW: Debug logging for all events
    socket.onAny((eventName, ...args) => {
      if (!eventName.startsWith('ping')) {
        console.log(`📡 Event: ${eventName}`, args.length > 0 ? args[0] : '');
      }
    });
  });

  // 🔥 NEW: Global error handler
  io.on('connect_error', (error) => {
    console.error(`❌ Socket.IO Connection Error:`, error);
  });

  // 🔥 NEW: Log active connections periodically
  setInterval(() => {
    const activeConnections = io.engine.clientsCount;
    if (activeConnections > 0) {
      console.log(`📊 Active Socket.IO Connections: ${activeConnections}`);
    }
  }, 30000); // Every 30 seconds

  return io;
}

module.exports = initializeSocket;
