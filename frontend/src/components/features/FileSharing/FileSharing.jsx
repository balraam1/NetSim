import { useState, useEffect } from "react"
import socket from "../../../socket"
import "../../../styles/features/FileSharing.css"

function FileSharing({ roomId, users, currentUsername }) {
  const [showModal, setShowModal] = useState(false)
  const [selectedRecipient, setSelectedRecipient] = useState(null)
  const [transfers, setTransfers] = useState([])
  const [incomingFile, setIncomingFile] = useState(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const [protocol, setProtocol] = useState("TCP")
  const [uploading, setUploading] = useState(false)

  // 🔥 Main useEffect - Socket listeners NEVER CLEANUP
  useEffect(() => {
    console.log("\n📂 ===== FileSharing MOUNTED =====");
    console.log(`✅ Socket connected: ${socket.connected}`);
    console.log(`🔌 Socket ID: ${socket.id}`);
    console.log(`👤 Username: ${currentUsername}`);
    console.log(`🏠 Room: ${roomId}`);
    console.log(`📊 Users in room: ${users.length}`);
    console.log("📂 ===== Starting listeners =====\n");

    const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:3001";

    // 🔥 Debug: Listen to ALL events
    const handleAnyEvent = (eventName, ...args) => {
      if (!eventName.includes('ping') && !eventName.includes('pong')) {
        console.log(`\n🔔 ANY EVENT RECEIVED: "${eventName}"`);
        console.log("Data:", args[0]);
      }
    };
    socket.onAny(handleAnyEvent);

    // 🔥 Listen for file transfer ready
    const handleFileTransferReady = (data) => {
      console.log(`\n${'='.repeat(60)}`);
      console.log("✅ FILE TRANSFER READY:");
      console.log(`${'='.repeat(60)}`);
      console.log(`🔌 Protocol: ${data.protocol}`);
      console.log(`🔌 Port: ${data.port}`);
      console.log(`🏠 Room: ${data.roomId}`);
      console.log(`📝 Message: ${data.message}`);
      console.log(`${'='.repeat(60)}\n`);
    };
    socket.on("file-transfer-ready", handleFileTransferReady);

    // 🔥 Listen for incoming files - MAIN EVENT
    const handleFileIncoming = (data) => {
      console.log(`\n${'='.repeat(60)}`);
      console.log("📥 ===== FILE-INCOMING EVENT RECEIVED =====");
      console.log(`${'='.repeat(60)}`);
      console.log(`📁 File: ${data.fileName}`);
      console.log(`📊 Size: ${(data.fileSize / 1024).toFixed(2)} KB`);
      console.log(`👤 From: ${data.fromUsername} (${data.fromUser})`);
      console.log(`🔌 Protocol: ${data.protocol}`);
      console.log(`🔗 Transfer ID: ${data.transferId}`);
      console.log(`🏠 Room: ${data.roomId}`);
      console.log(`⏱️  Timestamp: ${new Date().toISOString()}`);
      console.log(`${'='.repeat(60)}\n`);

      // 🔥 Browser notification
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification(`📥 ${data.fromUsername} sent: ${data.fileName}`, {
          tag: 'file-incoming',
          requireInteraction: true,
          icon: '📁'
        });
      }

      // 🔥 Show alert
      alert(`🔔 ${data.fromUsername} wants to send you: ${data.fileName}`);

      // Set incoming file state
      setIncomingFile(data);
    };
    socket.on("file-incoming", handleFileIncoming);

    // 🔥 Listen for file transfer accepted
    const handleFileTransferAccepted = (data) => {
      console.log(`\n${'='.repeat(60)}`);
      console.log("✅ FILE TRANSFER ACCEPTED");
      console.log(`${'='.repeat(60)}`);
      console.log(`🔗 Transfer ID: ${data.transferId}`);
      console.log(`🔌 Protocol: ${data.protocol}`);
      console.log(`🔌 Port: ${data.port}`);
      console.log(`📝 Status: ${data.status}`);
      console.log(`📝 Message: ${data.message}`);
      console.log(`⏱️  Timestamp: ${new Date().toISOString()}`);
      console.log(`${'='.repeat(60)}\n`);
    };
    socket.on("file-transfer-accepted", handleFileTransferAccepted);

    // 🔥 Listen for file received
    const handleFileReceived = (data) => {
      console.log(`\n${'='.repeat(60)}`);
      console.log("✅ FILE RECEIVED SUCCESSFULLY");
      console.log(`${'='.repeat(60)}`);
      console.log(`📁 File: ${data.fileName}`);
      console.log(`📊 Size: ${(data.bytesTransferred / 1024 / 1024).toFixed(2)} MB`);
      console.log(`🔌 Protocol: ${data.protocol}`);
      console.log(`🔗 Transfer ID: ${data.transferId}`);
      console.log(`🏠 Room: ${data.roomId}`);
      console.log(`✅ Status: ${data.status}`);
      console.log(`⏱️  Timestamp: ${data.timestamp}`);
      console.log(`${'='.repeat(60)}\n`);

      // Create download link
      const downloadLink = `${backendUrl}/uploads/${data.fileName}`;
      console.log(`📥 File available at: ${downloadLink}`);

      // Show success notification
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification(`✅ File received: ${data.fileName}`, {
          tag: 'file-received',
          requireInteraction: true,
          icon: '✅'
        });
      }

      // Show alert with download link
      alert(`✅ File received! Click to download: ${data.fileName}`);

      // Auto-download file
      try {
        const link = document.createElement("a");
        link.href = downloadLink;
        link.download = data.fileName;
        link.style.display = "none";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        console.log(`📥 Auto-download initiated for: ${data.fileName}`);
      } catch (e) {
        console.error(`❌ Auto-download failed: ${e.message}`);
      }

      // Update transfers list
      setTransfers((prev) => [
        ...prev,
        {
          fileName: data.fileName,
          protocol: data.protocol,
          status: "completed",
          type: "received",
          from: data.fromUsername || "Unknown",
          downloadLink: downloadLink,
          timestamp: data.timestamp,
          size: data.bytesTransferred
        }
      ]);
    };
    socket.on("file-received", handleFileReceived);

    // 🔥 Listen for chunk received (progress)
    const handleFileChunkReceived = (data) => {
      const progress = data.progress.toFixed(1);
      console.log(`📦 Transfer progress: ${progress}% (${data.chunkIndex + 1} chunks)`);
    };
    socket.on("file-chunk-received", handleFileChunkReceived);

    // 🔥 Listen for transfer status
    const handleTransferStatus = (data) => {
      console.log(`\n${'='.repeat(60)}`);
      console.log("📊 TRANSFER STATUS:");
      console.log(`${'='.repeat(60)}`);
      console.log(JSON.stringify(data, null, 2));
      console.log(`${'='.repeat(60)}\n`);
    };
    socket.on("transfer-status", handleTransferStatus);

    // 🔥 Listen for file rejected
    const handleFileTransferRejected = (data) => {
      console.log(`\n${'='.repeat(60)}`);
      console.log("❌ FILE TRANSFER REJECTED");
      console.log(`${'='.repeat(60)}`);
      console.log(`🔗 Transfer ID: ${data.transferId}`);
      console.log(`📝 Reason: ${data.reason}`);
      console.log(`${'='.repeat(60)}\n`);
      alert(`❌ File transfer rejected: ${data.reason}`);
    };
    socket.on("file-transfer-rejected", handleFileTransferRejected);

    // 🔥 Listen for transfer errors
    const handleFileTransferError = (data) => {
      console.error(`\n${'='.repeat(60)}`);
      console.error("❌ FILE TRANSFER ERROR");
      console.error(`${'='.repeat(60)}`);
      console.error(`🔗 Transfer ID: ${data.transferId}`);
      console.error(`🔌 Protocol: ${data.protocol}`);
      console.error(`📝 Error: ${data.error}`);
      console.error(`${'='.repeat(60)}\n`);
      alert(`❌ Transfer error: ${data.error}`);
    };
    socket.on("file-transfer-error", handleFileTransferError);

    // 🔥 NEW: Listen for file sent (sender's perspective)
    const handleFileSent = (data) => {
      console.log(`\n${'='.repeat(60)}`);
      console.log("✅ FILE SENT SUCCESSFULLY");
      console.log(`${'='.repeat(60)}`);
      console.log(`📁 File: ${data.fileName}`);
      console.log(`📊 Size: ${(data.bytesTransferred / 1024 / 1024).toFixed(2)} MB`);
      console.log(`🔌 Protocol: ${data.protocol}`);
      console.log(`🔗 Transfer ID: ${data.transferId}`);
      console.log(`⏱️  Timestamp: ${new Date().toISOString()}`);
      console.log(`${'='.repeat(60)}\n`);

      // Update transfers list - change from "sending" to "completed"
      setTransfers((prev) =>
        prev.map((t) =>
          t.fileName === data.fileName && t.status === "sending"
            ? { ...t, status: "completed" }
            : t
        )
      );
    };
    socket.on("file-sent", handleFileSent);

    // 🔥 Listen for generic errors
    const handleError = (data) => {
      console.error(`\n${'='.repeat(60)}`);
      console.error("❌ SOCKET ERROR");
      console.error(`${'='.repeat(60)}`);
      console.error(`📝 Message: ${data.message}`);
      console.error(`${'='.repeat(60)}\n`);
      alert(`❌ Error: ${data.message}`);
    };
    socket.on("error", handleError);

    // 🔥 CRITICAL: EMPTY CLEANUP - NO SOCKET.OFF()
    return () => {
      console.log("\n📂 FileSharing cleanup");
      // 🔥 DO NOT REMOVE ANY LISTENERS!
      // They need to persist for notifications to work
    };
  }, []); // 🔥 Empty array - runs ONCE on mount

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];
    if (!allowedTypes.includes(file.type)) {
      alert("Only PDF, JPEG, and PNG files are allowed");
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      alert("File size must be less than 50MB");
      return;
    }

    setSelectedFile(file);
    console.log(`📄 File selected: ${file.name} (${(file.size / 1024).toFixed(2)} KB)`);
  };

  const handleSendFile = async () => {
    if (!selectedFile || !selectedRecipient) {
      alert("Please select a file and recipient");
      return;
    }

    setUploading(true);

    try {
      console.log(`\n========== FILE TRANSFER INITIATED ==========`);
      console.log(`📁 File: ${selectedFile.name}`);
      console.log(`📊 Size: ${(selectedFile.size / 1024).toFixed(2)} KB`);
      console.log(`🔌 Protocol: ${protocol}`);
      console.log(`👤 To: ${selectedRecipient.username}`);
      console.log(`🏠 Room: ${roomId}`);
      console.log(`============================================\n`);

      // 🔥 Step 1: Initialize file transfer
      console.log(`🔥 Step 1: Initializing ${protocol} file transfer server...`);
      socket.emit("init-file-transfer", {
        roomId: roomId,
        protocol: protocol
      });

      // Wait for transfer to be ready
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error("File transfer server initialization timeout"));
        }, 10000);

        const handler = (data) => {
          console.log(`✅ Step 1 Complete: ${protocol} server ready on port ${data.port}`);
          socket.off("file-transfer-ready", handler);
          clearTimeout(timeout);
          resolve(data);
        };
        socket.on("file-transfer-ready", handler);
      });

      // 🔥 Step 2: Send file request
      console.log(`📤 Step 2: Sending file request to ${selectedRecipient.username}...`);
      socket.emit("send-file", {
        fileName: selectedFile.name,
        fileSize: selectedFile.size,
        protocol: protocol,
        recipientId: selectedRecipient.socketId,
        fromUsername: currentUsername,
        roomId: roomId
      });

      // Add to transfer history
      setTransfers((prev) => [
        ...prev,
        {
          fileName: selectedFile.name,
          protocol: protocol,
          status: "sending",
          to: selectedRecipient.username,
          type: "sent",
          timestamp: new Date()
        }
      ]);

      console.log(`✅ Step 2 Complete: File request sent to ${selectedRecipient.username}`);

      // Reset form
      setTimeout(() => {
        setSelectedFile(null);
        setShowModal(false);
        setUploading(false);
      }, 1000);
    } catch (error) {
      console.error("❌ Error:", error);
      alert("Error: " + error.message);
      setUploading(false);
    }
  };

  const handleAcceptFile = () => {
    if (incomingFile) {
      console.log(`\n========== FILE ACCEPTANCE ==========`);
      console.log(`✅ Accepting file: ${incomingFile.fileName}`);
      console.log(`📤 From: ${incomingFile.fromUsername}`);
      console.log(`🔌 Protocol: ${incomingFile.protocol}`);
      console.log(`=====================================\n`);

      socket.emit("accept-file", {
        transferId: incomingFile.transferId,
        protocol: incomingFile.protocol,
        port: 5000
      });

      // Update transfer history to show "accepted" status
      setTransfers((prev) => [
        ...prev,
        {
          fileName: incomingFile.fileName,
          protocol: incomingFile.protocol,
          status: "accepted",
          from: incomingFile.fromUsername,
          type: "received",
          timestamp: new Date()
        }
      ]);

      setIncomingFile(null);
    }
  };

  const handleRejectFile = () => {
    if (incomingFile) {
      console.log(`\n========== FILE REJECTION ==========`);
      console.log(`❌ Rejecting file: ${incomingFile.fileName}`);
      console.log(`📤 From: ${incomingFile.fromUsername}`);
      console.log(`======================================\n`);

      socket.emit("reject-file", {
        transferId: incomingFile.transferId
      });

      setIncomingFile(null);
    }
  };

  return (
    <div className="file-sharing-container">
      {/* File Transfer History */}
      <div className="transfer-history">
        <h3>📁 File Transfers</h3>
        {transfers.length === 0 ? (
          <p className="no-transfers">No file transfers yet</p>
        ) : (
          <div className="transfer-list">
            {transfers.map((transfer, idx) => (
              <div key={idx} className="transfer-item">
                <span className="transfer-icon">
                  {transfer.type === "received" ? "📥" : "📤"}
                </span>
                <div className="transfer-details">
                  <p className="transfer-name">{transfer.fileName}</p>
                  <p className="transfer-meta">
                    {transfer.protocol} • {transfer.to || transfer.from}
                  </p>
                </div>
                <span className={`transfer-status ${transfer.status}`}>
                  {transfer.status}
                </span>
                {/* 🔥 Download Link */}
                {transfer.downloadLink && transfer.status === "completed" && (
                  <a
                    href={transfer.downloadLink}
                    download={transfer.fileName}
                    className="download-link"
                    title="Download file"
                  >
                    ⬇️ Download
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Incoming File Notification */}
      {incomingFile && (
        <div className="incoming-file-notification">
          <div className="notification-content">
            <h4>📥 Incoming File</h4>
            <p>
              <strong>{incomingFile.fromUsername}</strong> wants to send you{" "}
              <strong>{incomingFile.fileName}</strong>
            </p>
            <p className="file-meta">
              Protocol: <strong>{incomingFile.protocol}</strong> • Size:{" "}
              <strong>{(incomingFile.fileSize / 1024).toFixed(2)} KB</strong>
            </p>
          </div>
          <div className="notification-actions">
            <button className="btn btn-danger" onClick={handleRejectFile}>
              Reject
            </button>
            <button className="btn btn-success" onClick={handleAcceptFile}>
              Accept
            </button>
          </div>
        </div>
      )}

      {/* Send File Section */}
      <div className="send-file-section">
        <h3>📤 Send File</h3>
        <div className="user-list">
          {users
            .filter((u) => u.username !== currentUsername)
            .map((user) => (
              <button
                key={user.socketId}
                className="user-btn"
                onClick={() => {
                  setSelectedRecipient(user);
                  setShowModal(true);
                  console.log(`📤 Selected recipient: ${user.username} (${user.socketId})`);
                }}
              >
                {user.username}
              </button>
            ))}
        </div>
      </div>

      {/* Upload Modal */}
      {showModal && selectedRecipient && (
        <div className="modal-overlay">
          <div className="modal-content file-upload-modal">
            <div className="modal-header">
              <h2>📤 Share File</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label>Select File (PDF, JPEG, PNG)</label>
                <input
                  type="file"
                  onChange={handleFileSelect}
                  accept=".pdf,.jpeg,.jpg,.png"
                  disabled={uploading}
                  className="file-input"
                />
                {selectedFile && (
                  <div className="file-info">
                    <p>📄 {selectedFile.name}</p>
                    <p className="file-size">
                      {(selectedFile.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                )}
              </div>

              <div className="form-group">
                <label>Select Protocol</label>
                <div className="protocol-selector">
                  <label className="radio-option">
                    <input
                      type="radio"
                      name="protocol"
                      value="TCP"
                      checked={protocol === "TCP"}
                      onChange={(e) => {
                        setProtocol(e.target.value);
                        console.log(`🔌 Protocol selected: ${e.target.value}`);
                      }}
                      disabled={uploading}
                    />
                    <span className="protocol-label">
                      <strong>TCP</strong>
                      <small>Reliable, ordered delivery</small>
                    </span>
                  </label>

                  <label className="radio-option">
                    <input
                      type="radio"
                      name="protocol"
                      value="UDP"
                      checked={protocol === "UDP"}
                      onChange={(e) => {
                        setProtocol(e.target.value);
                        console.log(`🔌 Protocol selected: ${e.target.value}`);
                      }}
                      disabled={uploading}
                    />
                    <span className="protocol-label">
                      <strong>UDP</strong>
                      <small>Fast, low latency</small>
                    </span>
                  </label>
                </div>
              </div>

              <div className="recipient-info">
                <p>📤 Sending to: <strong>{selectedRecipient.username}</strong></p>
                <p>Protocol: <strong>{protocol}</strong></p>
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setShowModal(false)}
                disabled={uploading}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleSendFile}
                disabled={!selectedFile || uploading}
              >
                {uploading ? "Sending..." : "Send File"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FileSharing;
