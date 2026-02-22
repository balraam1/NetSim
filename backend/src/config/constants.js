module.exports = {
  ROLES: {
    HOST: 'host',
    ADMIN: 'admin',
    MEMBER: 'member'
  },
  
  EVENTS: {
    // Client to Server
    CREATE_ROOM: 'create-room',
    JOIN_ROOM: 'join-room',
    SEND_MESSAGE: 'send-message',
    GET_ROOM_INFO: 'get-room-info',
    ASSIGN_ADMIN: 'assign-admin',
    
    // Private Channels
    CREATE_PRIVATE_CHANNEL: 'create-private-channel',
    SEND_PRIVATE_MESSAGE: 'send-private-message',
    CLOSE_PRIVATE_CHANNEL: 'close-private-channel',
    GET_TOPOLOGY: 'get-topology',
    
    // Server to Client
    ROOM_CREATED: 'room-created',
    JOINED_ROOM: 'joined-room',
    JOIN_ERROR: 'join-error',
    USER_JOINED: 'user-joined',
    USER_LEFT: 'user-left',
    NEW_MESSAGE: 'new-message',
    ROOM_INFO: 'room-info',
    ROOM_CLOSED: 'room-closed',
    ERROR: 'error',
    
    // Private Channel Events
    PRIVATE_CHANNEL_CREATED: 'private-channel-created',
    PRIVATE_CHANNEL_EXISTS: 'private-channel-exists',
    PRIVATE_MESSAGE_RECEIVED: 'private-message-received',
    PRIVATE_CHANNEL_CLOSED: 'private-channel-closed',
    TOPOLOGY_UPDATED: 'topology-updated',
    TOPOLOGY_DATA: 'topology-data'
  },
  
  ERROR_MESSAGES: {
    USERNAME_REQUIRED: 'Username required',
    ROOM_NOT_FOUND: 'Room not found',
    ROOM_FULL: 'Room is full',
    USERNAME_TAKEN: 'Username already taken',
    INVALID_DATA: 'Invalid data format',
    NOT_IN_ROOM: 'User not in room',
    TARGET_NOT_FOUND: 'Target user not found',
    NOT_AUTHORIZED: 'Not authorized',
    CHANNEL_NOT_FOUND: 'Channel not found',
    ONLY_HOST: 'Only host can perform this action'
  }
};
