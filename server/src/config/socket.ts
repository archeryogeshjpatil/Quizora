import { Server as HttpServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import { env } from './env';

let io: SocketServer | null = null;

export function initSocket(httpServer: HttpServer): SocketServer {
  io = new SocketServer(httpServer, {
    cors: {
      origin: env.CLIENT_URL,
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Join a test room for real-time sync
    socket.on('join-test', (testAttemptId: string) => {
      socket.join(`test:${testAttemptId}`);
    });

    // Auto-save responses
    socket.on('auto-save', (data: { attemptId: string; responses: Record<string, string> }) => {
      socket.to(`test:${data.attemptId}`).emit('responses-saved', data.responses);
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
}

export function getIO(): SocketServer {
  if (!io) throw new Error('Socket.IO not initialized');
  return io;
}
