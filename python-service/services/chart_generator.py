"""
Chart data generator - Converts dataset + recommendation into Recharts-compatible JSON
"""
import pandas as pd
import numpy as np
from typing import Dict, Any, List


def generate_chart_data(df: pd.DataFrame, recommendation: Dict) -> Dict[str, Any]:
    """
    Generate Recharts-compatible chart data for a single recommendation.
    
    Args:
        df: The dataset
        recommendation: Contains type, x_axis, y_axis, title, rationale
    
    Returns:
        {
            "data": [...],  # Recharts data array
            "config": {...},  # Chart configuration
            "metadata": {...}  # Info about the chart
        }
    """
    chart_type = recommendation.get("type", "bar").lower()
    x_axis = recommendation.get("x_axis")
    y_axis = recommendation.get("y_axis")
    
    try:
        if chart_type == "histogram":
            return generate_histogram(df, y_axis, recommendation)
        elif chart_type == "scatter":
            return generate_scatter(df, x_axis, y_axis, recommendation)
        elif chart_type == "bar":
            return generate_bar(df, x_axis, y_axis, recommendation)
        elif chart_type == "line":
            return generate_line(df, x_axis, y_axis, recommendation)
        elif chart_type == "pie":
            return generate_pie(df, x_axis, recommendation)
        elif chart_type == "area":
            return generate_area(df, x_axis, y_axis, recommendation)
        else:
            return {"data": [], "config": {}, "error": f"Unknown chart type: {chart_type}"}
    
    except Exception as e:
        return {"data": [], "config": {}, "error": str(e)}


def generate_histogram(df: pd.DataFrame, column: str, rec: Dict) -> Dict:
    """Generate histogram for numeric distribution"""
    try:
        series = pd.to_numeric(df[column], errors='coerce').dropna()
        
        if len(series) == 0:
            return {"data": [], "config": {}, "error": "No numeric data"}
        
        # Create bins
        counts, bins = np.histogram(series, bins=15)
        
        data = [
            {
                "range": f"{int(bins[i])}-{int(bins[i+1])}",
                "count": int(counts[i]),
                "bin_start": float(bins[i]),
                "bin_end": float(bins[i+1])
            }
            for i in range(len(counts))
        ]
        
        return {
            "data": data,
            "config": {
                "xAxis": "range",
                "yAxis": "count",
                "type": "histogram"
            },
            "metadata": {
                "rowCount": len(series),
                "mean": float(np.round(series.mean(), 2)),
                "std": float(np.round(series.std(), 2)),
                "min": float(np.round(series.min(), 2)),
                "max": float(np.round(series.max(), 2))
            }
        }
    except Exception as e:
        return {"data": [], "config": {}, "error": str(e)}


def generate_scatter(df: pd.DataFrame, x_col: str, y_col: str, rec: Dict) -> Dict:
    """Generate scatter plot for correlation"""
    try:
        x_data = pd.to_numeric(df[x_col], errors='coerce').dropna()
        y_data = pd.to_numeric(df[y_col], errors='coerce').dropna()
        
        # Align indices
        common_idx = x_data.index.intersection(y_data.index)
        x_data = x_data[common_idx]
        y_data = y_data[common_idx]
        
        if len(x_data) < 2:
            return {"data": [], "config": {}, "error": "Insufficient data points"}
        
        # Limit to 200 points for performance
        if len(x_data) > 200:
            sample_idx = np.random.choice(len(x_data), 200, replace=False)
            x_data = x_data.iloc[sample_idx]
            y_data = y_data.iloc[sample_idx]
        
        data = [
            {x_col: float(x), y_col: float(y)}
            for x, y in zip(x_data, y_data)
        ]
        
        # Calculate correlation
        corr = np.corrcoef(x_data, y_data)[0, 1]
        
        return {
            "data": data,
            "config": {
                "xAxis": x_col,
                "yAxis": y_col,
                "type": "scatter"
            },
            "metadata": {
                "rowCount": len(data),
                "correlation": float(np.round(corr, 2))
            }
        }
    except Exception as e:
        return {"data": [], "config": {}, "error": str(e)}


