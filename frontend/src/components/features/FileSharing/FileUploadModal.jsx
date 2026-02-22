import { useState } from "react"
import "../../../styles/features/FileSharing.css"

function FileUploadModal({ isOpen, onClose, onSend, recipientName }) {
  const [file, setFile] = useState(null)
  const [protocol, setProtocol] = useState("TCP")
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0]

    // Validate file type
    const allowedTypes = ["application/pdf", "image/jpeg", "image/png"]
    if (!allowedTypes.includes(selectedFile.type)) {
      alert("Only PDF, JPEG, and PNG files are allowed")
      return
    }

    // Validate file size (50MB)
    if (selectedFile.size > 50 * 1024 * 1024) {
      alert("File size must be less than 50MB")
      return
    }

    setFile(selectedFile)
  }

  const handleSend = async () => {
    if (!file) {
      alert("Please select a file")
      return
    }

    setUploading(true)
    setProgress(0)

    try {
      // Simulate upload progress
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(interval)
            return prev
          }
          return prev + Math.random() * 30
        })
      }, 300)

      // Call parent handler
      await onSend({
        file,
        protocol,
        recipientName
      })

      setProgress(100)
      setTimeout(() => {
        setUploading(false)
        setFile(null)
        setProgress(0)
        onClose()
      }, 500)
    } catch (error) {
      console.error("Upload error:", error)
      alert("Error sending file: " + error.message)
      setUploading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay">
      <div className="modal-content file-upload-modal">
        <div className="modal-header">
          <h2>📤 Share File</h2>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          {/* File Input */}
          <div className="form-group">
            <label>Select File (PDF, JPEG, PNG)</label>
            <input
              type="file"
              onChange={handleFileSelect}
              accept=".pdf,.jpeg,.jpg,.png"
              disabled={uploading}
              className="file-input"
            />
            {file && (
              <div className="file-info">
                <p>📄 {file.name}</p>
                <p className="file-size">
                  {(file.size / 1024).toFixed(2)} KB
                </p>
              </div>
            )}
          </div>

          {/* Protocol Selector */}
          <div className="form-group">
            <label>Select Protocol</label>
            <div className="protocol-selector">
              <label className="radio-option">
                <input
                  type="radio"
                  name="protocol"
                  value="TCP"
                  checked={protocol === "TCP"}
                  onChange={(e) => setProtocol(e.target.value)}
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
                  onChange={(e) => setProtocol(e.target.value)}
                  disabled={uploading}
                />
                <span className="protocol-label">
                  <strong>UDP</strong>
                  <small>Fast, low latency</small>
                </span>
              </label>
            </div>
          </div>

          {/* Recipient Info */}
          <div className="recipient-info">
            <p>📤 Sending to: <strong>{recipientName}</strong></p>
            <p>Protocol: <strong>{protocol}</strong></p>
          </div>

          {/* Progress Bar */}
          {uploading && (
            <div className="progress-bar-container">
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className="progress-text">{Math.round(progress)}%</p>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button
            className="btn btn-secondary"
            onClick={onClose}
            disabled={uploading}
          >
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={handleSend}
            disabled={!file || uploading}
          >
            {uploading ? "Sending..." : "Send File"}
          </button>
        </div>
      </div>
    </div>
  )
}

export default FileUploadModal
