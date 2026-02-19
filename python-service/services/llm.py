"""
LLM service — Natural Language to SQL conversion using Groq (ChatGroq).
Uses Llama 3 70B model for fast, high-quality SQL generation.
"""
import os
import re
from groq import Groq

# Initialize Groq client
client = None


def get_client():
    global client
    if client is None:
        api_key = os.getenv("GROQ_API_KEY")
        if not api_key or api_key == "your-groq-api-key-here":
            raise ValueError(
                "GROQ_API_KEY is not set. Please add your Groq API key to python-service/.env"
            )
        client = Groq(api_key=api_key)
    return client


def nl_to_sql(question: str, schema: dict, sample_rows: list = None) -> str:
    """
    Convert a natural language question to a SQL query using Groq.
    Sends ONLY the question + column names/types (minimal tokens).

    Args:
        question: User's natural language question
        schema: Dictionary of {column_name: column_type}
        sample_rows: Ignored — not sent to LLM to stay within token limits

    Returns:
        A safe SELECT SQL query string
    """
    # Build minimal schema: just "column_name (TYPE)" per line
    schema_str = ", ".join([f"{col} ({dtype})" for col, dtype in schema.items()])

    prompt = f"""Table: data
Columns: {schema_str}

Rules: SELECT only. SQLite syntax. Use exact column names. Use AS for aliases.

Question: {question}

SQL:"""

    try:
        groq_client = get_client()
        response = groq_client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {
                    "role": "system",
                    "content": "Output only a raw SQL SELECT query. No explanation, no markdown, no backticks."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.1,
            max_tokens=300,
        )

        sql = response.choices[0].message.content.strip()

        # Clean up: remove markdown code blocks if present
        sql = re.sub(r'^```\w*\n?', '', sql)
        sql = re.sub(r'\n?```$', '', sql)
        sql = sql.strip()

        # Remove trailing semicolons for SQLite compatibility
        sql = sql.rstrip(';')

        return sql

    except Exception as e:
        raise ValueError(f"Groq API error: {str(e)}")
