# InsightAI — AI-Powered Business Intelligence Platform

A conversational BI dashboard where you upload CSV data, ask questions in natural language, and get SQL queries, charts, statistics, and predictions — powered by **Groq (Llama 3)**.

## Architecture

```
User → React (Vite) → Express.js → Python FastAPI → Groq API
                                  → SQLite → Pandas → Plotly → Scikit-learn
```

## Repository structure

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

## Setup Instructions

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

## 💬 Example Questions

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

## Security

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
