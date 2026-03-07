import TopologyCanvas from "./TopologyCanvas"
import "../../../styles/features/NetworkTopology.css"


function TopologyGraph({ topology }) {
  return (
    <div className="topology-container">
      <h3>Network Topology</h3>
      <div className="topology-info">
        <p>Users: {topology.users.length}</p>
        <p>Connections: {topology.connections.length}</p>
      </div>
      <TopologyCanvas topology={topology} />
    </div>
  )
}

export default TopologyGraph
