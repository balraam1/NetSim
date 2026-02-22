import { useState, useEffect, useRef } from "react"
import "../../../styles/features/PrivateChannels.css"

function PrivateChat({ selectedChannel, messages, mySocketId, onSendMessage }) {
  const [messageInput, setMessageInput] = useState("")
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = () => {
    if (!messageInput.trim() || !selectedChannel) return
    onSendMessage(selectedChannel.channelId, messageInput)
    setMessageInput("")
  }

  if (!selectedChannel) {
    return (
      <div className="no-channel-selected">
        <p>Select a channel to start chatting</p>
      </div>
    )
  }

  return (
    <div className="private-chat-container">
      <h3>💬 Private Chat with {selectedChannel.peer.username}</h3>

      <div className="messages">
        {(messages || []).map(msg => (
          <div
            key={msg.id}
            className={`message ${msg.socketId === mySocketId ? "own" : "peer"}`}
          >
            <span className="username">{msg.username}</span>
            <p>{msg.message}</p>
            <span className="timestamp">
              {new Date(msg.timestamp).toLocaleTimeString()}
            </span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="input-area">
        <input
          type="text"
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSend()}
          placeholder="Type a private message..."
          maxLength={500}
        />
        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  )
}

export default PrivateChat
