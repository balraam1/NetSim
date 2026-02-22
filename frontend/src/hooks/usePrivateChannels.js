import { useState, useEffect, useCallback } from "react"
import socket from "../socket"

export function usePrivateChannels(mySocketId) {
  const [activeChannels, setActiveChannels] = useState([])
  const [selectedChannel, setSelectedChannel] = useState(null)
  const [channelMessages, setChannelMessages] = useState({})

  useEffect(() => {
    // Listen for private channel events
    socket.on("private-channel-created", (data) => {
      setActiveChannels(prev => [...prev, data])
      setChannelMessages(prev => ({
        ...prev,
        [data.channelId]: []
      }))
    })

    socket.on("private-message-received", (msg) => {
      setChannelMessages(prev => ({
        ...prev,
        [msg.channelId]: [...(prev[msg.channelId] || []), msg]
      }))
    })

    socket.on("private-channel-closed", (data) => {
      setActiveChannels(prev =>
        prev.filter(ch => ch.channelId !== data.channelId)
      )
      if (selectedChannel?.channelId === data.channelId) {
        setSelectedChannel(null)
      }
    })

    return () => {
      socket.off("private-channel-created")
      socket.off("private-message-received")
      socket.off("private-channel-closed")
    }
  }, [selectedChannel])

  const createChannel = useCallback((targetSocketId) => {
    socket.emit("create-private-channel", { targetSocketId })
  }, [])

  const sendPrivateMessage = useCallback((channelId, message) => {
    socket.emit("send-private-message", { channelId, message })
  }, [])

  const closeChannel = useCallback((channelId) => {
    socket.emit("close-private-channel", { channelId })
  }, [])

  return {
    activeChannels,
    selectedChannel,
    setSelectedChannel,
    channelMessages,
    createChannel,
    sendPrivateMessage,
    closeChannel
  }
}
