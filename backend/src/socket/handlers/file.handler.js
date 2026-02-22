const fileService = require('../../services/file.service');
const path = require('path');

function handleFileEvents(io, socket) {
  console.log(`📂 File handler registered for socket: ${socket.id}`);

  // 🔥 Initialize file transfer for a room
  socket.on('init-file-transfer', async (data) => {
    const { roomId, protocol } = data;

    if (!roomId || !protocol) {
      console.error('❌ Missing roomId or protocol');
      socket.emit('error', { message: 'Missing roomId or protocol' });
      return;
    }

    try {
      const basePort = 5000 + Math.floor(Math.random() * 1000);

      console.log(`\n${'='.repeat(60)}`);
      console.log(`🔥 INITIALIZING ${protocol} FILE TRANSFER SERVER`);
      console.log(`${'='.repeat(60)}`);
      console.log(`📍 Room: ${roomId}`);
      console.log(`🔌 Port: ${basePort}`);
      console.log(`👤 Socket: ${socket.id}`);
      console.log(`${'='.repeat(60)}\n`);

      if (protocol === 'TCP') {
        await fileService.initTcpServer(roomId, basePort);
        console.log(`✅ TCP Server initialized on port ${basePort}`);
      } else if (protocol === 'UDP') {
        await fileService.initUdpServer(roomId, basePort);
        console.log(`✅ UDP Server initialized on port ${basePort}`);
      }

      socket.emit('file-transfer-ready', {
        protocol,
        port: basePort,
        roomId,
        message: `${protocol} server ready on port ${basePort}`
      });

      // 🔥 REMOVED: logger.fileTransfer() - replace with console
      console.log(`📡 File transfer initialized: ${protocol} @ port ${basePort}`);

    } catch (error) {
      console.error(`❌ Error initializing ${protocol} server:`, error.message);
      socket.emit('error', { message: error.message });
    }
  });

  // 🔥 Send file request
  socket.on('send-file', (data) => {
    const { roomId, fileName, fileSize, protocol, recipientId, fromUsername } = data;

    console.log(`\n${'='.repeat(60)}`);
    console.log(`📤 FILE SEND INITIATED`);
    console.log(`${'='.repeat(60)}`);
    console.log(`📁 File: ${fileName}`);
    console.log(`📊 Size: ${(fileSize / 1024).toFixed(2)} KB`);
    console.log(`🔌 Protocol: ${protocol}`);
    console.log(`👤 From: ${fromUsername} (${socket.id})`);
    console.log(`👥 To: ${recipientId}`);
    console.log(`🏠 Room: ${roomId}`);
    console.log(`⏱️  Timestamp: ${new Date().toISOString()}`);
    console.log(`${'='.repeat(60)}\n`);

    try {
      fileService.validateFile({
        fileName,
        fileSize,
        mimeType: 'application/pdf'
      });

      io.to(recipientId).emit('file-incoming', {
        fromUser: socket.id,
        fromUsername,
        fileName,
        fileSize,
        protocol,
        roomId,
        transferId: `${socket.id}-${Date.now()}`
      });

      console.log(`✅ File incoming notification sent to ${recipientId}`);
      // 🔥 REMOVED: logger.fileTransfer()

    } catch (error) {
      console.error(`❌ Error sending file:`, error.message);
      socket.emit('error', { message: error.message });
    }
  });

  // 🔥 Accept file transfer
  socket.on('accept-file', (data) => {
    const { transferId, protocol, port } = data;

    console.log(`\n${'='.repeat(60)}`);
    console.log(`✅ FILE TRANSFER ACCEPTED`);
    console.log(`${'='.repeat(60)}`);
    console.log(`🔗 Transfer ID: ${transferId}`);
    console.log(`🔌 Protocol: ${protocol}`);
    console.log(`🔌 Port: ${port}`);
    console.log(`📍 Socket ID: ${socket.id}`);
    console.log(`⏱️  Timestamp: ${new Date().toISOString()}`);
    console.log(`${'='.repeat(60)}\n`);

    socket.emit('file-transfer-accepted', {
      transferId,
      protocol,
      port,
      status: 'ready',
      message: `Ready to receive on port ${port}`
    });

    // 🔥 REMOVED: logger.fileTransfer()
  });

  // 🔥 Reject file transfer
  socket.on('reject-file', (data) => {
    const { transferId } = data;

    console.log(`\n${'='.repeat(60)}`);
    console.log(`❌ FILE TRANSFER REJECTED`);
    console.log(`${'='.repeat(60)}`);
    console.log(`🔗 Transfer ID: ${transferId}`);
    console.log(`📍 Socket ID: ${socket.id}`);
    console.log(`⏱️  Timestamp: ${new Date().toISOString()}`);
    console.log(`${'='.repeat(60)}\n`);

    io.emit('file-transfer-rejected', {
      transferId,
      reason: 'User rejected'
    });

    // 🔥 REMOVED: logger.fileTransfer()
  });

  // 🔥 File chunk received
  socket.on('file-chunk', (data) => {
    const { transferId, chunkIndex, totalChunks, chunkSize } = data;

    console.log(`📦 Chunk ${chunkIndex + 1}/${totalChunks} (${chunkSize} bytes) - ${((chunkIndex + 1) / totalChunks * 100).toFixed(1)}%`);

    io.emit('file-chunk-received', {
      transferId,
      chunkIndex,
      progress: ((chunkIndex + 1) / totalChunks) * 100
    });
  });

  // 🔥 Get transfer status
  socket.on('get-transfer-status', (data) => {
    const { transferId } = data;
    const status = fileService.getTransferStatus(transferId);

    console.log(`📊 Transfer Status Query: ${transferId}`);
    console.log(`Status:`, status);

    socket.emit('transfer-status', status || { error: 'Transfer not found' });
  });

  // 🔥 Retry transfer
  socket.on('retry-transfer', (data) => {
    const { transferId } = data;
    const result = fileService.retryTransfer(transferId);

    console.log(`🔄 Transfer Retry: ${result.message}`);
    socket.emit('transfer-retry', result);
  });

  // 🔥 Cancel transfer
  socket.on('cancel-transfer', (data) => {
    const { transferId } = data;
    const result = fileService.cancelTransfer(transferId);

    console.log(`🛑 Transfer Cancelled: ${result.message}`);
    socket.emit('transfer-cancel', result);
  });




  // 🔥 Send file request
socket.on('send-file', (data) => {
  const { roomId, fileName, fileSize, protocol, recipientId, fromUsername } = data;

  console.log(`\n${'='.repeat(60)}`);
  console.log(`📤 FILE SEND INITIATED`);
  console.log(`${'='.repeat(60)}`);
  console.log(`📁 File: ${fileName}`);
  console.log(`📊 Size: ${(fileSize / 1024).toFixed(2)} KB`);
  console.log(`🔌 Protocol: ${protocol}`);
  console.log(`👤 From: ${fromUsername} (${socket.id})`);
  console.log(`👥 To: ${recipientId}`);
  console.log(`🏠 Room: ${roomId}`);
  console.log(`⏱️  Timestamp: ${new Date().toISOString()}`);
  console.log(`${'='.repeat(60)}\n`);

  try {
    fileService.validateFile({
      fileName,
      fileSize,
      mimeType: 'application/pdf'
    });

    // 🔥 VERIFY RECIPIENT SOCKET EXISTS
    const recipientSocket = io.sockets.sockets.get(recipientId);
    
    if (!recipientSocket) {
      console.error(`❌ Recipient socket NOT found: ${recipientId}`);
      console.log(`📍 Available sockets in room ${roomId}:`);
      
      const roomSockets = io.sockets.adapter.rooms.get(roomId);
      if (roomSockets) {
        roomSockets.forEach((sid) => {
          console.log(`   - ${sid}`);
        });
      }
      
      socket.emit('error', { message: `Recipient not connected` });
      return;
    }

    console.log(`✅ Recipient socket VERIFIED: ${recipientId}`);

    // 🔥 SEND TO RECIPIENT
    io.to(recipientId).emit('file-incoming', {
      fromUser: socket.id,
      fromUsername,
      fileName,
      fileSize,
      protocol,
      roomId,
      transferId: `${socket.id}-${Date.now()}`
    });

    console.log(`✅ File incoming notification sent to ${recipientId}`);

  } catch (error) {
    console.error(`❌ Error sending file:`, error.message);
    socket.emit('error', { message: error.message });
  }
});



  // 🔥 Complete file transfer
  socket.on('file-transfer-complete', (data) => {
    const { transferId, roomId, fileName, bytesTransferred, protocol } = data;

    console.log(`\n${'='.repeat(60)}`);
    console.log(`✅ FILE TRANSFER COMPLETE`);
    console.log(`${'='.repeat(60)}`);
    console.log(`📁 File: ${fileName}`);
    console.log(`📊 Total Size: ${(bytesTransferred / 1024 / 1024).toFixed(2)} MB`);
    console.log(`🔌 Protocol: ${protocol}`);
    console.log(`🔗 Transfer ID: ${transferId}`);
    console.log(`🏠 Room: ${roomId}`);
    console.log(`⏱️  Timestamp: ${new Date().toISOString()}`);
    console.log(`${'='.repeat(60)}\n`);

    io.to(roomId).emit('file-received', {
      transferId,
      fileName,
      bytesTransferred,
      protocol,
      status: 'completed',
      timestamp: new Date()
    });

    // 🔥 REMOVED: logger.fileTransfer()
  });

  // 🔥 File transfer error
  socket.on('file-transfer-error', (data) => {
    const { transferId, error, protocol } = data;

    console.error(`\n${'='.repeat(60)}`);
    console.error(`❌ FILE TRANSFER ERROR`);
    console.error(`${'='.repeat(60)}`);
    console.error(`🔗 Transfer ID: ${transferId}`);
    console.error(`🔌 Protocol: ${protocol}`);
    console.error(`📝 Error: ${error}`);
    console.error(`📍 Socket ID: ${socket.id}`);
    console.error(`⏱️  Timestamp: ${new Date().toISOString()}`);
    console.error(`${'='.repeat(60)}\n`);

    io.emit('file-transfer-error', {
      transferId,
      error,
      protocol
    });

    // 🔥 REMOVED: logger.fileTransfer()
  });



  

  // 🔥 Disconnect cleanup
  socket.on('disconnect', () => {
    console.log(`📂 File handler cleaned up for socket: ${socket.id}`);
  });
}

module.exports = handleFileEvents;
