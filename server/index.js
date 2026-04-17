import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import axios from 'axios';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const PYTHON_URL = process.env.PYTHON_SERVICE_URL || 'http://localhost:8000';
const JWT_SECRET = process.env.JWT_SECRET || 'insightai-secret-key-change-in-production';

// ─── Auth DB Setup ───
const authDb = new Database(path.join(__dirname, 'auth.db'));
authDb.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
  )
`);

// ─── Middleware ───
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// ─── Auth Middleware ───
function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized. Please log in.' });
  }
  const token = header.split(' ')[1];
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: 'Session expired. Please log in again.' });
  }
}

// ─── POST /api/auth/signup ───
app.post('/api/auth/signup', async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email and password are required.' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters.' });
  }

  try {
    const existing = authDb.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    const password_hash = await bcrypt.hash(password, 10);
    const result = authDb.prepare(
      'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)'
    ).run(name, email, password_hash);

    const user = { id: result.lastInsertRowid, name, email };
    const token = jwt.sign(user, JWT_SECRET, { expiresIn: '7d' });

    console.log(`✅ New user registered: ${email}`);
    res.json({ token, user });
  } catch (err) {
    console.error('❌ Signup error:', err.message);
    res.status(500).json({ error: 'Signup failed. Please try again.' });
  }
});

// ─── POST /api/auth/login ───
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    const row = authDb.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!row) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const valid = await bcrypt.compare(password, row.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const user = { id: row.id, name: row.name, email: row.email };
    const token = jwt.sign(user, JWT_SECRET, { expiresIn: '7d' });

    console.log(`🔑 User logged in: ${email}`);
    res.json({ token, user });
  } catch (err) {
    console.error('❌ Login error:', err.message);
    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
});

// ─── GET /api/auth/me ───
app.get('/api/auth/me', requireAuth, (req, res) => {
  res.json({ user: req.user });
});

// ─── Multer config ───
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (path.extname(file.originalname).toLowerCase() !== '.csv') {
      return cb(new Error('Only CSV files are allowed'));
    }
    cb(null, true);
  },
});

// Store current session info (per-server, simple approach)
let currentSession = {
  dbPath: null,
  schema: null,
  sampleRows: null,
  tableName: null,
  columns: null,
  rowCount: null,
};

// ─── POST /api/upload (protected) ───
app.post('/api/upload', requireAuth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    console.log(`📂 File received: ${req.file.originalname} (${(req.file.size / 1024).toFixed(1)} KB)`);

    const FormData = (await import('form-data')).default;
    const form = new FormData();
    form.append('file', fs.createReadStream(req.file.path), req.file.originalname);

    const response = await axios.post(`${PYTHON_URL}/upload`, form, {
      headers: form.getHeaders(),
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });

    currentSession = {
      dbPath: response.data.db_path,
      schema: response.data.schema,
      sampleRows: response.data.sample_rows,
      tableName: response.data.table_name,
      columns: response.data.columns,
      rowCount: response.data.row_count,
    };

    console.log(`✅ Dataset loaded: ${currentSession.rowCount} rows, ${currentSession.columns?.length} columns`);

    res.json({
      table_name: currentSession.tableName,
      columns: currentSession.columns,
      row_count: currentSession.rowCount,
      sample_rows: currentSession.sampleRows,
      schema: currentSession.schema,
    });
  } catch (err) {
    console.error('❌ Upload error:', err.response?.data || err.message);
    res.status(500).json({
      error: err.response?.data?.detail || err.message || 'Upload failed',
    });
  }
});

// ─── POST /api/ask (protected) ───
app.post('/api/ask', requireAuth, async (req, res) => {
  try {
    const { question } = req.body;

    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }

    if (!currentSession.dbPath) {
      return res.status(400).json({ error: 'No dataset uploaded. Please upload a CSV file first.' });
    }

    console.log(`💬 Question from ${req.user.email}: "${question}"`);

    const response = await axios.post(`${PYTHON_URL}/analyze`, {
      question,
      db_path: currentSession.dbPath,
      schema: currentSession.schema,
      sample_rows: currentSession.sampleRows,
    }, {
      timeout: 60000,
    });

    console.log(`✅ Analysis complete. SQL: ${response.data.sql_query?.substring(0, 60)}...`);

    res.json(response.data);
  } catch (err) {
    console.error('❌ Analysis error:', err.response?.data || err.message);
    res.status(500).json({
      error: err.response?.data?.detail || err.message || 'Analysis failed',
    });
  }
});

// ─── Health Check ───
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', python_service: PYTHON_URL });
});

// ─── Error Handler ───
app.use((err, req, res, next) => {
  console.error('Server error:', err.message);
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: `Upload error: ${err.message}` });
  }
  res.status(500).json({ error: err.message || 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`\n🚀 Express server running on http://localhost:${PORT}`);
  console.log(`📡 Python service: ${PYTHON_URL}`);
  console.log(`📁 Uploads directory: ${uploadsDir}`);
  console.log(`🔐 Auth DB: ${path.join(__dirname, 'auth.db')}\n`);
});
