import { useState, useEffect, useCallback } from "react"
import socket from "../socket"

export function useTopology(isHost) {
  const [topology, setTopology] = useState({ connections: [], users: [] })

  useEffect(() => {
    if (!isHost) return

    socket.emit("get-topology")

    socket.on("topology-data", (data) => {
      setTopology({
        connections: data.topology.connections,
        users: data.users
      })
    })

    socket.on("topology-updated", (data) => {
      setTopology({
        connections: data.topology.connections,
        users: data.users
      })
    })

    return () => {
      socket.off("topology-data")
      socket.off("topology-updated")
    }
  }, [isHost])

  return topology
}
