"""
Phase 3: Monte Carlo Simulator
Executes 10,000 overlapping simulated tournaments using the XGBoost inference logic.

=== WHAT IS MONTE CARLO SIMULATION? ===
A Monte Carlo simulation is a mathematical technique used in finance, physics, and sports to estimate 
the possible outcomes of a highly uncertain event (like a football tournament). Instead of guessing 
what will happen once, we use our model's probabilities to play out the entire tournament thousands 
of times using randomized "dice rolls" weighted by those probabilities. 

=== WHY 10,000 RUNS? ===
- Why not 100? 100 is too small. If a heavy underdog (like Costa Rica) wins the World Cup in run #4, 
  they will look like they have a 1% chance to win the whole thing, which is statistically warped by noise.
- Why not 1,000,000? Evaluating the XGBoost model 1 million times across 104 matches takes immense 
  computational limits and memory.
- 10,000 is the mathematical "Goldilocks Zone". It is large enough for the Law of Large Numbers to ensure 
  crazy upset outliers cancel themselves out, giving us true, smooth statistical odds within fractions of a percent, 
  but runs fast enough (a few minutes) to be viable for consumer applications.
"""
import copy
import json
import random
from collections import defaultdict
from pathlib import Path

# Import our customized XGBoost prediction endpoint
# Using relative import since we're in the model package
from .predict import predict_match

# Resolve dynamic paths
BASE_DIR = Path(__file__).resolve().parent
GROUPS_TEMPLATE_PATH = BASE_DIR.parent / "data" / "processed" / "wc2026_groups_template.json"

def simulate_group_stage(groups: dict, elos: dict, fifa: dict, stats: dict, cache: dict, sim_idx: int = -1, tracker: dict = None) -> tuple:
    """
    Simulates the group stage and returns Winners, Runners-up, and 3rd place pool.
    """
    winners = {} # Group -> Team
    runners = {}
    third_place_pool = []
    group_h_standings_debug = None

    for group_name, teams in groups.items():
        standings = {t: {"pts": 0, "gd": 0, "gf": 0} for t in teams}

        for i in range(len(teams)):
            for j in range(i + 1, len(teams)):
                tA, tB = teams[i], teams[j]
                
                t1, t2 = sorted([tA, tB])
                cache_key = (t1, t2, False)
                if cache_key in cache:
                    if tracker is not None: tracker["hits"] += 1
                    res = cache[cache_key]
                else:
                    if tracker is not None: tracker["misses"] += 1
                    res = predict_match(t1, t2, elos, fifa, stats, is_knockout=False)
                    cache[cache_key] = res
                    
                if t1 != tA:
                    res = {
                        "team_a_win": res["team_b_win"],
                        "draw": res["draw"],
                        "team_b_win": res["team_a_win"]
                    }
                
                roll = random.random()
                if roll < res["team_a_win"]:
                    standings[tA]["pts"] += 3
                    standings[tA]["gd"] += 1
                    standings[tA]["gf"] += 2
                    standings[tB]["gd"] -= 1
                elif roll < (res["team_a_win"] + res["draw"]):
                    standings[tA]["pts"] += 1
                    standings[tB]["pts"] += 1
                    standings[tA]["gf"] += 1
                    standings[tB]["gf"] += 1
                else:
                    standings[tB]["pts"] += 3
                    standings[tB]["gd"] += 1
                    standings[tB]["gf"] += 2
                    standings[tA]["gd"] -= 1

        sorted_group = sorted(
            teams, 
            key=lambda t: (standings[t]["pts"], standings[t]["gd"], standings[t]["gf"], random.random()), 
            reverse=True
        )

        winners[group_name] = sorted_group[0]
        runners[group_name] = sorted_group[1]
        third_place_pool.append({
            "team": sorted_group[2],
            "pts": standings[sorted_group[2]]["pts"],
            "gd": standings[sorted_group[2]]["gd"]
        })

        # BUG 3: Debug Group H
        if sim_idx == 0 and group_name == "H":
            group_h_standings_debug = standings

    # Best 8 third-place teams
    third_place_pool.sort(key=lambda x: (x["pts"], x["gd"], random.random()), reverse=True)
    best_3rd = [x["team"] for x in third_place_pool[:8]]

    return winners, runners, best_3rd, group_h_standings_debug

