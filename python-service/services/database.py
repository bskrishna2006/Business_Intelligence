"""
Database service — CSV to SQLite conversion and query execution.
"""
import sqlite3
import pandas as pd
import os
import re


def csv_to_sqlite(file_path: str) -> dict:
    """
    Load a CSV file into an in-memory SQLite database saved to disk.
    Returns schema info, sample rows, and the database path.
    """
    # Read CSV with pandas
    df = pd.read_csv(file_path)

    # Clean column names: remove spaces/special chars, lowercase
    df.columns = [
        re.sub(r'[^a-zA-Z0-9_]', '_', col.strip()).lower()
        for col in df.columns
    ]

    # Create SQLite database alongside the CSV
    db_path = file_path.rsplit('.', 1)[0] + '.db'
    conn = sqlite3.connect(db_path)

    # Write dataframe to SQLite table named 'data'
    df.to_sql('data', conn, if_exists='replace', index=False)

    # Get schema info
    cursor = conn.execute("PRAGMA table_info(data)")
    columns_info = cursor.fetchall()

    schema = {}
    columns = []
    for col_info in columns_info:
        col_name = col_info[1]
        col_type = col_info[2]
        columns.append(col_name)
        schema[col_name] = col_type

    # Get sample rows
    sample_df = df.head(5)
    sample_rows = sample_df.to_dict(orient='records')

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

    # Get sample rows
    df = pd.read_sql("SELECT * FROM data LIMIT 5", conn)
    sample_rows = df.to_dict(orient='records')

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
    Returns results as a list of dictionaries.
    """
    if not validate_sql(sql):
        raise ValueError("Only SELECT queries are allowed. Destructive operations are blocked.")

    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row

    try:
        cursor = conn.execute(sql)
        rows = cursor.fetchall()
        columns = [description[0] for description in cursor.description]
        result = [dict(zip(columns, row)) for row in rows]
        return result
    except Exception as e:
        raise ValueError(f"SQL execution error: {str(e)}")
    finally:
        conn.close()
