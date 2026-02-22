"use client"

import { useState } from "react"
import "../styles/Components.css"

function ChatInput({ onSend }) {
  const [message, setMessage] = useState("")

  const handleSend = () => {
    if (message.trim() && message.length <= 500) {
      onSend(message)
      setMessage("")
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="chat-input-container">
      <textarea
        className="chat-input"
        placeholder="Type a message..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyPress={handleKeyPress}
        maxLength="500"
        rows="2"
      />
      <button className="send-button" onClick={handleSend} disabled={!message.trim()}>
        Send
      </button>
    </div>
  )
}

export default ChatInput