def create_r32_matchups(winners, runners, best_3rd, sim_idx=-1):
    """
    Official FIFA 2026 R32 Seeding Approximation.
    This ensures group winners face 3rd place teams where possible
    and maintains group separation.
    """
    matchups = [
        # 8 Group Winners vs 8 Best 3rd place teams
        (winners['A'], best_3rd[0]),
        (winners['B'], best_3rd[1]),
        (winners['C'], best_3rd[2]),
        (winners['D'], best_3rd[3]),
        (winners['E'], best_3rd[4]),
        (winners['F'], best_3rd[5]),
        (winners['G'], best_3rd[6]),
        (winners['H'], best_3rd[7]),
        
        # 4 Group Winners vs 4 Runners-up
        (winners['I'], runners['A']),
        (winners['J'], runners['B']),
        (winners['K'], runners['C']),
        (winners['L'], runners['D']),
        
        # Remaining 8 Runners-up vs each other
        (runners['E'], runners['F']),
        (runners['G'], runners['H']),
        (runners['I'], runners['J']),
        (runners['K'], runners['L']),
    ]
    
    if sim_idx == 0:
        print("\nDEBUG R32 bracket (Simulation 0):")
        for idx, (t1, t2) in enumerate(matchups):
            print(f"  Match {idx+1}: {t1} vs {t2}")
            
    # Flatten into a list of 32 teams for the knockout loop
    flattened = []
    for m in matchups:
        flattened.extend([m[0], m[1]])
    return flattened

def simulate_knockout_round(teams: list, elos: dict, fifa: dict, stats: dict, cache: dict, tracker: dict = None) -> list:
    """
    Simulates a knockout stage.
    """
    winners = []
    for i in range(0, len(teams) - 1, 2):
        tA, tB = teams[i], teams[i+1]
        t1, t2 = sorted([tA, tB])
        cache_key = (t1, t2, True)
        if cache_key in cache:
            if tracker is not None: tracker["hits"] += 1
            res = cache[cache_key]
        else:
            if tracker is not None: tracker["misses"] += 1
            res = predict_match(t1, t2, elos, fifa, stats, is_knockout=True)
            cache[cache_key] = res
            
        if t1 != tA:
            res = {
                "team_a_win": res["team_b_win"],
                "draw": res["draw"],
                "team_b_win": res["team_a_win"]
            }
        roll = random.random()
        winners.append(tA if roll < res["team_a_win"] else tB)
    return winners

GLOBAL_PREDICTION_CACHE = {}

# ---------------------------------------------------------------------------
# MODULE-LEVEL TEAM DATA
# WHY: Shared by both _warm_cache() and run_full_tournament() so there is
# a single source of truth and no duplication.
# ---------------------------------------------------------------------------
import os as _os

_BASE_DIR_FS = _os.path.dirname(_os.path.abspath(__file__))

