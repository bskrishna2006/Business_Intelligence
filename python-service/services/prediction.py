"""
Prediction service — Simple linear regression for time-series prediction.
"""
import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.metrics import r2_score
import re


def detect_time_column(df: pd.DataFrame) -> str | None:
    """
    Detect the most likely time/date column in the DataFrame.

    Returns:
        Column name if found, None otherwise
    """
    for col in df.columns:
        sample = df[col].dropna().head(10).astype(str)

        # Check for date patterns
        date_patterns = [
            r'\d{4}[-/]\d{2}[-/]\d{2}',  # YYYY-MM-DD
            r'\d{2}[-/]\d{2}[-/]\d{4}',  # DD-MM-YYYY
            r'\d{4}[-/]\d{2}',            # YYYY-MM
            r'^\d{4}$',                    # Year only
        ]

        matches = sum(
            1 for v in sample
            if any(re.match(p, v) for p in date_patterns)
        )

        if matches >= len(sample) * 0.7:
            return col

    # Check column names for time-related keywords
    time_keywords = ['date', 'time', 'year', 'month', 'day', 'period', 'quarter']
    for col in df.columns:
        if any(kw in col.lower() for kw in time_keywords):
            return col

    return None


def detect_target_column(df: pd.DataFrame, question: str) -> str | None:
    """
    Detect which numeric column the user wants to predict based on their question.
    """
    numeric_cols = df.select_dtypes(include='number').columns.tolist()
    if not numeric_cols:
        return None

    # Check if any column name is mentioned in the question
    question_lower = question.lower()
    for col in numeric_cols:
        col_clean = col.replace('_', ' ').lower()
        if col_clean in question_lower or col.lower() in question_lower:
            return col

    # Default to first numeric column
    return numeric_cols[0]


def predict(df: pd.DataFrame, question: str) -> dict:
    """
    Perform simple linear regression prediction.

    If user asks about prediction/forecasting, detect time column and target,
    fit a linear regression, and predict the next period.

    Returns:
        Dictionary with prediction results
    """
    try:
        # Detect time column
        time_col = detect_time_column(df)
        if time_col is None:
            return {
                "error": "No time/date column detected. Prediction requires time-series data.",
                "predicted_value": None,
            }

        # Detect target column
        target_col = detect_target_column(df, question)
        if target_col is None:
            return {
                "error": "No numeric column found to predict.",
                "predicted_value": None,
            }

        # Prepare data
        pred_df = df[[time_col, target_col]].dropna()
        if len(pred_df) < 3:
            return {
                "error": "Not enough data points for prediction (need at least 3).",
                "predicted_value": None,
            }

        # Create numeric index for time
        X = np.arange(len(pred_df)).reshape(-1, 1)
        y = pred_df[target_col].values.astype(float)

        # Fit linear regression
        model = LinearRegression()
        model.fit(X, y)

        # Predict next period
        next_idx = np.array([[len(pred_df)]])
        predicted_value = float(model.predict(next_idx)[0])

        # R² score
        y_pred = model.predict(X)
        r2 = r2_score(y, y_pred)

        # Determine trend
        slope = float(model.coef_[0])
        if slope > 0:
            trend = "upward"
        elif slope < 0:
            trend = "downward"
        else:
            trend = "stable"

        return {
            "predicted_value": round(predicted_value, 2),
            "metric": target_col.replace('_', ' ').title(),
            "confidence": round(r2, 4),
            "trend": trend,
            "message": f"Predicted next period {target_col.replace('_', ' ')}: {predicted_value:,.2f} (trend: {trend}, R²={r2:.4f})",
        }

    except Exception as e:
        return {
            "error": f"Prediction failed: {str(e)}",
            "predicted_value": None,
        }
