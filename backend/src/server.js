const express = require('express');
const http = require('http');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
const config = require('./config/environment');
const apiRoutes = require('./routes/api.routes');
const initializeSocket = require('./socket');
const fileService = require('./services/file.service');
const logger = require('./services/logger.service');

const app = express();
const server = http.createServer(app);

// ============================================================
// MIDDLEWARE CONFIGURATION
// ============================================================

app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(morgan('dev'));

// 🔥 Request logging middleware
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.path}`);
  next();
});

// ============================================================
// FILE STORAGE SETUP
// ============================================================

const uploadsDir = path.join(__dirname, '../uploads');

// Create uploads directory if not exists
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log(`📁 Created uploads directory: ${uploadsDir}`);
}

// 🔥 Serve uploaded files as static assets
app.use('/uploads', express.static(uploadsDir));

// ============================================================
// ROUTES
// ============================================================

app.use('/api', apiRoutes);
app.use('/', apiRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    server: 'NetSim',
    version: '1.0.0',
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    activeTransfers: fileService.activeTransfers.size,
    tcpServers: fileService.tcpServers.size,
    udpServers: fileService.udpServers.size
  });
});

// 🔥 Info endpoint
app.get('/info', (req, res) => {
  res.json({
    name: 'NetSim Backend',
    version: '1.0.0',
    description: 'Real-time collaboration platform with file transfer',
    features: [
      'Real-time messaging',
      'Virtual rooms',
      'TCP/UDP file transfer',
      'Network visualization',
      'Voice processing'
    ]
  });
});

// 🔥 Download endpoint to force "Save As"
app.get('/api/download/:filename', (req, res) => {
  const fileName = req.params.filename;
  const filePath = path.join(uploadsDir, fileName);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'File not found' });
  }

  res.download(filePath, fileName, (err) => {
    if (err) {
      console.error('❌ Download error:', err);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Could not download the file' });
      }
    }
  });
});

// 🔥 File list endpoint
app.get('/uploads', (req, res) => {
  fs.readdir(uploadsDir, (err, files) => {
    if (err) {
      return res.status(500).json({ error: 'Unable to read uploads directory' });
    }
    const fileList = files.map(file => ({
      name: file,
      url: `/uploads/${file}`,
      path: path.join(uploadsDir, file)
    }));
    res.json({ files: fileList, count: files.length });
  });
});

// 🔥 404 handler
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found',
    path: req.path
  });
});

// 🔥 Error handling middleware
app.use((err, req, res, next) => {
  console.error(`❌ Error:`, err.message);
  res.status(err.status || 500).json({
    status: 'error',
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// ============================================================
// SOCKET.IO INITIALIZATION
// ============================================================

initializeSocket(server);

// ============================================================
// GRACEFUL SHUTDOWN
// ============================================================

const gracefulShutdown = () => {
  console.log('\n🛑 Shutting down gracefully...');

  try {
    // Close all file transfer servers
    const tcpRooms = Array.from(fileService.tcpServers.keys());
    const udpRooms = Array.from(fileService.udpServers.keys());

    tcpRooms.forEach((roomId) => {
      fileService.shutdownRoom(roomId);
      console.log(`🧹 Cleaned up TCP room: ${roomId}`);
    });

    udpRooms.forEach((roomId) => {
      fileService.shutdownRoom(roomId);
      console.log(`🧹 Cleaned up UDP room: ${roomId}`);
    });

    // Clean up old transfers
    fileService.activeTransfers.forEach((transfer, transferId) => {
      transfer.cleanup();
      console.log(`🧹 Cleaned up transfer: ${transferId}`);
    });

    // Close server
    server.close(() => {
      console.log('✅ HTTP Server closed');
      process.exit(0);
    });

    // Force exit after 10 seconds
    setTimeout(() => {
      console.error('❌ Forced shutdown after timeout');
      process.exit(1);
    }, 10000);

  } catch (error) {
    console.error(`❌ Error during shutdown: ${error.message}`);
    process.exit(1);
  }
};

// Handle shutdown signals
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// ============================================================
// GLOBAL ERROR HANDLERS
// ============================================================

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection:');
  console.error('   Promise:', promise);
  console.error('   Reason:', reason);
  logger.error(`Unhandled Rejection: ${reason}`);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  logger.error(`Uncaught Exception: ${error.message}`);
  gracefulShutdown();
});

// ============================================================
// SERVER STARTUP
// ============================================================

const PORT = config.PORT || 3001;
const HOST = config.HOST || '0.0.0.0';

server.listen(PORT, HOST, () => {
  logger.success(`✅ NetSim Server running at http://${HOST}:${PORT}`);
  logger.info(`📊 Environment: ${config.NODE_ENV}`);
  logger.info(`📁 Uploads directory: ${uploadsDir}`);
  logger.info(`🔗 Socket.IO enabled`);
  logger.info(`📡 TCP/UDP file transfer ready`);

  console.log(`
    ╔═══════════════════════════════════════════╗
    ║    🚀 NetSim Server Ready! 🚀        ║
    ╠═══════════════════════════════════════════╣
    ║ 🌐 HTTP/Socket.IO                        ║
    ║ 📡 TCP/UDP File Transfer (Chunking)      ║
    ║ 📝 Real-time Collaboration               ║
    ║ 💾 File Storage: ${uploadsDir}  ║
    ║ 🔌 Port: ${PORT}                            ║
    ╚═══════════════════════════════════════════╝
  `);
});

// ============================================================
// EXPORTS
// ============================================================

module.exports = { app, server };
