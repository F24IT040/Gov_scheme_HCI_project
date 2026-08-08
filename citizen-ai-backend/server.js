import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import chatRoute from './routes/chat.js';
import { registerAuthRoutes, requireAuth } from './routes/auth.js';

const app = express();

/*
|--------------------------------------------------------------------------
| CORS Configuration
|--------------------------------------------------------------------------
*/

const allowedOrigins = [
  // Production frontend
  'https://frontenddeploy-omega.vercel.app',

  // Local development
  'http://localhost:5173',
  'http://127.0.0.1:5173',

  // Railway environment variable
  process.env.FRONTEND_URL,
]
  .filter(Boolean)
  .map((url) => url.trim().replace(/\/$/, ''));

console.log('[CORS] Allowed origins:', allowedOrigins);

const corsOptions = {
  origin(origin, callback) {
    // Allow requests without Origin header
    // e.g. Postman, curl, server-to-server
    if (!origin) {
      return callback(null, true);
    }

    const normalizedOrigin = origin.trim().replace(/\/$/, '');

    if (allowedOrigins.includes(normalizedOrigin)) {
      console.log(`[CORS] Allowed origin: ${normalizedOrigin}`);
      return callback(null, true);
    }

    console.error(`[CORS] Blocked origin: ${normalizedOrigin}`);

    return callback(null, false);
  },

  credentials: true,

  methods: [
    'GET',
    'POST',
    'PUT',
    'PATCH',
    'DELETE',
    'OPTIONS',
  ],

  allowedHeaders: [
    'Content-Type',
    'Authorization',
  ],

  exposedHeaders: [
    'X-Chat-Handler',
  ],

  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));

/*
|--------------------------------------------------------------------------
| Express Configuration
|--------------------------------------------------------------------------
*/

app.set('trust proxy', 1);

app.use(express.json());

/*
|--------------------------------------------------------------------------
| Authentication Routes
|--------------------------------------------------------------------------
*/

registerAuthRoutes(app);

/*
|--------------------------------------------------------------------------
| Chat Route
|--------------------------------------------------------------------------
*/

app.post('/chat', requireAuth, (req, res, next) => {
  res.set('X-Chat-Handler', 'live-chat-v2');

  return chatRoute(req, res, next);
});

/*
|--------------------------------------------------------------------------
| Health Check
|--------------------------------------------------------------------------
*/

app.get('/chat/health', (_req, res) => {
  res.set('X-Chat-Handler', 'live-chat-v2');

  res.status(200).json({
    ok: true,
    handler: 'live-chat-v2',
    environment: process.env.NODE_ENV || 'development',
  });
});

/*
|--------------------------------------------------------------------------
| Root Route
|--------------------------------------------------------------------------
*/

app.get('/', (_req, res) => {
  res.status(200).json({
    message: 'Backend API is running',
    status: 'ok',
  });
});

/*
|--------------------------------------------------------------------------
| Deployment Check
|--------------------------------------------------------------------------
*/

app.get('/deployment-check', (_req, res) => {
  res.status(200).json({
    deployment: 'cors-fix-v4',
    frontend: 'https://frontenddeploy-omega.vercel.app',
    backend: 'https://govschemehciproject-production.up.railway.app',
    timestamp: new Date().toISOString(),
  });
});

/*
|--------------------------------------------------------------------------
| Start Server
|--------------------------------------------------------------------------
*/

const port = process.env.PORT || 5000;

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port}`);

  console.log(
    `GROQ_API_KEY: ${
      process.env.GROQ_API_KEY ? 'SET ✓' : 'MISSING ✗'
    }`
  );

  console.log(
    `GROQ_MODEL: ${
      process.env.GROQ_MODEL || 'NOT SET'
    }`
  );

  console.log(
    `CONVERSATION_MODEL: ${
      process.env.GROQ_CONVERSATION_MODEL ||
      process.env.GROQ_MODEL ||
      'NOT SET'
    }`
  );

  console.log(
    `FRONTEND_URL: ${
      process.env.FRONTEND_URL || 'NOT SET'
    }`
  );

  console.log('[CORS] Allowed origins:', allowedOrigins);
});

/*
|--------------------------------------------------------------------------
| Error Handling
|--------------------------------------------------------------------------
*/

process.on('unhandledRejection', (err) => {
  console.error(
    '[unhandledRejection]',
    err?.message || err
  );
});
