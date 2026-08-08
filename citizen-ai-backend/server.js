import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import chatRoute from './routes/chat.js';
import { registerAuthRoutes, requireAuth } from './routes/auth.js';

const app = express();

const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.set('trust proxy', 1);

app.use(
  cors({
    credentials: true,
    origin(origin, callback) {
      // Allow requests with no Origin header
      // (Postman, curl, server-to-server, etc.)
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.error(`CORS blocked origin: ${origin}`);
      return callback(new Error(`Origin not allowed by CORS: ${origin}`));
    },
  })
);

app.use(express.json());

registerAuthRoutes(app);

// Chat endpoint
app.post('/chat', requireAuth, (req, res, next) => {
  res.set('X-Chat-Handler', 'live-chat-v2');
  return chatRoute(req, res, next);
});

// Health check
app.get('/chat/health', (_req, res) => {
  res.set('X-Chat-Handler', 'live-chat-v2');

  res.status(200).json({
    ok: true,
    handler: 'live-chat-v2',
    environment: process.env.NODE_ENV || 'development',
  });
});

// Root endpoint
app.get('/', (_req, res) => {
  res.json({
    message: 'Backend API is running',
    status: 'ok',
  });
});

const port = process.env.PORT || 5000;

// IMPORTANT for Railway
app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port}`);

  console.log(
    `GROQ_API_KEY: ${process.env.GROQ_API_KEY ? 'SET ✓' : 'MISSING ✗'
    }`
  );

  console.log(`GROQ_MODEL: ${process.env.GROQ_MODEL}`);

  console.log(
    `CONVERSATION_MODEL: ${process.env.GROQ_CONVERSATION_MODEL || process.env.GROQ_MODEL
    }`
  );

  console.log(`FRONTEND_URL: ${process.env.FRONTEND_URL}`);
});

process.on('unhandledRejection', (err) => {
  console.error('[unhandledRejection]', err?.message || err);
});