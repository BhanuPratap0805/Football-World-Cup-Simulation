"""
Phase 3: Match Prediction
Runs inference using our saved XGBoost model, constructing valid 
feature vectors on-the-fly and resolving knockout match rules.
"""
# Import json for debug output formatting.
import json
# Import random to simulate penalty shootouts.
import random
# Import pathlib for robust file resolution.
from pathlib import Path
# Import pandas to build the input feature row.
import pandas as pd
# Import XGBClassifier to load the serialized tree weights.
from xgboost import XGBClassifier

# Anchor the file paths.
# WHY: Allows prediction requests from any script or web endpoint reliably.
BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = BASE_DIR / "xgb_wc2026.json"
MATCHES_PATH = BASE_DIR.parent / "data" / "processed" / "matches_filtered.csv"

# --- STEP 4: LOAD WORLD CUP CALIBRATED ELOS ---
import json, os
BASE_DIR_FS = os.path.dirname(os.path.abspath(__file__))
elo_path = os.path.join(BASE_DIR_FS, '..', 'data', 'current_elos.json')
with open(elo_path, 'r', encoding='utf-8') as f:
    CURRENT_ELOS = json.load(f)

# Default to 1500 only if team not found
def get_elo(team):
    return CURRENT_ELOS.get(team, 1500.0)

# Load the model directly at module load time (in memory cache).
# WHY: Loading the JSON file for every single match simulation would be extremely slow
# when we run 10,000 tournaments (10,000 * 104 matches = 1 million loads!).
xgb_model = XGBClassifier()
# Check if model exists before loading to prevent import crash if train.py hasn't run yet.
if MODEL_PATH.exists():
    xgb_model.load_model(MODEL_PATH)

# Pre-compute head-to-head history from matches data for h2h_win_rate feature.
# Key: tuple of (team_a, team_b) sorted alphabetically.
# Value: list of results from team_a's perspective (2=win, 1=draw, 0=loss).
_h2h_history: dict = {}

import numpy as np

def _load_h2h_history():
    """Load historical matches and compute head-to-head records using fast vectorization."""
    global _h2h_history
    if not MATCHES_PATH.exists():
        return

    df = pd.read_csv(MATCHES_PATH)

    # 1. Determine "Team 1" (alphabetically first) and "Team 2" for each matchup
    # This creates a standardized symmetric key regardless of who was home/away.
    df.loc[:, 'team_1'] = np.where(df['home_team'] < df['away_team'], df['home_team'], df['away_team'])
    df.loc[:, 'team_2'] = np.where(df['home_team'] < df['away_team'], df['away_team'], df['home_team'])
    
    # 2. Calculate result from Team 1's perspective
    # First get home team's result: 2=Win, 1=Draw, 0=Loss
    home_res = np.where(df['home_score'] > df['away_score'], 2, 
               np.where(df['home_score'] < df['away_score'], 0, 1))
    
    # If home_team is team_1, use home_res. If not, use reverse (2-home_res)
    df.loc[:, 't1_res'] = np.where(df['home_team'] == df['team_1'], home_res, 2 - home_res)
    
    # 3. Build a dictionary of results grouped by the team-pair key
    # WHY: GroupBy + apply(list) is the most efficient way to bucket results in Pandas.
    df.loc[:, 'key'] = list(zip(df['team_1'], df['team_2']))
    _h2h_history = df.groupby('key')['t1_res'].apply(list).to_dict()

# Load h2h history at module import time
_load_h2h_history()

def compute_h2h_win_rate(team_a: str, team_b: str) -> float:
    """
    Compute head-to-head win rate for team_a vs team_b.
    Returns 0.5 if fewer than 3 historical meetings.
    """
    key = tuple(sorted([team_a, team_b]))
    results = _h2h_history.get(key, [])

    if len(results) < 3:
        return 0.5

    # Calculate win rate for the alphabetically first team in the key
    first_team = key[0]
    team_a_wins = sum(1 for r in results if r == 2)

    # If team_a is the first team in key, use direct win rate
    if team_a == first_team:
        return team_a_wins / len(results)
    else:
        # team_a is second team, so win rate = 1 - first_team_win_rate
        return 1 - (team_a_wins / len(results))

