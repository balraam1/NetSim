const fs = require('fs');
const path = require('path');
const dgram = require('dgram');
const net = require('net');
const crypto = require('crypto');
const zlib = require('zlib');
const { EventEmitter } = require('events');

// Constants
const UPLOAD_DIR = path.join(__dirname, '../../uploads');
const CHUNK_SIZE = 1024 * 64; // 64KB chunks

// Error Types
const FileErrors = {
  INVALID_FILE: 'INVALID_FILE',
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  CHUNK_ERROR: 'CHUNK_ERROR',
  PORT_IN_USE: 'PORT_IN_USE',
  TRANSFER_TIMEOUT: 'TRANSFER_TIMEOUT'
};

// Create uploads directory if not exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  console.log(`📁 Created uploads directory: ${UPLOAD_DIR}`);
}

// Initialize a global file transfer event emitter
const FileEventEmitter = new EventEmitter();

class FileTransfer extends EventEmitter {
  constructor(transferId, roomId, protocol) {
    super();
    this.transferId = transferId;
    this.roomId = roomId;
    this.protocol = protocol;
    this.status = 'pending';
    this.startTime = Date.now();
    this.chunks = new Map();
    this.totalChunks = 0;
    this.receivedChunks = 0;
    this.fileSize = 0;
    this.checksum = null;
    this.timeout = setTimeout(() => this.cleanup(), 30 * 60 * 1000); // 30min timeout
    this.listeners = new Map();
  }

  updateProgress() {
    const progress = (this.receivedChunks / this.totalChunks) * 100;
    this.emit('progress', {
      transferId: this.transferId,
      progress: Math.round(progress),
      speed: this.calculateSpeed(),
      transferred: this.receivedChunks,
      total: this.totalChunks
    });
  }

  calculateSpeed() {
    const elapsed = (Date.now() - this.startTime) / 1000;
    return elapsed > 0 ? (this.receivedChunks * CHUNK_SIZE / 1024 / 1024 / elapsed).toFixed(2) : 0;
  }

  addChunk(chunkData) {
    this.chunks.set(chunkData.index, chunkData);
    this.receivedChunks++;
    this.updateProgress();

    if (this.receivedChunks === this.totalChunks) {
      this.completeTransfer();
    }
  }

  completeTransfer() {
    clearTimeout(this.timeout);
    const chunks = [...this.chunks.values()].sort((a, b) => a.index - b.index);
    const fileData = Buffer.concat(chunks.map(c => c.data));
    
    // Verify checksum
    const calculatedChecksum = crypto.createHash('sha256').update(fileData).digest('hex');
    if (calculatedChecksum !== this.checksum) {
      this.emit('error', { code: FileErrors.CHUNK_ERROR, message: 'Checksum verification failed' });
      return;
    }

    this.status = 'completed';
    this.emit('complete', { fileData, fileSize: fileData.length, duration: (Date.now() - this.startTime) / 1000 });
    FileEventEmitter.emit('transfer-complete', { transferId: this.transferId, fileSize: fileData.length });
  }

  cleanup() {
    clearTimeout(this.timeout);
    if (this.status !== 'completed') {
      this.emit('timeout', { transferId: this.transferId });
      FileEventEmitter.emit('transfer-timeout', { transferId: this.transferId });
    }
    this.destroy();
  }

  destroy() {
    this.removeAllListeners();
    this.chunks.clear();
    FileEventEmitter.emit('transfer-destroyed', { transferId: this.transferId });
  }
}

class FileService {
  constructor() {
    this.activeTransfers = new Map(); // Track ongoing transfers
    this.tcpServers = new Map();
    this.udpServers = new Map();

    // Global event listeners
    FileEventEmitter.on('transfer-complete', ({ transferId, fileSize }) => {
      console.log(`[${transferId}] Transfer complete: ${(fileSize / 1024 / 1024).toFixed(2)} MB`);
      this.cleanupTransfer(transferId);
    });
  }

