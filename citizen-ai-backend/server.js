import 'dotenv/config';   // ESM-safe — runs before anything else
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
app.use(cors({
  credentials: true,
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error(`Origin not allowed by CORS: ${origin}`));
  }
}));
app.use(express.json());
registerAuthRoutes(app);

// `chatRoute` is an Express handler, not an Express Router. Register it
// directly on the exact endpoint used by the frontend.
app.post('/chat', requireAuth, (req, res, next) => {
  res.set('X-Chat-Handler', 'live-chat-v2');
  return chatRoute(req, res, next);
});

// Lets us verify which backend process is serving the frontend without
// calling Groq or relying on a chat response.
app.get('/chat/health', (_req, res) => {
  res.set('X-Chat-Handler', 'live-chat-v2');
  res.json({ ok: true, handler: 'live-chat-v2' });
});

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`Server on :${port}`);
  console.log(`GROQ_KEY: ${process.env.GROQ_API_KEY ? 'SET ✓' : 'MISSING ✗'}`);
  console.log(`RETRIEVAL_MODEL: ${process.env.GROQ_MODEL}`);
  console.log(`CONVERSATION_MODEL: ${process.env.GROQ_CONVERSATION_MODEL || process.env.GROQ_MODEL}`);
});

process.on('unhandledRejection', (err) => {
  console.error('[unhandledRejection]', err?.message || err);
});