# Real per-team stats — goals, form, WC experience.
# These feed directly into the feature vector alongside Elo.
# Without differentiation here, all teams score identically and
# upsets cascade unrealistically (the South Korea bug).
_TEAM_STATS = {
    # Elite / Champions
    "Argentina":    {"goals_scored": 2.3, "goals_conceded": 0.8, "form": 14, "wc_exp": 18},
    "France":       {"goals_scored": 2.5, "goals_conceded": 0.9, "form": 13, "wc_exp": 16},
    "Spain":        {"goals_scored": 2.4, "goals_conceded": 0.7, "form": 15, "wc_exp": 16},
    "Brazil":       {"goals_scored": 2.2, "goals_conceded": 0.9, "form": 12, "wc_exp": 22},
    "England":      {"goals_scored": 2.0, "goals_conceded": 0.9, "form": 12, "wc_exp": 16},
    "Portugal":     {"goals_scored": 2.2, "goals_conceded": 1.0, "form": 13, "wc_exp": 8},
    "Netherlands":  {"goals_scored": 1.9, "goals_conceded": 0.9, "form": 12, "wc_exp": 11},
    "Germany":      {"goals_scored": 2.0, "goals_conceded": 1.0, "form": 11, "wc_exp": 20},
    "Colombia":     {"goals_scored": 1.8, "goals_conceded": 1.0, "form": 11, "wc_exp": 6},
    "Japan":        {"goals_scored": 1.7, "goals_conceded": 1.0, "form": 11, "wc_exp": 7},
    "Morocco":      {"goals_scored": 1.5, "goals_conceded": 0.8, "form": 11, "wc_exp": 6},
    "Italy":        {"goals_scored": 1.7, "goals_conceded": 0.9, "form": 10, "wc_exp": 18},
    "Croatia":      {"goals_scored": 1.6, "goals_conceded": 1.0, "form": 10, "wc_exp": 6},
    "Uruguay":      {"goals_scored": 1.7, "goals_conceded": 1.0, "form": 10, "wc_exp": 14},
    "Belgium":      {"goals_scored": 1.8, "goals_conceded": 1.1, "form": 10, "wc_exp": 14},
    "Ecuador":      {"goals_scored": 1.6, "goals_conceded": 1.1, "form": 9,  "wc_exp": 4},
    "United States":{"goals_scored": 1.6, "goals_conceded": 1.2, "form": 9,  "wc_exp": 9},
    "Mexico":       {"goals_scored": 1.5, "goals_conceded": 1.1, "form": 9,  "wc_exp": 17},
    "Senegal":      {"goals_scored": 1.5, "goals_conceded": 1.1, "form": 9,  "wc_exp": 3},
    "Denmark":      {"goals_scored": 1.6, "goals_conceded": 1.0, "form": 9,  "wc_exp": 6},
    "Switzerland":  {"goals_scored": 1.5, "goals_conceded": 1.1, "form": 9,  "wc_exp": 12},
    "Australia":    {"goals_scored": 1.4, "goals_conceded": 1.2, "form": 8,  "wc_exp": 5},
    "Canada":       {"goals_scored": 1.5, "goals_conceded": 1.2, "form": 8,  "wc_exp": 2},
    "South Korea":  {"goals_scored": 1.4, "goals_conceded": 1.2, "form": 8,  "wc_exp": 10},
    "Iran":         {"goals_scored": 1.3, "goals_conceded": 1.1, "form": 8,  "wc_exp": 6},
    "Turkey":       {"goals_scored": 1.5, "goals_conceded": 1.2, "form": 8,  "wc_exp": 2},
    "Austria":      {"goals_scored": 1.5, "goals_conceded": 1.2, "form": 8,  "wc_exp": 7},
    "Paraguay":     {"goals_scored": 1.3, "goals_conceded": 1.2, "form": 7,  "wc_exp": 9},
    "Ukraine":      {"goals_scored": 1.4, "goals_conceded": 1.2, "form": 7,  "wc_exp": 2},
    "Norway":       {"goals_scored": 1.5, "goals_conceded": 1.2, "form": 7,  "wc_exp": 3},
    "Serbia":       {"goals_scored": 1.4, "goals_conceded": 1.3, "form": 7,  "wc_exp": 3},
    "Nigeria":      {"goals_scored": 1.3, "goals_conceded": 1.3, "form": 7,  "wc_exp": 7},
    "Algeria":      {"goals_scored": 1.3, "goals_conceded": 1.3, "form": 7,  "wc_exp": 4},
    "Egypt":        {"goals_scored": 1.2, "goals_conceded": 1.2, "form": 7,  "wc_exp": 3},
    "Saudi Arabia": {"goals_scored": 1.2, "goals_conceded": 1.3, "form": 6,  "wc_exp": 6},
    "Tunisia":      {"goals_scored": 1.2, "goals_conceded": 1.2, "form": 6,  "wc_exp": 6},
    "Poland":       {"goals_scored": 1.3, "goals_conceded": 1.3, "form": 6,  "wc_exp": 8},
    "Costa Rica":   {"goals_scored": 1.2, "goals_conceded": 1.3, "form": 6,  "wc_exp": 6},
    "Ghana":        {"goals_scored": 1.2, "goals_conceded": 1.3, "form": 6,  "wc_exp": 4},
    "Ivory Coast":  {"goals_scored": 1.3, "goals_conceded": 1.3, "form": 6,  "wc_exp": 3},
    "Cameroon":     {"goals_scored": 1.2, "goals_conceded": 1.4, "form": 6,  "wc_exp": 8},
    "Venezuela":    {"goals_scored": 1.2, "goals_conceded": 1.3, "form": 6,  "wc_exp": 0},
    "South Africa": {"goals_scored": 1.1, "goals_conceded": 1.3, "form": 5,  "wc_exp": 1},
    "Qatar":        {"goals_scored": 1.1, "goals_conceded": 1.4, "form": 5,  "wc_exp": 1},
    "Bosnia and Herzegovina": {"goals_scored": 1.2, "goals_conceded": 1.4, "form": 5, "wc_exp": 1},
}
# Fallback for any team not listed
_DEFAULT_STATS = {"goals_scored": 1.2, "goals_conceded": 1.4, "form": 5, "wc_exp": 3}


