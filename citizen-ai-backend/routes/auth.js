import { authenticateUser, createSession, deleteSession, getSessionUser, registerUser } from '../services/authStore.js';

const SESSION_COOKIE = 'nayanta_session';
const isProduction = process.env.NODE_ENV === 'production';
const cookieOptions = `HttpOnly; SameSite=${isProduction ? 'None; Secure' : 'Lax'}; Path=/; Max-Age=${60 * 60 * 24 * 30}`;

function readCookie(req) {
  const cookies = String(req.headers.cookie || '').split(';').map((part) => part.trim());
  const match = cookies.find((part) => part.startsWith(`${SESSION_COOKIE}=`));
  return match ? decodeURIComponent(match.slice(SESSION_COOKIE.length + 1)) : '';
}

export function requireAuth(req, res, next) {
  const user = getSessionUser(readCookie(req));
  if (!user) return res.status(401).json({ error: 'Please sign in to use the assistant.' });
  req.user = user;
  return next();
}

function setSession(res, user) {
  const token = createSession(user.id);
  res.setHeader('Set-Cookie', `${SESSION_COOKIE}=${encodeURIComponent(token)}; ${cookieOptions}`);
  return res.status(201).json({ user });
}

export function registerAuthRoutes(app) {
  app.post('/auth/register', (req, res) => {
    try { return setSession(res, registerUser(req.body || {})); }
    catch (error) { return res.status(400).json({ error: error.message || 'Could not create account.' }); }
  });

  app.post('/auth/login', (req, res) => {
    const user = authenticateUser(req.body?.mobile);
    if (!user) return res.status(401).json({ error: 'This mobile number is not registered. Please create an account first.' });
    return setSession(res, user);
  });

  app.get('/auth/session', (req, res) => {
    const user = getSessionUser(readCookie(req));
    if (!user) return res.status(401).json({ error: 'Not signed in.' });
    return res.json({ user });
  });

  app.post('/auth/logout', (req, res) => {
    deleteSession(readCookie(req));
    res.setHeader('Set-Cookie', `${SESSION_COOKIE}=; HttpOnly; SameSite=${isProduction ? 'None; Secure' : 'Lax'}; Path=/; Max-Age=0`);
    return res.status(204).end();
  });
}
