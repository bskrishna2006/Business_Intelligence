import pandas as pd
import numpy as np

def execute_join(df1, df2, join_type='inner', key1=None, key2=None):
    """
    Executes a multi-dataset merge between df1 and df2.
    join_type: 'inner' | 'left' | 'right' | 'outer'
    """
    if key1 not in df1.columns:
        raise ValueError(f"Key column '{key1}' not found in primary dataset")
    if key2 not in df2.columns:
        raise ValueError(f"Key column '{key2}' not found in secondary dataset")

    # Cast join key columns to string for safe matching
    df1_clean = df1.copy()
    df2_clean = df2.copy()
    df1_clean[key1] = df1_clean[key1].astype(str)
    df2_clean[key2] = df2_clean[key2].astype(str)

    merged_df = pd.merge(
        df1_clean,
        df2_clean,
        how=join_type,
        left_on=key1,
        right_on=key2,
        suffixes=('', '_secondary')
    )

    # Sanitize NaN values to None for JSON compatibility
    merged_df = merged_df.replace({np.nan: None})
    return merged_df

def apply_transformation_step(df, action, params):
    """
    Applies a single transformation step to a dataframe.
    """
    df_result = df.copy()

    if action == 'calculated_column':
        new_col = params.get('new_column')
        col1 = params.get('col1')
        op = params.get('op')
        col2 = params.get('col2')
        scalar = params.get('scalar')

        if not new_col or not col1 or not op:
            raise ValueError("Missing parameters for calculated column")

        series1 = pd.to_numeric(df_result[col1], errors='coerce').fillna(0)

        if col2 and col2 in df_result.columns:
            series2 = pd.to_numeric(df_result[col2], errors='coerce').fillna(0)
        elif scalar is not None:
            series2 = float(scalar)
        else:
            series2 = 0

        if op == '+':
            df_result[new_col] = series1 + series2
        elif op == '-':
            df_result[new_col] = series1 - series2
        elif op == '*':
            df_result[new_col] = series1 * series2
        elif op == '/':
            df_result[new_col] = np.where(series2 != 0, series1 / series2, 0)

    elif action == 'group_by':
        group_cols = params.get('group_cols', [])
        agg_cols = params.get('agg_cols', []) # list of { col: 'sales', func: 'sum' }

        if not group_cols or not agg_cols:
            raise ValueError("Missing group columns or aggregation columns")

        agg_dict = {}
        for item in agg_cols:
            col = item.get('col')
            func = item.get('func', 'sum')
            if col in df_result.columns:
                agg_dict[col] = func

        if agg_dict:
            df_result = df_result.groupby(group_cols).agg(agg_dict).reset_index()

    elif action == 'impute':
        col = params.get('column')
        strategy = params.get('strategy', 'zero') # 'zero' | 'mean' | 'median' | 'mode' | 'ffill'

        if col in df_result.columns:
            if strategy == 'zero':
                df_result[col] = df_result[col].fillna(0)
            elif strategy == 'mean':
                mean_val = pd.to_numeric(df_result[col], errors='coerce').mean()
                df_result[col] = df_result[col].fillna(mean_val)
            elif strategy == 'median':
                med_val = pd.to_numeric(df_result[col], errors='coerce').median()
                df_result[col] = df_result[col].fillna(med_val)
            elif strategy == 'mode':
                mode_val = df_result[col].mode()[0] if not df_result[col].mode().empty else 'N/A'
                df_result[col] = df_result[col].fillna(mode_val)
            elif strategy == 'ffill':
                df_result[col] = df_result[col].ffill()

    elif action == 'filter':
        col = params.get('column')
        op = params.get('operator', '==')
        val = params.get('value')

        if col in df_result.columns:
            if op == '==':
                df_result = df_result[df_result[col].astype(str) == str(val)]
            elif op == '!=':
                df_result = df_result[df_result[col].astype(str) != str(val)]
            elif op == '>':
                df_result = df_result[pd.to_numeric(df_result[col], errors='coerce') > float(val)]
            elif op == '<':
                df_result = df_result[pd.to_numeric(df_result[col], errors='coerce') < float(val)]
            elif op == 'contains':
                df_result = df_result[df_result[col].astype(str).str.contains(str(val), case=False, na=False)]

    elif action == 'rename':
        old_col = params.get('old_column')
        new_col = params.get('new_column')
        if old_col in df_result.columns and new_col:
            df_result = df_result.rename(columns={old_col: new_col})

    elif action == 'drop_duplicates':
        cols = params.get('columns')
        df_result = df_result.drop_duplicates(subset=cols if cols else None)

    return df_result.replace({np.nan: None})
