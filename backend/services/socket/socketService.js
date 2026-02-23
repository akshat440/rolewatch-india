const socketIo = require('socket.io');

let io;
const connectedUsers = new Map(); // userId -> socketId

function initializeSocket(server) {
  io = socketIo(server, {
    cors: {
      origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // User registers with their userId
    socket.on('register', (userId) => {
      connectedUsers.set(userId, socket.id);
      console.log(`User ${userId} registered with socket ${socket.id}`);
      
      // Send confirmation
      socket.emit('registered', {
        success: true,
        message: 'Connected to real-time updates'
      });
    });

    socket.on('disconnect', () => {
      // Remove user from connected users
      for (let [userId, socketId] of connectedUsers.entries()) {
        if (socketId === socket.id) {
          connectedUsers.delete(userId);
          console.log(`User ${userId} disconnected`);
          break;
        }
      }
    });
  });

  return io;
}

function emitToUser(userId, event, data) {
  const socketId = connectedUsers.get(userId);
  if (socketId && io) {
    io.to(socketId).emit(event, data);
    console.log(`Emitted ${event} to user ${userId}`);
    return true;
  }
  return false;
}

function emitToAll(event, data) {
  if (io) {
    io.emit(event, data);
    console.log(`Broadcast ${event} to all users`);
    return true;
  }
  return false;
}

function emitToIndustry(industry, event, data) {
  if (io) {
    io.emit(`${industry}:${event}`, data);
    console.log(`Emitted ${event} to ${industry}`);
    return true;
  }
  return false;
}

module.exports = {
  initializeSocket,
  emitToUser,
  emitToAll,
  emitToIndustry,
  getConnectedUsers: () => Array.from(connectedUsers.keys())
};