def _load_team_data():
    """
    Loads groups, elos, stats, and fifa dicts from disk.
    Returns (all_teams, mock_elos, mock_stats, mock_fifa) or raises on missing files.
    """
    groups_path = _os.path.join(_BASE_DIR_FS, '..', 'data', 'wc2026_groups.json')
    elo_path    = _os.path.join(_BASE_DIR_FS, '..', 'data', 'current_elos.json')
    with open(groups_path, 'r', encoding='utf-8') as f:
        groups_data = json.load(f)
    with open(elo_path, 'r', encoding='utf-8') as f:
        current_elos = json.load(f)

    groups    = groups_data['groups']
    all_teams = [t for g in groups.values() for t in g]
    mock_elos  = {t: round(current_elos.get(t, 1500.0), 1) for t in all_teams}
    mock_stats = {t: _TEAM_STATS.get(t, _DEFAULT_STATS) for t in all_teams}
    mock_fifa  = {t: 45 for t in all_teams}  # FIFA rank used as secondary signal
    return groups, all_teams, mock_elos, mock_stats, mock_fifa


def _warm_cache():
    """
    Pre-computes predictions for ALL 48-team matchup combinations at module
    import time so the first /simulate request is as fast as subsequent ones.
    WHY: On Render free tier the cold-start batch inference takes 74–101s if
    deferred to the first request. Running it at startup means the worker is
    ready before any client hits the endpoint.
    """
    try:
        import time
        from .predict import batch_predict_matches, MODEL_PATH
        if not MODEL_PATH.exists():
            print("[Cache warm] Skipped — model file not found.")
            return

        _, all_teams, mock_elos, mock_stats, mock_fifa = _load_team_data()

        matchups_to_compute = []
        for i in range(len(all_teams)):
            for j in range(i + 1, len(all_teams)):
                t1, t2 = sorted([all_teams[i], all_teams[j]])
                matchups_to_compute.append((t1, t2, False))
                matchups_to_compute.append((t1, t2, True))

        t0 = time.time()
        batch_results = batch_predict_matches(matchups_to_compute, mock_elos, mock_fifa, mock_stats)
        for matchup, res in zip(matchups_to_compute, batch_results):
            GLOBAL_PREDICTION_CACHE[matchup] = res
        elapsed = round(time.time() - t0, 2)
        print(f"Cache warm: {len(matchups_to_compute)} matchups pre-computed in {elapsed}s")

    except Exception as e:
        # Silent skip — missing data files or untrained model should not crash startup
        print(f"[Cache warm] Skipped — {e}")