def predict_match(team_a: str, team_b: str, 
                  current_elos: dict = None, 
                  fifa_rankings: dict = None,
                  recent_stats: dict = None,
                  is_knockout: bool = False) -> dict:
    """
    Simulates a match and returns the precise win/draw/loss probability distribution.
    For knockout games, forces a conclusive winner using extra time/penalty probability mechanics.
    """
    # Use global CURRENT_ELOS or fall back to provided dict
    elo_a = get_elo(team_a) if current_elos is None else current_elos.get(team_a, 1500)
    elo_b = get_elo(team_b) if current_elos is None else current_elos.get(team_b, 1500)
    
    # Defaults for other dictionaries if not provided (Phase 4/5 integration)
    fifa_rankings = fifa_rankings or {}
    recent_stats = recent_stats or {}
    
    # 1. EXTRACT DATA FOR TEAM A
    # Get FIFA Rank, default to 104.5 (historical median) if missing.
    rank_a = fifa_rankings.get(team_a, 104.5)
    # Safely get team A's recent stats dict.
    stats_a = recent_stats.get(team_a, {})
    
    # 2. EXTRACT DATA FOR TEAM B
    rank_b = fifa_rankings.get(team_b, 104.5)
    stats_b = recent_stats.get(team_b, {})

    # 3. BUILD THE ENGINEERED DIFFERENTIALS (Symmetry Logic from Phase 2)
    # WHY: The XGBoost model only understands comparative differences, not raw values.
    elo_diff = elo_a - elo_b
    fifa_rank_diff = rank_a - rank_b
    # If stats are missing, default to 0 differential because we have no data advantage.
    avg_goals_scored_last5 = stats_a.get("goals_scored", 1.5) - stats_b.get("goals_scored", 1.5)
    avg_goals_conceded_last5 = stats_a.get("goals_conceded", 1.2) - stats_b.get("goals_conceded", 1.2)
    form_points = stats_a.get("form", 5) - stats_b.get("form", 5)
    wc_experience = stats_a.get("wc_exp", 0) - stats_b.get("wc_exp", 0)
    
    # Is Neutral is always 1 (True) for the World Cup except if Canada/Mexico/USA play at home.
    # We simplify this to 1 here as it's a generic World Cup simulator context.
    is_neutral = 1
    if team_a in ["Canada", "Mexico", "United States"] or team_b in ["Canada", "Mexico", "United States"]:
        is_neutral = 0

    # Compute h2h_win_rate from historical head-to-head data
    h2h_win_rate = compute_h2h_win_rate(team_a, team_b)

    # 4. CONSTRUCT PANDAS ROW
    # WHY: XGBoost needs the exact array structure and column names it trained on.
    FEATURE_COLS = [
        'elo_diff', 'fifa_rank_diff', 'avg_goals_scored_last5',
        'avg_goals_conceded_last5', 'form_points', 
        'wc_experience', 'is_neutral', 'h2h_win_rate'
    ]
    
    feature_row = pd.DataFrame([{
        'elo_diff': elo_diff,
        'fifa_rank_diff': fifa_rank_diff,
        'avg_goals_scored_last5': avg_goals_scored_last5,
        'avg_goals_conceded_last5': avg_goals_conceded_last5,
        'form_points': form_points,
        'wc_experience': wc_experience,
        'is_neutral': is_neutral,
        'h2h_win_rate': h2h_win_rate
    }])
    
    # Enforce strict column ordering expected by XGBoost
    feature_row = feature_row[FEATURE_COLS]

    # 5. INFERENCE (Run the Model)
    # predict_proba returns an array of probabilities for [Class 0, Class 1, Class 2]
    probs = xgb_model.predict_proba(feature_row)[0]
    
    # Map probabilities to explicit variables (matching our 0, 1, 2 logic from Phase 2).
    # 0 = team A loss (meaning Team B wins)
    # 1 = Draw
    # 2 = team A win
    prob_b_win = float(probs[0])
    prob_draw = float(probs[1])
    prob_a_win = float(probs[2])

    result_dict = {
        "team_a_win": prob_a_win,
        "draw": prob_draw,
        "team_b_win": prob_b_win
    }

    # 6. KNOCKOUT RESOLUTION MECHANIC
    # WHY: In the Round of 32 onwards, a draw during 90 minutes is impossible on the final scorecard. 
    # The game proceeds to extra time and penalties. We must eliminate the 'draw' probability 
    # and assign those odds back to Team A or Team B based on penalty likelihood.
    if is_knockout:
        # First, we remove the draw.
        result_dict["draw"] = 0.0
        
        # We need to distribute the "draw_probability" to A and B.
        # Historically, penalty shootouts are roughly a 50/50 coinflip regardless of skill gap.
        # However, a slight extra-time advantage usually falls to the team that was favored to win anyway.
        # To reflect this, we split the draw probability exactly according to their existing win ratio.
        # Example: If A had 60% win, B had 40% win (ignoring draw), A gets 60% of the draw pie.
        
        base_win_total = prob_a_win + prob_b_win
        # Prevent division by zero if for some bizarre algorithmic reason both teams had 0% chance.
        if base_win_total > 0:
            # Proportionally distribute the draw pie
            added_to_a = prob_draw * (prob_a_win / base_win_total)
            added_to_b = prob_draw * (prob_b_win / base_win_total)
            
            result_dict["team_a_win"] += added_to_a
            result_dict["team_b_win"] += added_to_b
        else:
            # Pure literal 50/50 fallback 
            result_dict["team_a_win"] = 0.5
            result_dict["team_b_win"] = 0.5
            
        # Optional constraint: ensure math floating points sum cleanly to 1.0
        total = result_dict["team_a_win"] + result_dict["team_b_win"]
        result_dict["team_a_win"] /= total
        result_dict["team_b_win"] /= total

    return result_dict

