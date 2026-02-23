import { io } from 'socket.io-client';

let socket = null;

export const connectWebSocket = (userId) => {
  if (socket?.connected) {
    return socket;
  }

  socket = io(process.env.REACT_APP_API_URL || 'http://localhost:5000', {
    transports: ['websocket'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5
  });

  socket.on('connect', () => {
    console.log('✅ WebSocket connected:', socket.id);
    socket.emit('register', userId);
  });

  socket.on('registered', (data) => {
    console.log('✅ Registered for real-time updates:', data);
  });

  socket.on('disconnect', () => {
    console.log('❌ WebSocket disconnected');
  });

  socket.on('connect_error', (error) => {
    console.error('WebSocket connection error:', error);
  });

  return socket;
};

export const disconnectWebSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const onPermissionsUpdated = (callback) => {
  if (socket) {
    socket.on('permissions_updated', callback);
  }
};

export const onAccountStatusChanged = (callback) => {
  if (socket) {
    socket.on('account_status_changed', callback);
  }
};

export const offPermissionsUpdated = () => {
  if (socket) {
    socket.off('permissions_updated');
  }
};

export const offAccountStatusChanged = () => {
  if (socket) {
    socket.off('account_status_changed');
  }
};

export default {
  connectWebSocket,
  disconnectWebSocket,
  onPermissionsUpdated,
  onAccountStatusChanged,
  offPermissionsUpdated,
  offAccountStatusChanged
};