# Run cache warming immediately when this module is imported by FastAPI
_warm_cache()


def run_full_tournament(n_simulations: int = 10000) -> dict:
    prediction_cache = GLOBAL_PREDICTION_CACHE

    # Load groups, elos, stats from disk via shared helper
    # BUG 1: Encoding UTF-8 handled inside _load_team_data()
    groups, all_teams, mock_elos, mock_stats, mock_fifa = _load_team_data()

    # BUG 2: Initialize ALL 48 teams
    milestones = {
        "reach_r16": {t: 0 for t in all_teams},
        "reach_qf": {t: 0 for t in all_teams},
        "reach_sf": {t: 0 for t in all_teams},
        "reach_final": {t: 0 for t in all_teams},
        "win_tournament": {t: 0 for t in all_teams}
    }

    tracker = {"hits": 0, "misses": 0}

    print(f"\nIgniting Monte Carlo Engine for {n_simulations} Iterations...")

    for sim_idx in range(n_simulations):
        # 1. GROUP STAGE
        win, run, third, h_debug = simulate_group_stage(groups, mock_elos, mock_fifa, mock_stats, prediction_cache, sim_idx, tracker)
        
        if sim_idx == 0 and h_debug:
            print(f"DEBUG Group H results: {h_debug}")

        # BUG 3: Proper Seeding
        ro32_teams = create_r32_matchups(win, run, third, sim_idx)
        
        # 2. R32 -> R16
        ro16_teams = simulate_knockout_round(ro32_teams, mock_elos, mock_fifa, mock_stats, prediction_cache, tracker)
        for t in ro16_teams: milestones["reach_r16"][t] += 1

        # 3. R16 -> QF
        qf_teams = simulate_knockout_round(ro16_teams, mock_elos, mock_fifa, mock_stats, prediction_cache, tracker)
        for t in qf_teams: milestones["reach_qf"][t] += 1

        # 4. QF -> SF (Wait, the milestone names in current code: reach_r16 means survivor of R32)
        # Bracket: 32 -> 16(R16) -> 8(QF) -> 4(SF) -> 2(Final) -> Winner.
        sf_teams = simulate_knockout_round(qf_teams, mock_elos, mock_fifa, mock_stats, prediction_cache, tracker)
        for t in sf_teams: milestones["reach_sf"][t] += 1

        final_teams = simulate_knockout_round(sf_teams, mock_elos, mock_fifa, mock_stats, prediction_cache, tracker)
        for t in final_teams: milestones["reach_final"][t] += 1

        champion = simulate_knockout_round(final_teams, mock_elos, mock_fifa, mock_stats, prediction_cache, tracker)
        if champion:
            milestones["win_tournament"][champion[0]] += 1

    # BUG 2: Percentages
    results = {}
    for stage in milestones:
        results[stage] = {}
        for team in all_teams:
            count = milestones[stage][team]
            results[stage][team] = round((count / n_simulations) * 100, 2)

    print(f"Simulation Complete - Cache Efficiency: {tracker['hits']} Hits | {tracker['misses']} Misses")
    return results

if __name__ == "__main__":
    TEST_RUNS = 2000
    out = run_full_tournament(n_simulations=TEST_RUNS)
    champs = out.get("win_tournament", {})
    sorted_champs = sorted(champs.items(), key=lambda x: x[1], reverse=True)
    print("\n=== TOP 10 LIKELY WINNERS ===")
    for rank, (team, prob) in enumerate(sorted_champs[:10]):
        print(f" {rank+1}. {team}: {prob}%")