def batch_predict_matches(matchups: list, current_elos: dict = None, fifa_rankings: dict = None, recent_stats: dict = None) -> list:
    """
    Simulates a batch of matches to pre-populate the prediction cache.
    Drastically reduces overhead by passing a single DataFrame to XGBoost.
    matchups: list of tuples (team_a, team_b, is_knockout)
    """
    if not matchups:
        return []

    feature_rows = []
    fifa_rankings = fifa_rankings or {}
    recent_stats = recent_stats or {}

    for team_a, team_b, is_knockout in matchups:
        elo_a = get_elo(team_a) if current_elos is None else current_elos.get(team_a, 1500)
        elo_b = get_elo(team_b) if current_elos is None else current_elos.get(team_b, 1500)
        
        rank_a = fifa_rankings.get(team_a, 104.5)
        stats_a = recent_stats.get(team_a, {})
        
        rank_b = fifa_rankings.get(team_b, 104.5)
        stats_b = recent_stats.get(team_b, {})
        
        elo_diff = elo_a - elo_b
        fifa_rank_diff = rank_a - rank_b
        avg_goals_scored_last5 = stats_a.get("goals_scored", 1.5) - stats_b.get("goals_scored", 1.5)
        avg_goals_conceded_last5 = stats_a.get("goals_conceded", 1.2) - stats_b.get("goals_conceded", 1.2)
        form_points = stats_a.get("form", 5) - stats_b.get("form", 5)
        wc_experience = stats_a.get("wc_exp", 0) - stats_b.get("wc_exp", 0)
        
        is_neutral = 1
        if team_a in ["Canada", "Mexico", "United States"] or team_b in ["Canada", "Mexico", "United States"]:
            is_neutral = 0
            
        h2h_win_rate = compute_h2h_win_rate(team_a, team_b)
        
        feature_rows.append([
            elo_diff,
            fifa_rank_diff,
            avg_goals_scored_last5,
            avg_goals_conceded_last5,
            form_points,
            wc_experience,
            is_neutral,
            h2h_win_rate
        ])
        
    FEATURE_COLS = [
        'elo_diff', 'fifa_rank_diff', 'avg_goals_scored_last5',
        'avg_goals_conceded_last5', 'form_points', 
        'wc_experience', 'is_neutral', 'h2h_win_rate'
    ]
    df = pd.DataFrame(feature_rows, columns=FEATURE_COLS)
    
    probs_array = xgb_model.predict_proba(df)
    
    results = []
    for i, (team_a, team_b, is_knockout) in enumerate(matchups):
        probs = probs_array[i]
        prob_b_win = float(probs[0])
        prob_draw = float(probs[1])
        prob_a_win = float(probs[2])
        
        result_dict = {
            "team_a_win": prob_a_win,
            "draw": prob_draw,
            "team_b_win": prob_b_win
        }
        
        if is_knockout:
            result_dict["draw"] = 0.0
            base_win_total = prob_a_win + prob_b_win
            if base_win_total > 0:
                added_to_a = prob_draw * (prob_a_win / base_win_total)
                added_to_b = prob_draw * (prob_b_win / base_win_total)
                result_dict["team_a_win"] += added_to_a
                result_dict["team_b_win"] += added_to_b
            else:
                result_dict["team_a_win"] = 0.5
                result_dict["team_b_win"] = 0.5
            total = result_dict["team_a_win"] + result_dict["team_b_win"]
            result_dict["team_a_win"] /= total
            result_dict["team_b_win"] /= total
            
        results.append(result_dict)
        
    return results

if __name__ == "__main__":
    # If the model file is missing, halt execution and tell the user.
    if not MODEL_PATH.exists():
        print(f"ERROR: Model unvailable. Please run 'train.py' first to generate {MODEL_PATH.name}")
        exit(1)

    print("=== Testing predict_match() ===")
    
    # Give the simulator realistic dummy historical data for testing.
    mock_elos = {
        "Brazil": 2043.5,
        "France": 2011.2,
        "Mexico": 1780.0
    }
    
    mock_fifa_ranks = {
        "Brazil": 1,
        "France": 2,
        "Mexico": 12
    }
    
    mock_stats = {
        "Brazil": {"goals_scored": 2.8, "goals_conceded": 0.5, "form": 15, "wc_exp": 22},
        "France": {"goals_scored": 2.4, "goals_conceded": 0.8, "form": 12, "wc_exp": 16},
        "Mexico": {"goals_scored": 1.2, "goals_conceded": 1.5, "form": 4,  "wc_exp": 17}
    }

    # Run a classic heavy-weight bout (Group Stage / standard simulation)
    print("\n[GROUP STAGE] Brazil vs France")
    res1 = predict_match("Brazil", "France", mock_elos, mock_fifa_ranks, mock_stats)
    print(json.dumps(res1, indent=2))
    
    # Notice the knockout flag is True here! The draw percentage will be zeroed out.
    print("\n[KNOCKOUT FINAL] France vs Mexico")
    res2 = predict_match("France", "Mexico", mock_elos, mock_fifa_ranks, mock_stats, is_knockout=True)
    print(json.dumps(res2, indent=2))
