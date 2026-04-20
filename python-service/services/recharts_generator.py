"""
Recharts data generator — Transforms pandas DataFrames into Recharts-compatible JSON structures
for bar, line, scatter, pie, area, and histogram charts.
"""
import pandas as pd
import numpy as np
import json
from typing import List, Dict, Any, Optional


def generate_recharts_data(df: pd.DataFrame, chart_type: str, x_column: Optional[str] = None, 
                          y_column: Optional[str] = None, group_by: Optional[str] = None) -> Dict[str, Any]:
    """
    Generate Recharts-compatible data structure from a DataFrame.
    
    Args:
        df: pandas DataFrame
        chart_type: Type of chart ('bar', 'line', 'scatter', 'pie', 'area', 'histogram')
        x_column: Column for X-axis (for bar, line, scatter, area)
        y_column: Column for Y-axis (for bar, line, scatter, area)
        group_by: Column to group data by (for stacked charts)
    
    Returns:
        Dictionary with 'data' and 'config' keys compatible with Recharts
    """
    
    if df.empty:
        return {"data": [], "config": {}, "error": "DataFrame is empty"}
    
    try:
        if chart_type == "bar":
            return _generate_bar_data(df, x_column, y_column, group_by)
        elif chart_type == "line":
            return _generate_line_data(df, x_column, y_column, group_by)
        elif chart_type == "area":
            return _generate_area_data(df, x_column, y_column, group_by)
        elif chart_type == "scatter":
            return _generate_scatter_data(df, x_column, y_column)
        elif chart_type == "pie":
            return _generate_pie_data(df, x_column, y_column)
        elif chart_type == "histogram":
            return _generate_histogram_data(df, y_column)
        else:
            return {"data": [], "config": {}, "error": f"Unsupported chart type: {chart_type}"}
    
    except Exception as e:
        return {"data": [], "config": {}, "error": str(e)}


def _get_numeric_columns(df: pd.DataFrame) -> List[str]:
    """Get list of numeric column names."""
    return df.select_dtypes(include=['number']).columns.tolist()


def _get_categorical_columns(df: pd.DataFrame) -> List[str]:
    """Get list of categorical/string column names."""
    return df.select_dtypes(include=['object', 'string', 'category']).columns.tolist()


def _auto_select_columns(df: pd.DataFrame, x_col: Optional[str], y_col: Optional[str]):
    """
    Auto-select X and Y columns if not provided.
    
    Returns:
        Tuple of (x_column, y_column)
    """
    numeric_cols = _get_numeric_columns(df)
    categorical_cols = _get_categorical_columns(df)
    
    all_cols = df.columns.tolist()
    
    # If both provided, validate they exist
    if x_col and y_col:
        if x_col in all_cols and y_col in all_cols:
            return x_col, y_col
    
    # Auto-select if not provided or invalid
    if not x_col:
        x_col = categorical_cols[0] if categorical_cols else (all_cols[0] if all_cols else None)
    
    if not y_col:
        y_col = numeric_cols[0] if numeric_cols else (all_cols[1] if len(all_cols) > 1 else all_cols[0] if all_cols else None)
    
    return x_col, y_col


def _generate_bar_data(df: pd.DataFrame, x_column: Optional[str], y_column: Optional[str], 
                       group_by: Optional[str] = None) -> Dict[str, Any]:
    """Generate bar chart data for Recharts."""
    
    x_col, y_col = _auto_select_columns(df, x_column, y_column)
    
    if not x_col or not y_col:
        return {"data": [], "config": {}, "error": "Could not determine X and Y columns"}
    
    # Prepare data
    if group_by and group_by in df.columns and group_by != x_col:
        # Grouped/stacked bar chart
        pivot_df = df.groupby([x_col, group_by])[y_col].sum().reset_index()
        data = []
        
        for x_val in pivot_df[x_col].unique():
            row_data = {x_col: str(x_val)}
            for group_val in pivot_df[group_by].unique():
                subset = pivot_df[(pivot_df[x_col] == x_val) & (pivot_df[group_by] == group_val)]
                if not subset.empty:
                    row_data[str(group_val)] = float(subset[y_col].iloc[0])
                else:
                    row_data[str(group_val)] = 0
            data.append(row_data)
        
        # Get unique groups for bar keys
        bar_keys = [str(g) for g in pivot_df[group_by].unique()]
    else:
        # Simple bar chart
        df_sorted = df.sort_values(y_col, ascending=False).head(20)
        data = df_sorted[[x_col, y_col]].copy()
        data[x_col] = data[x_col].astype(str)
        data[y_col] = data[y_col].astype(float)
        data = data.to_dict('records')
        bar_keys = [y_col]
    
    return {
        "data": data,
        "config": {
            "xAxis": x_col,
            "yAxis": y_col,
            "type": "bar",
            "barKeys": bar_keys,
            "layout": "vertical" if len(data) > 10 else "horizontal"
        }
    }


