import pandas as pd
import numpy as np
from pathlib import Path
from datetime import datetime, timedelta

def main():
    print("Generating mock data for testing...")
    
    # 1. Generate fifa_rankings.csv mock
    # We need rank, country_full, total_points
    teams = ["Argentina", "France", "Brazil", "England", "Belgium", "Spain", "Netherlands", "Portugal", "Italy", "Croatia", "United States", "Mexico", "Canada", "Germany", "Senegal"]
    
    # Randomly assign ranks
    ranks_data = {
        "rank": np.arange(1, len(teams) + 1),
        "country_full": np.random.choice(teams, size=len(teams), replace=False),
        "total_points": np.linspace(2000, 1500, len(teams))
    }
    
    rankings_df = pd.DataFrame(ranks_data)
    
    rankings_path = Path("wc2026-oracle/backend/data/raw/fifa_rankings.csv")
    rankings_path.parent.mkdir(parents=True, exist_ok=True)
    rankings_df.to_csv(rankings_path, index=False)
    print(f"Mock rankings saved to: {rankings_path}")
    
    # 2. Generate results.csv mock
    # Columns: date, home_team, away_team, home_score, away_score, tournament, city, country, neutral
    print("Generating historic match records...")
    
    match_rows = []
    
    start_date = datetime(1990, 1, 1)
    
    for i in range(25000): # Create roughly 25k matches to simulate Kaggle set
        match_date = start_date + timedelta(days=np.random.randint(0, 12000))
        
        home = np.random.choice(teams)
        away = np.random.choice(teams)
        while away == home:
            away = np.random.choice(teams)
            
        home_score = np.random.poisson(1.5)
        away_score = np.random.poisson(1.1)
        
        # Determine tournament randomly with sensible weighting
        t_roll = np.random.random()
        if t_roll < 0.05:
            tournament = "FIFA World Cup"
        elif t_roll < 0.25:
            tournament = "FIFA World Cup qualification"
        elif t_roll < 0.60:
            tournament = "Friendly"
        else:
            tournament = "Continental Cup"
            
        neutral = True if tournament == "FIFA World Cup" else np.random.choice([False, True], p=[0.8, 0.2])
            
        match_rows.append({
            "date": match_date.strftime("%Y-%m-%d"),
            "home_team": home,
            "away_team": away,
            "home_score": home_score,
            "away_score": away_score,
            "tournament": tournament,
            "city": "MockCity",
            "country": home if not neutral else "NeutralCountry",
            "neutral": neutral
        })
        
    results_df = pd.DataFrame(match_rows)
    # Sort chronologically to roughly simulate real data
    results_df = results_df.sort_values("date")
    
    results_path = Path("wc2026-oracle/backend/data/raw/results.csv")
    results_df.to_csv(results_path, index=False)
    print(f"Mock results saved to: {results_path} ({len(results_df)} rows)")

if __name__ == "__main__":
    main()