  // 🔥 Initialize TCP server with chunking
  initTcpServer(roomId, port) {
    const server = net.createServer((socket) => {
      let transferId = null;
      let transfer = null;
      socket.setKeepAlive(true, 60000);
      socket.setTimeout(180000);

      socket.on('data', (chunk) => {
        try {
          const { type, data, index, total, filename, checksum } = JSON.parse(chunk.toString());
          
          if (type === 'init') {
            transferId = data.transferId;
            transfer = new FileTransfer(transferId, roomId, 'TCP');
            transfer.totalChunks = total;
            transfer.checksum = checksum;
            this.activeTransfers.set(transferId, transfer);
            
            console.log(`📤 TCP Transfer initiated: ${transferId} (${filename}, ${total} chunks)`);
          } else if (type === 'chunk' && transfer) {
            const chunkData = { index, data: Buffer.from(data, 'base64') };
            transfer.addChunk(chunkData);
          } else if (type === 'complete') {
            transfer.completeTransfer();
            socket.end();
          }
        } catch (error) {
          console.error(`❌ TCP Error: ${error.message}`);
          socket.end();
        }
      });

      socket.on('error', (err) => {
        console.error(`❌ TCP Socket Error [${transferId}]: ${err.message}`);
        if (transfer) transfer.cleanup();
        socket.end();
      });

      socket.on('timeout', () => {
        console.log(`⏱ TCP Transfer timeout: ${transferId}`);
        if (transfer) transfer.cleanup();
        socket.end();
      });

      socket.on('close', () => {
        console.log(`🔌 TCP Connection closed: ${socket.remoteAddress}:${socket.remotePort}`);
        if (transfer) transfer.cleanup();
      });
    });

    // Error handling for server-level issues
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        FileEventEmitter.emit('port-error', { code: FileErrors.PORT_IN_USE, port, roomId });
      } else {
        FileEventEmitter.emit('server-error', { code: FileErrors.SERVER_ERROR, error: err.message });
      }
      console.error(`❌ TCP Server Error [${roomId}]: ${err.message}`);
    });

    server.listen(port, '127.0.0.1', () => {
      console.log(`🔗 TCP Server listening for room ${roomId} on port ${port}`);
      this.tcpServers.set(roomId, server);
    });

    return server;
  }

  // 🔥 Initialize UDP server with chunking
  initUdpServer(roomId, port) {
    const server = dgram.createSocket('udp4');
    let activeTransfers = new Map();
    let totalChunks = 0;

    server.on('message', (msg, rinfo) => {
      try {
        const { type, data, index, total, filename, checksum } = JSON.parse(msg.toString());
        const transferId = `${rinfo.address}:${rinfo.port}`;

        if (type === 'init') {
          const transfer = new FileTransfer(transferId, roomId, 'UDP');
          transfer.totalChunks = total;
          transfer.checksum = checksum;
          activeTransfers.set(transferId, transfer);
          this.activeTransfers.set(transferId, transfer);
          
          console.log(`📡 UDP Transfer initiated: ${transferId} (${filename}, ${total} chunks)`);
        } else if (type === 'chunk' && activeTransfers.has(transferId)) {
          const transfer = activeTransfers.get(transferId);
          const chunkData = { index, data: Buffer.from(data, 'base64') };
          transfer.addChunk(chunkData);
        } else if (type === 'complete') {
          const transfer = activeTransfers.get(transferId);
          transfer.completeTransfer();
          activeTransfers.delete(transferId);
        }
      } catch (error) {
        console.error(`❌ UDP Error [${rinfo.address}:${rinfo.port}]: ${error.message}`);
      }
    });

    server.on('error', (err) => {
      FileEventEmitter.emit('udp-error', { code: err.code, roomId });
      console.error(`❌ UDP Server Error [${roomId}]: ${err.message}`);
    });

    server.bind(port, '127.0.0.1', () => {
      console.log(`📡 UDP Server listening for room ${roomId} on port ${port}`);
      this.udpServers.set(roomId, server);
    });

    return server;
  }

  // 🔥 Send file via TCP with chunking
  async sendFileTcp(file, host, port) {
    return new Promise((resolve, reject) => {
      const socket = net.createConnection(port, host, () => {
        const transferId = crypto.randomUUID();
        const fileStream = fs.createReadStream(file);
        let chunkIndex = 0;
        let totalChunks = Math.ceil(fs.statSync(file).size / CHUNK_SIZE);
        let checksum = crypto.createHash('sha256');

        socket.write(JSON.stringify({
          type: 'init',
          data: {
            transferId,
            filename: path.basename(file),
            fileSize: fs.statSync(file).size,
            total: totalChunks
          }
        }));

        fileStream.on('data', (chunk) => {
          checksum.update(chunk);
          const encodedChunk = chunk.toString('base64');
          socket.write(JSON.stringify({
            type: 'chunk',
            index: chunkIndex++,
            data: encodedChunk
          }));
        });

        fileStream.on('end', () => {
          socket.write(JSON.stringify({
            type: 'complete',
            checksum: checksum.digest('hex')
          }));
          resolve({ success: true, transferId, protocol: 'TCP' });
        });

        fileStream.on('error', (err) => reject(err));
        socket.on('error', (err) => reject(err));
      });
    });
  }

  // 🔥 Send file via UDP with chunking
  async sendFileUdp(file, host, port) {
    return new Promise((resolve, reject) => {
      const transferId = crypto.randomUUID();
      const socket = dgram.createSocket('udp4');
      const fileStream = fs.createReadStream(file);
      let chunkIndex = 0;
      let totalChunks = Math.ceil(fs.statSync(file).size / CHUNK_SIZE);
      let checksum = crypto.createHash('sha256');

      socket.send(JSON.stringify({
        type: 'init',
        data: {
          transferId,
          filename: path.basename(file),
          fileSize: fs.statSync(file).size,
          total: totalChunks
        }
      }), 0, Buffer.byteLength(Buffer.from(JSON.stringify({ type: 'init' }))), port, host);

      fileStream.on('data', (chunk) => {
        checksum.update(chunk);
        const encodedChunk = chunk.toString('base64');
        socket.send(JSON.stringify({
          type: 'chunk',
          index: chunkIndex++,
          data: encodedChunk
        }), 0, Buffer.byteLength(Buffer.from(JSON.stringify({ type: 'chunk' }))), port, host);
      });

      fileStream.on('end', () => {
        socket.send(JSON.stringify({
          type: 'complete',
          checksum: checksum.digest('hex')
        }), 0, Buffer.byteLength(Buffer.from(JSON.stringify({ type: 'complete' }))), port, host);
        socket.close();
        resolve({ success: true, transferId, protocol: 'UDP' });
      });

      fileStream.on('error', (err) => reject(err));
      socket.on('error', (err) => reject(err));
    });
  }

  // 🔥 Validate file
  validateFile(fileData) {
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    const maxFileSize = 50 * 1024 * 1024; // 50MB

    if (!allowedTypes.includes(fileData.mimeType)) {
      throw { code: FileErrors.INVALID_FILE, message: `Invalid file type. Allowed: ${allowedTypes.join(', ')}` };
    }
    if (fileData.fileSize > maxFileSize) {
      throw { code: FileErrors.FILE_TOO_LARGE, message: `File size exceeds ${maxFileSize / 1024 / 1024}MB limit` };
    }
    return { valid: true, size: fileData.fileSize, mimeType: fileData.mimeType };
  }

  // 🔥 Shutdown rooms
  shutdownRoom(roomId) {
    if (this.tcpServers.has(roomId)) {
      this.tcpServers.get(roomId).close(() => console.log(`🔌 TCP Server closed for room ${roomId}`));
      this.tcpServers.delete(roomId);
    }
    if (this.udpServers.has(roomId)) {
      this.udpServers.get(roomId).close(() => console.log(`📡 UDP Server closed for room ${roomId}`));
      this.udpServers.delete(roomId);
    }

    // Cleanup transfers related to the room
    this.activeTransfers.forEach((transfer, transferId) => {
      if (transfer.roomId === roomId) {
        transfer.cleanup();
        this.activeTransfers.delete(transferId);
      }
    });
  }

  // 🔥 Cleanup transfers
  cleanupTransfer(transferId) {
    const transfer = this.activeTransfers.get(transferId);
    if (transfer) {
      transfer.cleanup();
      this.activeTransfers.delete(transferId);
    }
  }

  // 🔥 Get transfer status
  getTransferStatus(transferId) {
    const transfer = this.activeTransfers.get(transferId);
    return transfer ? {
      transferId: transfer.transferId,
      status: transfer.status,
      progress: transfer.progress,
      speed: transfer.speed,
      transferred: transfer.transferred,
      total: transfer.total
    } : null;
  }

  // 🔥 Cancel transfer
  cancelTransfer(transferId) {
    const transfer = this.activeTransfers.get(transferId);
    if (transfer) {
      transfer.cleanup();
      return { success: true, message: `Transfer ${transferId} cancelled` };
    }
    return { success: false, message: `Transfer ${transferId} not found` };
  }

  // 🔥 Retry transfer
  retryTransfer(transferId) {
    const transfer = this.activeTransfers.get(transferId);
    if (transfer) {
      transfer.startTime = Date.now();
      transfer.receivedChunks = 0;
      transfer.chunks.clear();
      transfer.status = 'pending';
      return { success: true, message: `Transfer ${transferId} retrying...` };
    }
    return { success: false, message: `Transfer ${transferId} not found` };
  }
}

// Export the FileService instance
module.exports = new FileService();
