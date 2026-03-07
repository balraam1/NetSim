const fileService = require('../../services/file.service');
const path = require('path');
const fs = require('fs');

const fileStreams = new Map(); // Store write streams for active transfers

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

      console.log(`📡 File transfer initialized: ${protocol} @ port ${basePort}`);

    } catch (error) {
      console.error(`❌ Error initializing ${protocol} server:`, error.message);
      socket.emit('error', { message: error.message });
    }
  });

  // 🔥 Send file request
  socket.on('send-file', (data) => {
    const { roomId, fileName, fileSize, protocol, recipientId, fromUsername, transferId } = data;

    console.log(`\n${'='.repeat(60)}`);
    console.log(`📤 FILE SEND INITIATED`);
    console.log(`${'='.repeat(60)}`);
    console.log(`📁 File: ${fileName}`);
    console.log(`📊 Size: ${(fileSize / 1024).toFixed(2)} KB`);
    console.log(`🔌 Protocol: ${protocol}`);
    console.log(`👤 From: ${fromUsername} (${socket.id})`);
    console.log(`👥 To: ${recipientId}`);
    console.log(`🔗 Transfer ID: ${transferId}`);
    console.log(`🏠 Room: ${roomId}`);
    console.log(`${'='.repeat(60)}\n`);

    try {
      // Use provided transferId or generate one
      const finalTransferId = transferId || `${socket.id}-${Date.now()}`;

      io.to(recipientId).emit('file-incoming', {
        fromUser: socket.id,
        fromUsername,
        fileName,
        fileSize,
        protocol,
        roomId,
        transferId: finalTransferId
      });

      console.log(`✅ File incoming notification sent to ${recipientId}`);

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
    console.log(`💡 SOCKET ID: ${socket.id}`);

    // Notify the SENDER that the receiver has accepted
    // Use lastIndexOf to correctly parse socket ID in case it contains hyphens
    const lastHyphenIndex = transferId.lastIndexOf('-');
    const senderSocketId = lastHyphenIndex !== -1 ? transferId.substring(0, lastHyphenIndex) : transferId.split('-')[0];

    io.to(senderSocketId).emit('file-transfer-accepted', {
      transferId,
      protocol,
      port,
      status: 'ready'
    });

    console.log(`✅ Acceptance sent to sender: ${senderSocketId}`);
  });

  // 🔥 Reject file transfer
  socket.on('reject-file', (data) => {
    const { transferId } = data;
    const lastHyphenIndex = transferId.lastIndexOf('-');
    const senderSocketId = lastHyphenIndex !== -1 ? transferId.substring(0, lastHyphenIndex) : transferId.split('-')[0];

    io.to(senderSocketId).emit('file-transfer-rejected', {
      transferId,
      reason: 'User rejected'
    });
  });

  // 🔥 File chunk received (now actually writing to disk)
  socket.on('file-chunk', (data) => {
    const { transferId, chunkIndex, totalChunks, data: base64Data, fileName } = data;

    if (!fileStreams.has(transferId)) {
      const uploadsDir = path.join(__dirname, '../../../uploads');
      const filePath = path.join(uploadsDir, fileName);
      const writeStream = fs.createWriteStream(filePath);
      fileStreams.set(transferId, {
        stream: writeStream,
        fileName,
        filePath,
        chunksReceived: 0
      });
      console.log(`💾 Started writing file: ${fileName} (${transferId})`);
    }

    const transfer = fileStreams.get(transferId);
    if (transfer && transfer.stream) {
      const buffer = Buffer.from(base64Data, 'base64');
      transfer.stream.write(buffer);
      transfer.chunksReceived++;

      const progress = (transfer.chunksReceived / totalChunks) * 100;

      // Notify about progress
      socket.emit('file-chunk-received', {
        transferId,
        chunkIndex,
        progress: progress
      });
    }
  });

  // 🔥 Complete file transfer
  socket.on('file-transfer-complete', (data) => {
    const { transferId, roomId, fileName, bytesTransferred, protocol } = data;

    const transfer = fileStreams.get(transferId);
    if (transfer) {
      transfer.stream.end();
      fileStreams.delete(transferId);
      console.log(`✅ File finalized and saved: ${fileName}`);
    }

    // Broadcast to the whole room so everyone sees the history update and the receiver sees the download link
    io.to(roomId).emit('file-received', {
      transferId,
      fileName,
      bytesTransferred,
      protocol,
      status: 'completed',
      timestamp: new Date()
    });
  });

  // 🔥 File transfer error
  socket.on('file-transfer-error', (data) => {
    const { transferId, error, protocol } = data;
    console.error(`❌ FILE TRANSFER ERROR: ${error}`);

    if (fileStreams.has(transferId)) {
      const transfer = fileStreams.get(transferId);
      transfer.stream.end();
      fileStreams.delete(transferId);
    }

    io.emit('file-transfer-error', { transferId, error, protocol });
  });

  socket.on('disconnect', () => {
    console.log(`📂 File handler cleaned up for socket: ${socket.id}`);
  });
}

module.exports = handleFileEvents;
