# 🧠 InsightAI — AI-Powered Business Intelligence Platform

A conversational BI dashboard where you upload CSV data, ask questions in natural language, and get SQL queries, charts, statistics, and predictions — powered by **Groq (Llama 3)**.

## Architecture

```
User → React (Vite) → Express.js → Python FastAPI → Groq API
                                  → SQLite → Pandas → Plotly → Scikit-learn
```

## 📁 Project Structure

```
Project Design/
├── frontend/          # React + Vite + TailwindCSS v4
│   └── src/
│       ├── components/
│       │   ├── ChatPanel.jsx
│       │   ├── ChartDisplay.jsx
│       │   ├── DataTable.jsx
│       │   ├── FileUpload.jsx
│       │   ├── InsightsPanel.jsx
│       │   ├── ResultsPanel.jsx
│       │   ├── Sidebar.jsx
│       │   └── StatsPanel.jsx
│       ├── App.jsx
│       ├── index.css
│       └── main.jsx
├── server/            # Express.js backend
│   ├── index.js
│   └── .env
├── python-service/    # FastAPI + Groq + Pandas
│   ├── main.py
│   ├── services/
│   │   ├── database.py
│   │   ├── llm.py
│   │   ├── charts.py
│   │   ├── analysis.py
│   │   └── prediction.py
│   └── .env
├── sample_data/
│   └── sales_data.csv
└── README.md
```

## 🚀 Setup Instructions

