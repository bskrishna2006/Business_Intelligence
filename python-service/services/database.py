"""
Database service — Smart CSV to SQLite conversion and safe query execution.
"""
import os
import re
import csv
import json
import sqlite3
import pandas as pd


def csv_to_sqlite(file_path: str) -> dict:
    """
    Load a CSV file into an in-memory SQLite database saved to disk.
    Handles title metadata rows, multi-column headers, duplicate column names,
    formatted numbers with commas, hyphens, and NaN JSON sanitization.
    """
    # Step 1: Inspect initial lines to detect true header row index
    header_idx = 0
    try:
        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
            sample_lines = [f.readline() for _ in range(15)]

        rows = list(csv.reader([l for l in sample_lines if l.strip()]))
        if rows:
            max_cols = max(len(r) for r in rows)
            for idx, r in enumerate(rows):
                if len(r) >= max_cols - 2:
                    non_empty = [cell.strip() for cell in r if cell.strip()]
                    text_cells = [cell for cell in non_empty if any(c.isalpha() for c in cell)]
                    if len(text_cells) >= len(non_empty) * 0.4 and len(non_empty) > 0:
                        header_idx = idx
                        break
    except Exception as e:
        print(f"⚠️ Header detection fallback to 0: {e}")
        header_idx = 0

    # Step 2: Read CSV using detected header index
    try:
        df = pd.read_csv(file_path, skiprows=header_idx)
    except Exception:
        df = pd.read_csv(file_path)

    # Drop completely empty columns
    df = df.dropna(how="all", axis=1)

    # Step 3: Disambiguate duplicate column names & sanitize for SQLite
    clean_cols = []
    seen = {}
    for col in df.columns:
        c = re.sub(r'[^a-zA-Z0-9_]', '_', str(col).strip()).lower()
        c = re.sub(r'_+', '_', c).strip('_')
        if not c:
            c = "col"
        if c in seen:
            seen[c] += 1
            c = f"{c}_{seen[c]}"
        else:
            seen[c] = 0
        clean_cols.append(c)
    df.columns = clean_cols

    # Step 4: Clean numeric columns containing strings with commas or hyphens
    for col in df.columns:
        if df[col].dtype == object:
            cleaned = df[col].astype(str).str.strip().replace({"-": None, "": None, "nan": None, "None": None})
            # Remove commas and convert to numeric
            numeric_series = pd.to_numeric(cleaned.str.replace(",", ""), errors="coerce")
            if numeric_series.notnull().sum() >= (cleaned.notnull().sum() * 0.4) and cleaned.notnull().sum() > 0:
                df[col] = numeric_series
            else:
                df[col] = cleaned

    # Step 5: Save SQLite database alongside the CSV
    db_path = file_path.rsplit('.', 1)[0] + '.db'
    conn = sqlite3.connect(db_path)
    df.to_sql('data', conn, if_exists='replace', index=False)

    cursor = conn.execute("PRAGMA table_info(data)")
    columns_info = cursor.fetchall()

    schema = {}
    columns = []
    for col_info in columns_info:
        col_name = col_info[1]
        col_type = col_info[2]
        columns.append(col_name)
        schema[col_name] = col_type

    # Step 6: Get JSON-safe sample rows (converts NaN to null)
    sample_df = df.head(5)
    sample_rows = json.loads(sample_df.to_json(orient='records'))
    row_count = len(df)
    conn.close()

    return {
        "db_path": db_path,
        "table_name": "data",
        "columns": columns,
        "schema": schema,
        "sample_rows": sample_rows,
        "row_count": row_count,
    }


def get_schema(db_path: str) -> dict:
    """Get schema information from an existing SQLite database."""
    conn = sqlite3.connect(db_path)
    cursor = conn.execute("PRAGMA table_info(data)")
    columns_info = cursor.fetchall()

    schema = {}
    for col_info in columns_info:
        schema[col_info[1]] = col_info[2]

    # Get JSON-safe sample rows
    df = pd.read_sql("SELECT * FROM data LIMIT 5", conn)
    sample_rows = json.loads(df.to_json(orient='records'))

    conn.close()
    return {"schema": schema, "sample_rows": sample_rows}


def validate_sql(sql: str) -> bool:
    """
    Validate that the SQL query is safe (SELECT only).
    Returns True if safe, False otherwise.
    """
    sql_upper = sql.strip().upper()

    # Block destructive operations
    dangerous_keywords = ['DROP', 'DELETE', 'UPDATE', 'INSERT', 'ALTER', 'CREATE', 'TRUNCATE', 'EXEC', 'EXECUTE']
    for keyword in dangerous_keywords:
        if re.search(rf'\b{keyword}\b', sql_upper):
            return False

    # Must start with SELECT or WITH (for CTEs)
    if not (sql_upper.startswith('SELECT') or sql_upper.startswith('WITH')):
        return False

    return True


def execute_query(db_path: str, sql: str) -> list[dict]:
    """
    Execute a SELECT query against the SQLite database.
    Returns results as a list of dictionaries, safely handling NaN floats for JSON output.
    """
    if not validate_sql(sql):
        raise ValueError("Only SELECT queries are allowed. Destructive operations are blocked.")

    conn = sqlite3.connect(db_path)
    try:
        df = pd.read_sql(sql, conn)
        result = json.loads(df.to_json(orient='records'))
        return result
    except Exception as e:
        raise ValueError(f"SQL execution error: {str(e)}")
    finally:
        conn.close()
