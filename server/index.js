import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import axios from 'axios';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const PYTHON_URL = process.env.PYTHON_SERVICE_URL || 'http://localhost:8000';

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer configuration for CSV uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter: (req, file, cb) => {
    if (path.extname(file.originalname).toLowerCase() !== '.csv') {
      return cb(new Error('Only CSV files are allowed'));
    }
    cb(null, true);
  },
});

// Store current session info
let currentSession = {
  dbPath: null,
  schema: null,
  sampleRows: null,
  tableName: null,
  columns: null,
  rowCount: null,
};

// ─── POST /api/upload ───
app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    console.log(`📂 File received: ${req.file.originalname} (${(req.file.size / 1024).toFixed(1)} KB)`);

    // Forward file to Python service using FormData
    const FormData = (await import('form-data')).default;
    const form = new FormData();
    form.append('file', fs.createReadStream(req.file.path), req.file.originalname);

    const response = await axios.post(`${PYTHON_URL}/upload`, form, {
      headers: form.getHeaders(),
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });

    // Store session info
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

// ─── POST /api/ask ───
app.post('/api/ask', async (req, res) => {
  try {
    const { question } = req.body;

    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }

    if (!currentSession.dbPath) {
      return res.status(400).json({ error: 'No dataset uploaded. Please upload a CSV file first.' });
    }

    console.log(`💬 Question: "${question}"`);

    const response = await axios.post(`${PYTHON_URL}/analyze`, {
      question,
      db_path: currentSession.dbPath,
      schema: currentSession.schema,
      sample_rows: currentSession.sampleRows,
    }, {
      timeout: 60000, // 60s timeout for LLM calls
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
  console.log(`📁 Uploads directory: ${uploadsDir}\n`);
});
