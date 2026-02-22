import "../../../styles/features/PrivateChannels.css"

function PrivateChannelSidebar({
  users,
  mySocketId,
  activeChannels,
  selectedChannel,
  onSelectChannel,
  onCreateChannel,
  onCloseChannel
}) {
  const availableUsers = users
    .filter(u => u.socketId !== mySocketId)
    .filter(u => !activeChannels.some(ch => ch.peer.socketId === u.socketId))

  return (
    <aside className="private-channel-sidebar">
      <h3>🔒 Private Channels</h3>

      {availableUsers.length > 0 && (
        <div className="available-users">
          <h4>Connect With:</h4>
          {availableUsers.map(user => (
            <div key={user.socketId} className="user-connect-item">
              <span>{user.username}</span>
              <button
                onClick={() => onCreateChannel(user.socketId)}
                className="connect-btn"
              >
                +
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="active-channels">
        <h4>Active Channels:</h4>
        {activeChannels.length === 0 ? (
          <p className="no-channels">No active channels</p>
        ) : (
          activeChannels.map(channel => (
            <div
              key={channel.channelId}
              className={`channel-item ${
                selectedChannel?.channelId === channel.channelId ? "selected" : ""
              }`}
              onClick={() => onSelectChannel(channel)}
            >
              <span>{channel.peer.username}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onCloseChannel(channel.channelId)
                }}
                className="close-btn"
              >
                ✕
              </button>
            </div>
          ))
        )}
      </div>
    </aside>
  )
}

export default PrivateChannelSidebar
