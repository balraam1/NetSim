"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import socket from "../socket"
import "../styles/HomePage.css"

function HomePage() {
  const [mode, setMode] = useState("create")
  const [username, setUsername] = useState("")
  const [roomId, setRoomId] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const navigate = useNavigate()

  useEffect(() => {
    return () => {
      socket.off("room-created")
      socket.off("joined-room")
      socket.off("join-error")
    }
  }, [])

  const handleCreateRoom = () => {
    if (!username.trim()) {
      setError("Username is required")
      return
    }
    if (username.length > 20) {
      setError("Username must be 20 characters or less")
      return
    }

    setError("")
    setLoading(true)

    socket.connect()
    socket.emit("create-room", { username })

    socket.on("room-created", (data) => {
      setLoading(false)
      navigate(`/room/${data.roomId}`, { state: { ...data, username } })
    })

    socket.on("error", (data) => {
      setLoading(false)
      setError(data.message || "Error creating room")
    })
  }

  const handleJoinRoom = () => {
    if (!username.trim()) {
      setError("Username is required")
      return
    }
    if (username.length > 20) {
      setError("Username must be 20 characters or less")
      return
    }
    if (!roomId.trim()) {
      setError("Room ID is required")
      return
    }
    if (roomId.length !== 8) {
      setError("Room ID must be 8 characters")
      return
    }

    setError("")
    setLoading(true)

    socket.connect()
    socket.emit("join-room", { roomId: roomId.toUpperCase(), username })

    socket.on("joined-room", (data) => {
      setLoading(false)
      navigate(`/room/${data.roomId}`, { state: { ...data, username } })
    })

    socket.on("join-error", (data) => {
      setLoading(false)
      socket.disconnect()
      setError(data.message || "Failed to join room")
    })

    socket.on("error", (data) => {
      setLoading(false)
      socket.disconnect()
      setError(data.message || "Connection error")
    })
  }

  return (
    <div className="homepage-container">
      <div className="gradient-background"></div>

      <div className="card">
        <div className="card-header">
          <h1 className="app-title">NetSim</h1>
          <p className="app-subtitle">Enterprise Virtual Room Platform</p>
        </div>

        <div className="tab-switcher">
          <button
            className={`tab-button ${mode === "create" ? "active" : ""}`}
            onClick={() => {
              setMode("create")
              setRoomId("")
              setError("")
            }}
          >
            Create Room
          </button>
          <button
            className={`tab-button ${mode === "join" ? "active" : ""}`}
            onClick={() => {
              setMode("join")
              setError("")
            }}
          >
            Join Room
          </button>
        </div>

        {error && <div className="error-banner">{error}</div>}

        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            id="username"
            type="text"
            placeholder="Enter your username"
            maxLength="20"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={loading}
          />
        </div>

        {mode === "join" && (
          <div className="form-group">
            <label htmlFor="roomId">Room ID</label>
            <input
              id="roomId"
              type="text"
              placeholder="8-character code"
              maxLength="8"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value.toUpperCase())}
              disabled={loading}
            />
          </div>
        )}

        <button
          className={`primary-button ${loading ? "loading" : ""}`}
          onClick={mode === "create" ? handleCreateRoom : handleJoinRoom}
          disabled={loading}
        >
          {loading ? "Connecting..." : mode === "create" ? "Create Room" : "Join Room"}
        </button>
      </div>
    </div>
  )
}

export default HomePage
