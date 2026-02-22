"use client"

import { useEffect, useRef } from "react"
import "../styles/Components.css"

function ChatWindow({ chatLog, username }) {
  const endOfMessagesRef = useRef(null)

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [chatLog])

  return (
    <div className="chat-window">
      {chatLog.length === 0 ? (
        <div className="empty-chat">
          <p className="empty-chat-text">No messages yet. Start the conversation</p>
        </div>
      ) : (
        <div className="messages-container">
          {chatLog.map((msg) => (
            <div key={msg.id} className={`message ${msg.username === username ? "own" : "other"}`}>
              <div className="message-content">
                {msg.username !== username && <p className="message-username">{msg.username}</p>}
                <p className="message-text">{msg.message}</p>
                <p className="message-timestamp">
                  {new Date(msg.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          ))}
          <div ref={endOfMessagesRef} />
        </div>
      )}
    </div>
  )
}

export default ChatWindow