def generate_bar(df: pd.DataFrame, x_col: str, y_col: str, rec: Dict) -> Dict:
    """Generate bar chart for categorical comparison"""
    try:
        # Group by x_col and sum y_col
        grouped = df.groupby(x_col)[y_col].agg(['sum', 'count', 'mean']).reset_index()
        
        # Limit to top 20 for readability
        if len(grouped) > 20:
            grouped = grouped.nlargest(20, 'sum')
        
        data = [
            {
                x_col: str(row[x_col]),
                y_col: float(row['sum']),
                "count": int(row['count']),
                "mean": float(np.round(row['mean'], 2))
            }
            for _, row in grouped.iterrows()
        ]
        
        return {
            "data": data,
            "config": {
                "xAxis": x_col,
                "yAxis": y_col,
                "type": "bar"
            },
            "metadata": {
                "rowCount": len(data),
                "categories": int(len(data))
            }
        }
    except Exception as e:
        return {"data": [], "config": {}, "error": str(e)}


def generate_line(df: pd.DataFrame, x_col: str, y_col: str, rec: Dict) -> Dict:
    """Generate line chart for trends"""
    try:
        # Try to treat x as sortable (time, index, etc.)
        try:
            sorted_df = df.sort_values(x_col)
        except:
            sorted_df = df
        
        # Limit to last 100 points for readability
        if len(sorted_df) > 100:
            sorted_df = sorted_df.tail(100)
        
        data = [
            {
                x_col: str(row[x_col])[:20],  # Truncate for display
                y_col: float(pd.to_numeric(row[y_col], errors='coerce')),
                "index": i
            }
            for i, (_, row) in enumerate(sorted_df.iterrows())
        ]
        
        return {
            "data": data,
            "config": {
                "xAxis": x_col,
                "yAxis": y_col,
                "type": "line"
            },
            "metadata": {
                "rowCount": len(data),
                "trend": "increasing" if len(data) > 1 and data[-1][y_col] > data[0][y_col] else "decreasing"
            }
        }
    except Exception as e:
        return {"data": [], "config": {}, "error": str(e)}


def generate_pie(df: pd.DataFrame, x_col: str, rec: Dict) -> Dict:
    """Generate pie chart for distribution"""
    try:
        # Count unique values in category column
        counts = df[x_col].value_counts()
        
        # Limit to top 10 for readability
        if len(counts) > 10:
            counts = counts.head(10)
        
        data = [
            {
                "name": str(label),
                "value": int(count)
            }
            for label, count in counts.items()
        ]
        
        return {
            "data": data,
            "config": {
                "dataKey": "value",
                "nameKey": "name",
                "type": "pie"
            },
            "metadata": {
                "rowCount": len(data),
                "categories": int(len(counts)),
                "total": int(counts.sum())
            }
        }
    except Exception as e:
        return {"data": [], "config": {}, "error": str(e)}


def generate_area(df: pd.DataFrame, x_col: str, y_col: str, rec: Dict) -> Dict:
    """Generate area chart for stacked trends"""
    try:
        # Sort by x_col
        try:
            sorted_df = df.sort_values(x_col)
        except:
            sorted_df = df
        
        # Limit to 50 points
        if len(sorted_df) > 50:
            sorted_df = sorted_df.tail(50)
        
        data = [
            {
                x_col: str(row[x_col])[:15],
                y_col: float(pd.to_numeric(row[y_col], errors='coerce'))
            }
            for _, row in sorted_df.iterrows()
        ]
        
        return {
            "data": data,
            "config": {
                "xAxis": x_col,
                "yAxis": y_col,
                "type": "area"
            },
            "metadata": {
                "rowCount": len(data)
            }
        }
    except Exception as e:
        return {"data": [], "config": {}, "error": str(e)}


def generate_multiple_chart_data(df: pd.DataFrame, recommendations: List[Dict]) -> Dict[str, Dict]:
    """
    Generate chart data for multiple recommendations.
    
    Returns:
        {
            "rec-0": {...},
            "rec-1": {...},
            ...
        }
    """
    result = {}
    
    for rec in recommendations:
        rec_id = rec.get("id", f"rec-{len(result)}")
        try:
            result[rec_id] = generate_chart_data(df, rec)
        except Exception as e:
            result[rec_id] = {"data": [], "config": {}, "error": str(e)}
    
    return result
