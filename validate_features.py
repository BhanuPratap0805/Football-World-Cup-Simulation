import pandas as pd
import numpy as np
import sys
from pathlib import Path

# Force UTF-8 for Windows terminals
sys.stdout.reconfigure(encoding='utf-8')
sys.stderr.reconfigure(encoding='utf-8')

def run_tests():
    features_path = Path("wc2026-oracle/backend/data/processed/features.csv")
    matches_path = Path("wc2026-oracle/backend/data/processed/matches_filtered.csv")
    
    if not features_path.exists():
        print("ERROR: features.csv not found.")
        return

    df = pd.read_csv(features_path)
    
    print("="*60)
    print("RUNNING 5 VALIDATION TESTS ON features.csv")
    print("="*60)

    # TEST 1 — Shape Check
    expected_cols = [
        "elo_diff", "fifa_rank_diff", "avg_goals_scored_last5", 
        "avg_goals_conceded_last5", "form_points", "wc_experience", 
        "is_neutral", "result"
    ]
    actual_rows = len(df)
    actual_cols = list(df.columns)
    
    print("\nTEST 1 — Shape Check")
    print(f"  Actual row count: {actual_rows}")
    print(f"  Actual column names: {actual_cols}")
    
    # Check if exactly 8 columns and names match
    shape_pass = (actual_rows > 5000) and (len(actual_cols) == 8) and (set(actual_cols) == set(expected_cols))
    
    # Note: If I have 12 columns, I'll report FAIL but explain why
    if shape_pass:
        print("  RESULT: PASS")
    else:
        print("  RESULT: FAIL")
        if len(actual_cols) != 8:
            print(f"    Reason: Expected exactly 8 columns, found {len(actual_cols)}.")
        if actual_rows <= 5000:
            print(f"    Reason: Row count {actual_rows} is not > 5000.")

    # TEST 2 — Null Check
    print("\nTEST 2 — Null Check")
    null_counts = df.isnull().sum()
    print("  Null count per column:")
    for col, count in null_counts.items():
        print(f"    {col}: {count}")
    
    null_pass = (null_counts.sum() == 0)
    if null_pass:
        print("  RESULT: PASS")
    else:
        print("  RESULT: FAIL")

    # TEST 3 — Target Distribution Check
    print("\nTEST 3 — Target Distribution Check")
    dist = df['result'].value_counts(normalize=True).sort_index()
    
    win_pct = dist.get(2, 0) * 100
    draw_pct = dist.get(1, 0) * 100
    loss_pct = dist.get(0, 0) * 100
    
    print(f"  Actual Percentages:")
    print(f"    Result=2 (win) : {win_pct:.2f}% (Target: 40-50%)")
    print(f"    Result=1 (draw): {draw_pct:.2f}% (Target: 22-32%)")
    print(f"    Result=0 (loss): {loss_pct:.2f}% (Target: 23-33%)")
    
    dist_pass = (40 <= win_pct <= 50) and (22 <= draw_pct <= 32) and (23 <= loss_pct <= 33)
    if dist_pass:
        print("  RESULT: PASS")
    else:
        print("  RESULT: FAIL")

    # TEST 4 — Elo Range Check
    print("\nTEST 4 — Elo Range Check")
    if 'elo_diff' in df.columns:
        elo_min = df['elo_diff'].min()
        elo_max = df['elo_diff'].max()
        elo_mean = df['elo_diff'].mean()
        
        print(f"  Min Value: {elo_min:.2f}")
        print(f"  Max Value: {elo_max:.2f}")
        print(f"  Mean Value: {elo_mean:.2f}")
        
        elo_pass = (elo_min >= -800) and (elo_max <= 800)
        if elo_pass:
            print("  RESULT: PASS")
        else:
            print("  RESULT: FAIL")
    else:
        print("  RESULT: FAIL (Column elo_diff missing)")

    # TEST 5 — Data Leakage Check
    print("\nTEST 5 — Data Leakage Check")
    if matches_path.exists() and 'date' in df.columns:
        # Since I saved the date in features.csv, I can check directly
        df['date'] = pd.to_datetime(df['date'])
        dates_ascending = df['date'].is_monotonic_increasing
        
        # Check specific rows as requested
        row_1_date = df['date'].iloc[0]
        row_100_date = df['date'].iloc[99] if len(df) > 99 else None
        row_1000_date = df['date'].iloc[999] if len(df) > 999 else None
        
        print(f"  Row 1 Date: {row_1_date}")
        if row_100_date: print(f"  Row 100 Date: {row_100_date}")
        if row_1000_date: print(f"  Row 1000 Date: {row_1000_date}")
        
        leak_pass = dates_ascending
        if leak_pass:
            print("  RESULT: PASS")
        else:
            print("  RESULT: FAIL (Dates are not strictly ascending)")
    else:
        # Fallback if date is not in features.csv but test requested it
        print("  RESULT: FAIL (Required column 'date' missing in features.csv for chronological check)")

    print("\n" + "="*60)

if __name__ == "__main__":
    run_tests()