def _generate_line_data(df: pd.DataFrame, x_column: Optional[str], y_column: Optional[str], 
                        group_by: Optional[str] = None) -> Dict[str, Any]:
    """Generate line chart data for Recharts."""
    
    x_col, y_col = _auto_select_columns(df, x_column, y_column)
    
    if not x_col or not y_col:
        return {"data": [], "config": {}, "error": "Could not determine X and Y columns"}
    
    # Sort by X column for proper line rendering
    df_sorted = df.sort_values(x_col)
    
    if group_by and group_by in df.columns and group_by != x_col:
        # Multi-line chart
        data = []
        for x_val in df_sorted[x_col].unique():
            row_data = {x_col: str(x_val)}
            for group_val in df_sorted[group_by].unique():
                subset = df_sorted[(df_sorted[x_col] == x_val) & (df_sorted[group_by] == group_val)]
                if not subset.empty:
                    row_data[str(group_val)] = float(subset[y_col].iloc[0])
            data.append(row_data)
        
        line_keys = [str(g) for g in df_sorted[group_by].unique()]
    else:
        # Single line
        data = df_sorted[[x_col, y_col]].copy()
        data[x_col] = data[x_col].astype(str)
        data[y_col] = data[y_col].astype(float)
        data = data.to_dict('records')
        line_keys = [y_col]
    
    return {
        "data": data,
        "config": {
            "xAxis": x_col,
            "yAxis": y_col,
            "type": "line",
            "lineKeys": line_keys,
            "isAnimationActive": True
        }
    }


def _generate_area_data(df: pd.DataFrame, x_column: Optional[str], y_column: Optional[str], 
                        group_by: Optional[str] = None) -> Dict[str, Any]:
    """Generate area chart data for Recharts."""
    
    x_col, y_col = _auto_select_columns(df, x_column, y_column)
    
    if not x_col or not y_col:
        return {"data": [], "config": {}, "error": "Could not determine X and Y columns"}
    
    df_sorted = df.sort_values(x_col)
    
    if group_by and group_by in df.columns and group_by != x_col:
        # Stacked area chart
        data = []
        for x_val in df_sorted[x_col].unique():
            row_data = {x_col: str(x_val)}
            for group_val in df_sorted[group_by].unique():
                subset = df_sorted[(df_sorted[x_col] == x_val) & (df_sorted[group_by] == group_val)]
                if not subset.empty:
                    row_data[str(group_val)] = float(subset[y_col].iloc[0])
            data.append(row_data)
        
        area_keys = [str(g) for g in df_sorted[group_by].unique()]
    else:
        data = df_sorted[[x_col, y_col]].copy()
        data[x_col] = data[x_col].astype(str)
        data[y_col] = data[y_col].astype(float)
        data = data.to_dict('records')
        area_keys = [y_col]
    
    return {
        "data": data,
        "config": {
            "xAxis": x_col,
            "yAxis": y_col,
            "type": "area",
            "areaKeys": area_keys,
            "stackId": "stack" if group_by else None
        }
    }


def _generate_scatter_data(df: pd.DataFrame, x_column: Optional[str], y_column: Optional[str]) -> Dict[str, Any]:
    """Generate scatter chart data for Recharts."""
    
    numeric_cols = _get_numeric_columns(df)
    
    if not x_column and len(numeric_cols) >= 2:
        x_column = numeric_cols[0]
    if not y_column and len(numeric_cols) >= 2:
        y_column = numeric_cols[1]
    
    if not x_column or not y_column or x_column == y_column:
        return {"data": [], "config": {}, "error": "Need two different numeric columns for scatter plot"}
    
    # Get first 200 points to avoid overwhelming the chart
    df_sample = df[[x_column, y_column]].dropna().head(200)
    
    data = []
    for _, row in df_sample.iterrows():
        data.append({
            x_column: float(row[x_column]),
            y_column: float(row[y_column])
        })
    
    return {
        "data": data,
        "config": {
            "xAxis": x_column,
            "yAxis": y_column,
            "type": "scatter"
        }
    }


