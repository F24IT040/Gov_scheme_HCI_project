import { DatabaseSync } from 'node:sqlite';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const databasePath = process.env.DATABASE_PATH || fileURLToPath(new URL('../data/nayanta.sqlite', import.meta.url));
fs.mkdirSync(path.dirname(databasePath), { recursive: true });
const db = new DatabaseSync(databasePath);

db.exec(`
  PRAGMA foreign_keys = ON;
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    mobile TEXT NOT NULL UNIQUE,
    email TEXT,
    language TEXT NOT NULL DEFAULT 'English',
    state TEXT, district TEXT, age INTEGER, gender TEXT, occupation TEXT, income TEXT,
    interests TEXT NOT NULL DEFAULT '[]',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL UNIQUE,
    expires_at TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
`);

// Migrate databases created by the earlier PIN-based prototype while
// preserving existing profiles and active sessions.
const userColumns = db.prepare('PRAGMA table_info(users)').all().map((column) => column.name);
if (userColumns.includes('pin_hash')) {
  db.exec(`
    PRAGMA foreign_keys = OFF;
    BEGIN;
    ALTER TABLE sessions RENAME TO sessions_legacy;
    ALTER TABLE users RENAME TO users_legacy;
    CREATE TABLE users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL, mobile TEXT NOT NULL UNIQUE, email TEXT,
      language TEXT NOT NULL DEFAULT 'English', state TEXT, district TEXT, age INTEGER,
      gender TEXT, occupation TEXT, income TEXT, interests TEXT NOT NULL DEFAULT '[]',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    INSERT INTO users (id, name, mobile, email, language, state, district, age, gender, occupation, income, interests, created_at)
      SELECT id, name, mobile, email, language, state, district, age, gender, occupation, income, interests, created_at FROM users_legacy;
    CREATE TABLE sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token_hash TEXT NOT NULL UNIQUE, expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    INSERT INTO sessions (id, user_id, token_hash, expires_at, created_at)
      SELECT id, user_id, token_hash, expires_at, created_at FROM sessions_legacy;
    DROP TABLE sessions_legacy;
    DROP TABLE users_legacy;
    COMMIT;
    PRAGMA foreign_keys = ON;
  `);
}

db.exec('CREATE INDEX IF NOT EXISTS sessions_token_hash_idx ON sessions(token_hash);');

function publicUser(row) {
  if (!row) return null;
  return {
    id: row.id, name: row.name, mobile: row.mobile, email: row.email || '',
    language: row.language, state: row.state || '', district: row.district || '',
    age: row.age || '', gender: row.gender || '', occupation: row.occupation || '', income: row.income || '',
    interests: JSON.parse(row.interests || '[]'),
  };
}

export function registerUser(input) {
  const mobile = String(input.mobile || '').replace(/\D/g, '');
  const name = String(input.name || '').trim();
  if (!name || mobile.length !== 10) {
    throw new Error('Enter your name and a valid 10-digit mobile number.');
  }

  const existing = db.prepare('SELECT id FROM users WHERE mobile = ?').get(mobile);
  if (existing) throw new Error('An account already exists for this mobile number. Please sign in.');

  const result = db.prepare(`INSERT INTO users
    (name, mobile, email, language, state, district, age, gender, occupation, income, interests)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .run(name, mobile, String(input.email || '').trim(), String(input.language || 'English'),
      String(input.state || ''), String(input.district || '').trim(), Number(input.age) || null,
      String(input.gender || ''), String(input.occupation || ''), String(input.income || ''),
      JSON.stringify(Array.isArray(input.interests) ? input.interests : []));
  return getUserById(Number(result.lastInsertRowid));
}

export function authenticateUser(mobileInput) {
  const mobile = String(mobileInput || '').replace(/\D/g, '');
  const row = db.prepare('SELECT * FROM users WHERE mobile = ?').get(mobile);
  return publicUser(row);
}

export function getUserById(id) {
  return publicUser(db.prepare('SELECT * FROM users WHERE id = ?').get(id));
}

export function createSession(userId) {
  const token = crypto.randomBytes(32).toString('base64url');
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString();
  db.prepare('DELETE FROM sessions WHERE expires_at <= ?').run(new Date().toISOString());
  db.prepare('INSERT INTO sessions (user_id, token_hash, expires_at) VALUES (?, ?, ?)').run(userId, tokenHash, expiresAt);
  return token;
}

export function getSessionUser(token) {
  if (!token) return null;
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const row = db.prepare(`SELECT users.* FROM sessions JOIN users ON users.id = sessions.user_id
    WHERE sessions.token_hash = ? AND sessions.expires_at > ?`).get(tokenHash, new Date().toISOString());
  return publicUser(row);
}

export function deleteSession(token) {
  if (!token) return;
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  db.prepare('DELETE FROM sessions WHERE token_hash = ?').run(tokenHash);
}
