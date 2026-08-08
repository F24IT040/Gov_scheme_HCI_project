import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import chatRoute from './routes/chat.js';
import { registerAuthRoutes, requireAuth } from './routes/auth.js';

const app = express();

/*
|--------------------------------------------------------------------------
| CORS
|--------------------------------------------------------------------------
*/

const allowedOrigins = [
  // Production frontend URL
  process.env.FRONTEND_URL,
].filter(Boolean);

console.log('[CORS] Allowed origins:', allowedOrigins);

function isLocalDevOrigin(origin) {
  return /^https?:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin);
}

const corsOptions = {
  origin(origin, callback) {
    // Allow requests without an Origin header
    // (Postman, curl, server-to-server requests)
    if (!origin) {
      return callback(null, true);
    }

    // Allow local development
    if (isLocalDevOrigin(origin)) {
      console.log(`[CORS] Allowed local origin: ${origin}`);
      return callback(null, true);
    }

    // Allow configured production frontend
    if (allowedOrigins.includes(origin)) {
      console.log(`[CORS] Allowed production origin: ${origin}`);
      return callback(null, true);
    }

    console.error(`[CORS] Blocked origin: ${origin}`);
    return callback(new Error(`Origin not allowed by CORS: ${origin}`));
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
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

/*
|--------------------------------------------------------------------------
| Express
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
| Chat
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
| Root
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
| Server
|--------------------------------------------------------------------------
*/

const port = process.env.PORT || 5000;

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port}`);

  console.log(
    `GROQ_API_KEY: ${process.env.GROQ_API_KEY ? 'SET ✓' : 'MISSING ✗'
    }`
  );

  console.log(
    `GROQ_MODEL: ${process.env.GROQ_MODEL || 'NOT SET'
    }`
  );

  console.log(
    `CONVERSATION_MODEL: ${process.env.GROQ_CONVERSATION_MODEL ||
    process.env.GROQ_MODEL ||
    'NOT SET'
    }`
  );

  console.log(
    `FRONTEND_URL: ${process.env.FRONTEND_URL || 'NOT SET'
    }`
  );
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