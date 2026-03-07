"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { useNavigate, useParams, useLocation } from "react-router-dom"
import socket from "../socket"
import UsersList from "../components/UsersList"
import ChatWindow from "../components/ChatWindow"
import ChatInput from "../components/ChatInput"

// NEW FEATURE IMPORTS
import PrivateChannelManager from "../components/features/PrivateChannels/PrivateChannelManager"
import TopologyGraph from "../components/features/NetworkTopology/TopologyGraph"
import FileSharing from "../components/features/FileSharing/FileSharing"
import { usePrivateChannels } from "../hooks/usePrivateChannels"
import { useTopology } from "../hooks/useTopology"

import "../styles/RoomPage.css"

function RoomPage() {
  const { roomId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()

  // State Management
  const [users, setUsers] = useState([])
  const [chatLog, setChatLog] = useState([])
  const [role, setRole] = useState("")
  const [username, setUsername] = useState(location.state?.username || "Anonymous")
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("public")

  // Feature Hooks
  const privateChannels = usePrivateChannels(socket.id)
  const topology = useTopology(role === "host")

  // 🔥 CRITICAL FIX: Force state update by creating NEW array reference
  const updateUsers = useCallback((newUsers) => {
    setUsers([...newUsers])
  }, [])

  const updateChatLog = useCallback((newMessage) => {
    setChatLog((prev) => [...prev, newMessage])
  }, [])

  useEffect(() => {
    if (!socket.connected) {
      console.log("🔄 Socket connecting...");
      socket.connect();
    }

    const onRoomInfo = (data) => {
      console.log("📋 Room Info Received:", data);
      setUsers([...(data?.users || [])]);
      setChatLog([...(data?.chatLog || [])]);
      setRole(data?.myRole || "member");
      setLoading(false);
    };

    const onNewMessage = (message) => {
      console.log("💬 New Message:", message);
      updateChatLog(message);
    };

    const onUserJoined = (data) => {
      console.log("✅ User Joined:", data);
      const updatedUsers = data?.users || [];
      console.log("📊 Updated users count:", updatedUsers.length);
      updateUsers(updatedUsers);
    };

    const onUserLeft = (data) => {
      console.log("👋 User Left:", data);
      const remainingUsers = data?.remainingUsers || [];
      console.log("📊 Remaining users count:", remainingUsers.length);
      updateUsers(remainingUsers);
    };

    const onRoomClosed = (data) => {
      console.log("🔒 Room Closed:", data);
      alert(data?.message || "Room has been closed");
      navigate("/");
    };

    const onRoomError = (data) => {
      console.error("❌ Room Error:", data);
      navigate("/home");
    };

    socket.emit("get-room-info");

    socket.on("room-info", onRoomInfo);
    socket.on("new-message", onNewMessage);
    socket.on("user-joined", onUserJoined);
    socket.on("user-left", onUserLeft);
    socket.on("room-closed", onRoomClosed);
    socket.on("room-error", onRoomError);

    return () => {
      console.log("🧹 Cleaning up RoomPage listeners");
      socket.off("room-info", onRoomInfo);
      socket.off("new-message", onNewMessage);
      socket.off("user-joined", onUserJoined);
      socket.off("user-left", onUserLeft);
      socket.off("room-closed", onRoomClosed);
      socket.off("room-error", onRoomError);
    };
  }, [updateUsers, updateChatLog, navigate]);

  // Handle send message
  const handleSendMessage = (message) => {
    if (!message.trim()) return
    socket.emit("send-message", { message })
  }

  // Handle leave room
  const handleLeaveRoom = () => {
    console.log("🚪 Leaving room...")
    socket.disconnect()
    navigate("/")
  }

  // Memoize private channel props
  const privateChannelProps = useMemo(() => ({
    users,
    mySocketId: socket.id,
    activeChannels: privateChannels?.activeChannels || [],
    selectedChannel: privateChannels?.selectedChannel,
    setSelectedChannel: privateChannels?.setSelectedChannel,
    channelMessages: privateChannels?.channelMessages || {},
    onCreateChannel: privateChannels?.createChannel,
    onSendPrivateMessage: privateChannels?.sendPrivateMessage,
    onCloseChannel: privateChannels?.closeChannel
  }), [users, socket.id, privateChannels])

  // Show loading state
  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loader"></div>
        <p>Loading room...</p>
      </div>
    )
  }

  return (
    <div className="room-page">
      {/* Header Section */}
      <header className="room-header">
        <div className="header-left">
          <h1 className="logo">NetSim</h1>
          <div className="room-info">
            <span className="room-id-label">Room:</span>
            <span className="room-id">{roomId}</span>
            <button
              className="copy-button"
              onClick={() => {
                navigator.clipboard.writeText(roomId)
                alert("Room ID copied to clipboard!")
              }}
              title="Copy Room ID"
            >
              Copy
            </button>
          </div>
        </div>
        <div className="header-right">
          <span className={`role-badge role-${role.toLowerCase()}`}>
            {role.toUpperCase()}
          </span>
          <button className="leave-button" onClick={handleLeaveRoom}>
            Leave Room
          </button>
        </div>
      </header>

      {/* Feature Tabs Navigation */}
      <nav className="feature-tabs">
        <button
          className={`tab-button ${activeTab === "public" ? "active" : ""}`}
          onClick={() => setActiveTab("public")}
        >
          Public Chat
        </button>
        <button
          className={`tab-button ${activeTab === "private" ? "active" : ""}`}
          onClick={() => setActiveTab("private")}
        >
          Private Channels
        </button>
        {/* 🔥 NEW TAB: File Sharing */}
        <button
          className={`tab-button ${activeTab === "files" ? "active" : ""}`}
          onClick={() => setActiveTab("files")}
        >
          File Sharing
        </button>
        {role === "host" && (
          <button
            className={`tab-button ${activeTab === "topology" ? "active" : ""}`}
            onClick={() => setActiveTab("topology")}
          >
            Network Graph
          </button>
        )}
      </nav>

      {/* Main Content Area */}
      <div className="room-content">
        {/* PUBLIC CHAT TAB */}
        {activeTab === "public" && (
          <>
            {/* Users Sidebar */}
            <aside className="sidebar">
              <div className="sidebar-title">
                Participants ({users.length || 0}/10)
              </div>
              <UsersList users={users || []} />
            </aside>

            {/* Chat Container */}
            <div className="chat-container">
              <ChatWindow
                chatLog={chatLog || []}
                username={username}
              />
              <ChatInput onSend={handleSendMessage} />
            </div>
          </>
        )}

        {/* PRIVATE CHANNELS TAB */}
        {activeTab === "private" && (
          <div style={{ display: "flex", flex: 1, padding: "20px", overflowY: "auto", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <PrivateChannelManager {...privateChannelProps} />
          </div>
        )}

        {/* 🔥 FILE SHARING TAB (NEW - ALWAYS MOUNTED) */}
        <div style={{ display: activeTab === "files" ? "flex" : "none", flex: 1, padding: "20px", overflowY: "auto", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <FileSharing
            key={roomId}
            roomId={roomId}
            users={users}
            currentUsername={username}
            protocol="TCP"
            onProtocolChange={(protocol) => console.log("Protocol changed to:", protocol)}
          />
        </div>

        {/* NETWORK TOPOLOGY TAB (Host Only) */}
        {activeTab === "topology" && role === "host" && (
          <div style={{ display: "flex", flex: 1, padding: "20px", overflowY: "auto", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <TopologyGraph
              topology={topology || { connections: [], users: [] }}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default RoomPage