### Prerequisites
- **Node.js** 18+
- **Python** 3.10+
- **Groq API Key** — Get free at [console.groq.com](https://console.groq.com)

### 1. Python Service (port 8000)

```bash
cd python-service
pip install -r requirements.txt
```

Add your Groq API key to `python-service/.env`:
```
GROQ_API_KEY=gsk_your_key_here
```

Start the service:
```bash
python main.py
```

### 2. Express Backend (port 5000)

```bash
cd server
npm install
npm run dev
```

### 3. React Frontend (port 5173)

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## � Repository Index

### Frontend (`frontend/`)
| File | Purpose |
|------|---------|
| `index.html` | Entry point, mounts React app |
| `src/main.jsx` | React app initialization |
| `src/App.jsx` | Main app shell, routing, auth state |
| `src/index.css` | Global styles |
| `eslint.config.js` | Linting rules |
| `vite.config.js` | Build tool config |
| `package.json` | Dependencies: React, Vite, TailwindCSS, Axios, Recharts |

#### Components (`frontend/src/components/`)
| Component | Purpose |
|-----------|---------|
| `LandingPage.jsx` | Welcome screen before login |
| `AuthPage.jsx` | Login/signup form |
| `DashboardPage.jsx` | Main dashboard layout (layout + orchestrator) |
| `Sidebar.jsx` | Navigation menu, file list, chat history |
| `FileUpload.jsx` | Drag-drop CSV upload interface |
| `ChatPanel.jsx` | Chat input, message history |
| `ResultsPanel.jsx` | Display query results (raw data) |
| `DataTable.jsx` | Paginated data grid viewer |
| `ChartDisplay.jsx` | Renders Recharts (bar, line, pie, area) |
| `StatsPanel.jsx` | Shows summary statistics (mean, median, mode, etc.) |
| `InsightsPanel.jsx` | AI-generated insights from Groq |
| `VisualBuilder.jsx` | Interactive chart customization UI |

### Backend (`server/`)
| File | Purpose |
|------|---------|
| `index.js` | Express server, routes, file upload handler, auth (JWT) |
| `package.json` | Dependencies: Express, Multer, Axios, bcrypt, JWT, better-sqlite3 |
| `auth.db` | SQLite database for user credentials (created on startup) |
| `uploads/` | Temporary storage for uploaded CSV files |

#### Express Routes
| Method | Route | Handler |
|--------|-------|---------|
| `POST` | `/api/auth/signup` | Register new user |
| `POST` | `/api/auth/login` | Authenticate user, return JWT |
| `POST` | `/api/upload` | Multipart file upload, forward to Python service |
| `POST` | `/api/ask` | Natural language question, forward to Python service |
| `GET` | `/api/health` | Liveness check |

### Python Service (`python-service/`)
| File | Purpose |
|------|---------|
| `main.py` | FastAPI app, request routing, CORS, models (AnalyzeRequest, ChartRequest) |
| `requirements.txt` | Python dependencies |
| `.env` | Store `GROQ_API_KEY` |
| `uploads/` | Persistent CSV file storage |

#### Services (`python-service/services/`)
| Module | Exports | Purpose |
|--------|---------|---------|
| `database.py` | `csv_to_sqlite()`, `execute_query()`, `validate_sql()` | CSV→SQLite, SQL execution, security checks |
| `llm.py` | `nl_to_sql()` | Natural language→SQL translation (via Groq) |
| `charts.py` | `generate_chart()` | Data→Plotly JSON (bar, line, pie, scatter, etc.) |
| `analysis.py` | `compute_stats()`, `generate_insights()` | Descriptive stats, Groq-powered insights |
| `prediction.py` | `predict()` | Linear regression, time-series forecast (Scikit-learn) |

#### FastAPI Routes
| Method | Route | Payload | Response |
|--------|-------|---------|----------|
| `POST` | `/upload` | CSV file | `{"db_path": "path/to/db.sqlite", "columns": [...], "row_count": N}` |
| `POST` | `/analyze` | `{"question": str, "db_path": str}` | `{"sql": str, "results": [...], "chart": {...}, "stats": {...}, "insights": str}` |
| `GET` | `/health` | — | `{"status": "ok"}` |

### Configuration Files
| File | Location | Purpose |
|------|----------|---------|
| `.env` | `python-service/` | Groq API key |
| `.env` | `server/` | JWT secret, Python service URL |
| `.gitignore` | Root | Exclude node_modules, venv, uploads, .env |

### Sample Data (`sample_data/`)
| File | Description |
|------|-------------|
| `sales_data.csv` | Example dataset for testing (regions, products, sales, profit) |

### Data Flow

```
User uploads CSV
     ↓
Express: POST /api/upload → save locally
     ↓
Python: POST /upload → csv_to_sqlite() → return db_path
     ↓
User asks question in chat
     ↓
Express: POST /api/ask {question, db_path}
     ↓
Python: POST /analyze → nl_to_sql() (Groq) → execute_query() → generate_chart() → compute_stats() → generate_insights()
     ↓
Return to frontend: SQL, results, chart config, stats, insights
     ↓
React renders ChartDisplay, DataTable, StatsPanel, InsightsPanel
```

## �💬 Example Questions

Upload `sample_data/sales_data.csv`, then try:

| Question | What it does |
|----------|-------------|
| `Show total sales per region` | Aggregates sales by region → bar chart |
| `What are the top 5 products by profit?` | Ranks products → table + chart |
| `Show monthly sales trend` | Time-series → line/area chart |
| `Predict next month sales` | Linear regression prediction |
| `What is the average quantity per product?` | Group-by average → stats |
| `Which region has the highest profit margin?` | Analytical query |

## 🔌 API Endpoints

### Express (port 5000)
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/upload` | Upload CSV file (multipart) |
| POST | `/api/ask` | Ask natural language question |
| GET | `/api/health` | Health check |

### Python (port 8000)
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/upload` | Process CSV → SQLite |
| POST | `/analyze` | Full analysis pipeline |
| GET | `/health` | Health check |

## Example API Call

```bash
# Upload
curl -X POST http://localhost:5000/api/upload \
  -F "file=@sample_data/sales_data.csv"

# Ask
curl -X POST http://localhost:5000/api/ask \
  -H "Content-Type: application/json" \
  -d '{"question": "Show total sales per region"}'
```

## 🔐 Security

- SQL queries are validated (SELECT-only)
- DROP, DELETE, UPDATE, INSERT are blocked
- File uploads restricted to .csv, max 50MB

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite 7, TailwindCSS v4, Recharts |
| Backend | Node.js, Express 4, Multer, Axios |
| AI Service | Python, FastAPI, Groq (Llama 3 70B) |
| Data | Pandas, SQLite, Plotly, Scikit-learn |
