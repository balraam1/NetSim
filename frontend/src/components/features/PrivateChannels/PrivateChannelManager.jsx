import PrivateChannelSidebar from "./PrivateChannelSidebar"
import PrivateChat from "./PrivateChat"
import "../../../styles/features/PrivateChannels.css"

function PrivateChannelManager({
  users,
  mySocketId,
  activeChannels,
  selectedChannel,
  setSelectedChannel,
  channelMessages,
  onCreateChannel,
  onSendPrivateMessage,
  onCloseChannel
}) {
  return (
    <div className="private-channel-manager">
      <PrivateChannelSidebar
        users={users}
        mySocketId={mySocketId}
        activeChannels={activeChannels}
        selectedChannel={selectedChannel}
        onSelectChannel={setSelectedChannel}
        onCreateChannel={onCreateChannel}
        onCloseChannel={onCloseChannel}
      />

      <PrivateChat
        selectedChannel={selectedChannel}
        messages={selectedChannel ? channelMessages[selectedChannel.channelId] : []}
        mySocketId={mySocketId}
        onSendMessage={onSendPrivateMessage}
      />
    </div>
  )
}

export default PrivateChannelManager
