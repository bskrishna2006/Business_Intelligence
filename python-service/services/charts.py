"""
Chart generation service — Smart chart selection and Plotly rendering.
"""
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
import plotly.io as pio
import base64
import io
import re


def detect_chart_type(df: pd.DataFrame) -> str:
    """
    Detect the best chart type based on the data shape and content.

    Returns: 'bar', 'line', 'pie', 'histogram', or 'scatter'
    """
    if df.empty or len(df.columns) < 1:
        return 'bar'

    cols = list(df.columns)
    num_cols = df.select_dtypes(include='number').columns.tolist()
    non_num_cols = [c for c in cols if c not in num_cols]

    # Single numeric column → histogram
    if len(cols) == 1 and len(num_cols) == 1:
        return 'histogram'

    if len(cols) >= 2:
        x_col = cols[0]
        x_values = df[x_col].astype(str)

        # Check if x-axis is time-based
        is_time = False
        try:
            pd.to_datetime(x_values, format='mixed')
            is_time = True
        except (ValueError, TypeError):
            # Check for year-like patterns or month names
            time_patterns = [
                r'^\d{4}$',  # Year
                r'^\d{4}[-/]\d{2}',  # YYYY-MM
                r'(?i)^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)',  # Month names
            ]
            if all(any(re.match(p, str(v)) for p in time_patterns) for v in x_values.head(3)):
                is_time = True

        if is_time:
            return 'line'

        # Few categories → pie chart
        if len(df) <= 6 and len(num_cols) >= 1 and len(non_num_cols) >= 1:
            return 'pie'

        # Many data points → line chart
        if len(df) > 15:
            return 'line'

    return 'bar'


def generate_chart(df: pd.DataFrame, chart_type: str = None) -> str:
    """
    Generate a chart from a DataFrame and return it as a base64-encoded PNG.

    Args:
        df: The data to chart
        chart_type: Override chart type detection (optional)

    Returns:
        Base64-encoded PNG string, or empty string if chart cannot be generated
    """
    if df.empty or len(df.columns) < 1:
        return ""

    if chart_type is None:
        chart_type = detect_chart_type(df)

    cols = list(df.columns)
    num_cols = df.select_dtypes(include='number').columns.tolist()

    # Dark theme template
    layout_defaults = dict(
        template="plotly_dark",
        paper_bgcolor='rgba(15,15,26,0.9)',
        plot_bgcolor='rgba(22,33,62,0.6)',
        font=dict(family="Inter, sans-serif", color="#e8e8f0"),
        margin=dict(l=50, r=30, t=50, b=50),
        height=400,
        width=700,
    )

    try:
        fig = None

        if chart_type == 'histogram' and len(num_cols) >= 1:
            fig = px.histogram(
                df, x=num_cols[0],
                title=f"Distribution of {num_cols[0]}",
                color_discrete_sequence=['#6c63ff'],
            )

        elif chart_type == 'pie' and len(cols) >= 2:
            x_col = cols[0]
            y_col = num_cols[0] if num_cols else cols[1]
            fig = px.pie(
                df, names=x_col, values=y_col,
                title=f"{y_col} by {x_col}",
                color_discrete_sequence=px.colors.sequential.Purp,
            )

        elif chart_type == 'line' and len(cols) >= 2 and len(num_cols) >= 1:
            x_col = cols[0]
            y_cols = num_cols if cols[0] not in num_cols else num_cols
            fig = go.Figure()
            colors = ['#6c63ff', '#00e676', '#ffab40', '#ff5252', '#40c4ff']
            for i, y_col in enumerate(y_cols[:5]):
                fig.add_trace(go.Scatter(
                    x=df[x_col], y=df[y_col],
                    mode='lines+markers',
                    name=y_col,
                    line=dict(color=colors[i % len(colors)], width=2),
                    marker=dict(size=6),
                ))
            fig.update_layout(title=f"Trend: {', '.join(y_cols[:3])}")

        elif chart_type == 'scatter' and len(num_cols) >= 2:
            fig = px.scatter(
                df, x=num_cols[0], y=num_cols[1],
                title=f"{num_cols[1]} vs {num_cols[0]}",
                color_discrete_sequence=['#6c63ff'],
            )

        else:  # bar chart (default)
            if len(cols) >= 2:
                x_col = cols[0]
                y_cols = num_cols if num_cols else [cols[1]]
                fig = go.Figure()
                colors = ['#6c63ff', '#8b83ff', '#00e676', '#ffab40', '#ff5252']
                for i, y_col in enumerate(y_cols[:5]):
                    fig.add_trace(go.Bar(
                        x=df[x_col], y=df[y_col],
                        name=y_col,
                        marker_color=colors[i % len(colors)],
                    ))
                fig.update_layout(
                    title=f"{', '.join(y_cols[:3])} by {x_col}",
                    barmode='group',
                )
            else:
                return ""

        if fig is None:
            return ""

        fig.update_layout(**layout_defaults)

        # Convert to base64 PNG
        img_bytes = pio.to_image(fig, format="png", scale=2)
        return base64.b64encode(img_bytes).decode('utf-8')

    except Exception as e:
        print(f"Chart generation error: {e}")
        return ""