def _generate_pie_data(df: pd.DataFrame, x_column: Optional[str], y_column: Optional[str]) -> Dict[str, Any]:
    """Generate pie chart data for Recharts."""
    
    # For pie chart, we need one categorical and one numeric column
    categorical_cols = _get_categorical_columns(df)
    numeric_cols = _get_numeric_columns(df)
    
    if not x_column and categorical_cols:
        x_column = categorical_cols[0]
    if not y_column and numeric_cols:
        y_column = numeric_cols[0]
    
    if not x_column or not y_column:
        return {"data": [], "config": {}, "error": "Could not determine categorical and numeric columns for pie chart"}
    
    # Aggregate data
    agg_df = df.groupby(x_column)[y_column].sum().reset_index()
    agg_df = agg_df.sort_values(y_column, ascending=False).head(10)
    
    colors = [
        "#d4a574", "#7a9b99", "#c8b4a0", "#a67c52", "#8b6f47",
        "#b8956a", "#d6cda4", "#9a8c7c", "#6b5b4d", "#c5a572"
    ]
    
    data = []
    for idx, (_, row) in enumerate(agg_df.iterrows()):
        data.append({
            "name": str(row[x_column]),
            "value": float(row[y_column]),
            "fill": colors[idx % len(colors)]
        })
    
    return {
        "data": data,
        "config": {
            "nameKey": "name",
            "dataKey": "value",
            "type": "pie",
            "cx": "50%",
            "cy": "50%",
            "outerRadius": 120
        }
    }


def _generate_histogram_data(df: pd.DataFrame, y_column: Optional[str]) -> Dict[str, Any]:
    """Generate histogram data for Recharts."""
    
    numeric_cols = _get_numeric_columns(df)
    
    if not y_column and numeric_cols:
        y_column = numeric_cols[0]
    
    if not y_column:
        return {"data": [], "config": {}, "error": "No numeric column found for histogram"}
    
    # Create bins
    data_series = df[y_column].dropna()
    
    if len(data_series) == 0:
        return {"data": [], "config": {}, "error": "Column has no numeric values"}
    
    n_bins = min(30, max(5, int(np.sqrt(len(data_series)))))
    counts, bin_edges = np.histogram(data_series, bins=n_bins)
    
    data = []
    for i in range(len(counts)):
        bin_start = bin_edges[i]
        bin_end = bin_edges[i + 1]
        data.append({
            "range": f"{bin_start:.2f}-{bin_end:.2f}",
            "count": int(counts[i]),
            "bin_start": float(bin_start),
            "bin_end": float(bin_end)
        })
    
    return {
        "data": data,
        "config": {
            "xAxis": "range",
            "yAxis": "count",
            "type": "histogram"
        }
    }


def generate_multiple_charts(df: pd.DataFrame, recommendations: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Generate chart data for multiple recommendations at once.
    
    Args:
        df: pandas DataFrame
        recommendations: List of recommendation dicts with 'type', 'x_axis', 'y_axis' keys
    
    Returns:
        Dictionary mapping recommendation IDs to chart data
    """
    charts = {}
    
    for rec in recommendations:
        try:
            chart_type = rec.get("type", "bar")
            x_col = rec.get("x_axis") or rec.get("columns", [None])[0]
            y_col = rec.get("y_axis") or rec.get("columns", [None, None])[1] if len(rec.get("columns", [])) > 1 else None
            
            chart_data = generate_recharts_data(
                df,
                chart_type,
                x_column=x_col,
                y_column=y_col,
                group_by=rec.get("group_by")
            )
            
            rec_id = rec.get("id", f"{chart_type}-chart")
            charts[rec_id] = chart_data
        
        except Exception as e:
            rec_id = rec.get("id", "error-chart")
            charts[rec_id] = {"data": [], "config": {}, "error": str(e)}
    
    return charts
