"""
AI Business Intelligence Platform — Python Microservice
FastAPI application that handles CSV processing, NL→SQL (via Groq),
query execution, chart generation, statistics, and predictions.
"""
import os
import re
import shutil
import pandas as pd
from pathlib import Path
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import services
from services.database import csv_to_sqlite, execute_query, validate_sql
from services.llm import nl_to_sql
from services.charts import generate_chart
from services.analysis import compute_stats, generate_insights
from services.prediction import predict

# ─── FastAPI App ───
app = FastAPI(
    title="InsightAI - BI Analysis Service",
    description="AI-powered data analysis microservice",
    version="1.0.0",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure uploads directory
UPLOAD_DIR = Path(__file__).parent / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)


# ─── Request Models ───
class AnalyzeRequest(BaseModel):
    question: str
    db_path: str
    schema: dict
    sample_rows: list


# ─── POST /upload ───
@app.post("/upload")
async def upload_csv(file: UploadFile = File(...)):
    """
    Upload a CSV file and convert it to a SQLite database.
    Returns schema info and sample rows.
    """
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files are supported")

    try:
        # Save uploaded file
        file_path = UPLOAD_DIR / f"{int(pd.Timestamp.now().timestamp())}_{file.filename}"
        with open(file_path, "wb") as f:
            content = await file.read()
            f.write(content)

        print(f"📂 CSV saved: {file_path} ({len(content) / 1024:.1f} KB)")

        # Convert CSV to SQLite
        result = csv_to_sqlite(str(file_path))
        print(f"✅ SQLite created: {result['row_count']} rows, {len(result['columns'])} columns")

        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload processing failed: {str(e)}")


# ─── POST /analyze ───
@app.post("/analyze")
async def analyze_data(request: AnalyzeRequest):
    """
    Full analysis pipeline:
    1. Convert question to SQL via Groq
    2. Execute SQL query
    3. Generate chart
    4. Compute statistics
    5. Generate insights
    6. Predict (if asked)
    """
    question = request.question
    db_path = request.db_path
    schema = request.schema
    sample_rows = request.sample_rows

    result = {
        "sql_query": "",
        "table_result": [],
        "chart_base64": "",
        "stats": {},
        "insights": [],
        "prediction": {},
    }

    try:
        # Step 1: NL → SQL via Groq
        print(f"🧠 Converting to SQL: \"{question}\"")
        sql_query = nl_to_sql(question, schema, sample_rows)
        result["sql_query"] = sql_query
        print(f"📝 SQL: {sql_query}")

        # Step 2: Validate and execute SQL
        if not validate_sql(sql_query):
            raise HTTPException(
                status_code=400,
                detail="Generated SQL contains unsafe operations. Only SELECT queries are allowed."
            )

        table_result = execute_query(db_path, sql_query)
        result["table_result"] = table_result
        print(f"📊 Query returned {len(table_result)} rows")

        # Convert to DataFrame for analysis
        if table_result:
            df = pd.DataFrame(table_result)

            # Step 3: Generate chart
            try:
                chart_b64 = generate_chart(df)
                result["chart_base64"] = chart_b64
                if chart_b64:
                    print("📈 Chart generated")
            except Exception as e:
                print(f"⚠️ Chart generation failed: {e}")

            # Step 4: Compute statistics
            try:
                stats = compute_stats(df)
                result["stats"] = stats
            except Exception as e:
                print(f"⚠️ Stats computation failed: {e}")

            # Step 5: Generate insights
            try:
                insights = generate_insights(df, result["stats"])
                result["insights"] = insights
            except Exception as e:
                print(f"⚠️ Insights generation failed: {e}")

        # Step 6: Prediction (if question mentions prediction)
        prediction_keywords = ['predict', 'forecast', 'next month', 'next quarter', 'next year', 'future', 'estimate']
        if any(kw in question.lower() for kw in prediction_keywords):
            try:
                # Load full dataset for prediction
                full_df = pd.read_sql("SELECT * FROM data", __import__('sqlite3').connect(db_path))
                pred = predict(full_df, question)
                result["prediction"] = pred
                if pred.get("predicted_value"):
                    result["insights"].append(pred["message"])
                    print(f"🔮 Prediction: {pred['predicted_value']}")
            except Exception as e:
                result["prediction"] = {"error": str(e)}
                print(f"⚠️ Prediction failed: {e}")

        return result

    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")


# ─── Health Check ───
@app.get("/health")
async def health():
    return {
        "status": "ok",
        "service": "InsightAI Python Service",
        "groq_configured": bool(os.getenv("GROQ_API_KEY") and os.getenv("GROQ_API_KEY") != "your-groq-api-key-here"),
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
