import { useEffect, useRef } from "react"

function TopologyCanvas({ topology }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    if (!canvasRef.current || !topology.users.length) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    const width = canvas.width
    const height = canvas.height

    // Clear canvas
    ctx.fillStyle = "#f5f5f5"
    ctx.fillRect(0, 0, width, height)

    // Calculate node positions
    const centerX = width / 2
    const centerY = height / 2
    const radius = Math.min(width, height) / 3

    const nodePositions = {}
    topology.users.forEach((user, index) => {
      const angle = (index / topology.users.length) * 2 * Math.PI - Math.PI / 2
      nodePositions[user.socketId] = {
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
        username: user.username,
        role: user.role
      }
    })

    // Draw connections
    ctx.strokeStyle = "#6366f1"
    ctx.lineWidth = 2

    topology.connections.forEach(conn => {
      const from = nodePositions[conn.from]
      const to = nodePositions[conn.to]

      if (from && to) {
        ctx.beginPath()
        ctx.moveTo(from.x, from.y)
        ctx.lineTo(to.x, to.y)
        ctx.stroke()
      }
    })

    // Draw nodes
    topology.users.forEach(user => {
      const pos = nodePositions[user.socketId]
      if (!pos) return

      ctx.beginPath()
      ctx.arc(pos.x, pos.y, 25, 0, 2 * Math.PI)

      ctx.fillStyle =
        user.role === "host"
          ? "#f59e0b"
          : user.role === "admin"
            ? "#6366f1"
            : "#6b7280"
      ctx.fill()
      ctx.strokeStyle = "#fff"
      ctx.lineWidth = 3
      ctx.stroke()

      ctx.fillStyle = "#000"
      ctx.font = "12px Arial"
      ctx.textAlign = "center"
      ctx.fillText(user.username, pos.x, pos.y + 45)
    })
  }, [topology])

  return <canvas ref={canvasRef} width={800} height={600} className="topology-canvas" />
}

export default TopologyCanvas
