import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import path from 'path';
import { env } from './config/env';
import { initSocket } from './config/socket';
import { apiLimiter } from './middlewares/rateLimiter';
import routes from './routes';
import { startScheduledDispatchRunner } from './jobs/scheduledDispatchRunner';

const app = express();
const httpServer = createServer(app);

// Initialize Socket.IO
initSocket(httpServer);

// Middleware
app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/api', apiLimiter);

// Serve uploaded files
app.use('/uploads', express.static(path.resolve(env.UPLOADS_DIR)));
app.use('/snapshots', express.static(path.resolve(env.SNAPSHOTS_DIR)));
app.use('/certificates', express.static(path.resolve(env.CERTIFICATES_DIR)));

// API Routes
app.use('/api', routes);

// Root route
app.get('/', (_req, res) => {
  res.json({
    name: 'Quizora API',
    tagline: 'Powered by Archer Infotech',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      api: '/api',
      health: '/health',
      client: env.CLIENT_URL,
    },
  });
});

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
httpServer.listen(env.PORT, () => {
  console.log(`
  ╔══════════════════════════════════════════╗
  ║   Quizora Server                         ║
  ║   Powered by Archer Infotech             ║
  ║   Running on port ${env.PORT}                    ║
  ║   Environment: ${env.NODE_ENV}              ║
  ╚══════════════════════════════════════════╝
  `);

  // Start background jobs
  startScheduledDispatchRunner();
});

export default app;
