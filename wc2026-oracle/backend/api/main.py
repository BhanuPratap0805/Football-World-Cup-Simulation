"""
Phase 4: FastAPI Backend for WC 2026 Oracle
============================================
Exposes the ML model and simulator via REST API endpoints.
"""

# Standard library imports
import json
from datetime import datetime
from pathlib import Path
from typing import Optional

# Third-party imports
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import pandas as pd

# Local imports from the model package
from model.predict import predict_match
from model.simulator import run_full_tournament

# =============================================================================
# APP CONFIGURATION
# =============================================================================

app = FastAPI(
    title="WC 2026 Oracle API",
    description="World Cup 2026 Monte Carlo Simulator and Match Predictor",
    version="1.0.0"
)

# =============================================================================
# CORS CONFIGURATION
# =============================================================================

import os
cors_origins = os.getenv(
    "CORS_ORIGINS",
    "http://localhost:5173,http://localhost:3000,https://wc2026-oracle.vercel.app,https://football-world-cup-simulation.vercel.app,https://football-world-cup-simulation-eq2j3ujk7.vercel.app"
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =============================================================================
# IN-MEMORY CACHE (With Force-Fresh Support)
# =============================================================================

CACHE_TTL_SECONDS = int(os.getenv("CACHE_TTL_SECONDS", "3600"))  # 1 hour default
simulation_cache: dict = {
    "data": None,
    "timestamp": None
}

def get_cached_or_fresh_simulation(force_fresh: bool = False):
    """
    Return cached simulation if valid, otherwise run fresh simulation.
    
    Args:
        force_fresh: If True, bypass cache and run new simulation
    """
    now = datetime.now()
    
    # Bypass cache if force_fresh=True
    if force_fresh:
        print("🔄 Force fresh simulation requested - bypassing cache")
    else:
        # Check if cache is valid
        cache_age = 0
        if simulation_cache["timestamp"]:
            cache_age = (now - simulation_cache["timestamp"]).total_seconds()
        
        if simulation_cache["data"] and cache_age < CACHE_TTL_SECONDS:
            result = simulation_cache["data"].copy()
            result["cached"] = True
            result["cache_age_seconds"] = int(cache_age)
            return result
    
    # Run fresh simulation
    print("Running fresh simulation...")
    results = run_full_tournament(n_simulations=10000)
    
    response = {
        "win_tournament": results.get("win_tournament", {}),
        "reach_final": results.get("reach_final", {}),
        "reach_sf": results.get("reach_sf", {}),
        "reach_qf": results.get("reach_qf", {}),
        "reach_r16": results.get("reach_r16", {}),
        "simulations_run": 10000,
        "generated_at": now.strftime("%Y-%m-%dT%H:%M:%SZ"),
        "cached": False
    }
    
    # Update cache (even for force_fresh, so subsequent non-forced requests benefit)
    simulation_cache["data"] = response.copy()
    simulation_cache["timestamp"] = now
    
    return response

def load_wc2026_teams() -> set:
    groups_path = Path(__file__).parent.parent / "data" / "wc2026_groups.json"
    if not groups_path.exists():
        return set()
    
    with open(groups_path, "r", encoding="utf-8") as f:
        groups_data = json.load(f)
    
    teams = set()
    for group_teams in groups_data.get("groups", {}).values():
        teams.update(group_teams)
    
    return teams

WC2026_TEAMS = load_wc2026_teams()

# =============================================================================
# ENDPOINT 1: Health Check
# =============================================================================

@app.get("/health")
async def health_check():
    return {
        "status": "ok",
        "model_loaded": True,
        "timestamp": datetime.now().strftime("%Y-%m-%dT%H:%M:%SZ")
    }

# =============================================================================
# ENDPOINT 2: Full Tournament Simulation (WITH CACHE-BUSTING)
# =============================================================================

@app.get("/simulate")
def simulate_tournament(
    force_fresh: bool = Query(default=False, description="Force fresh simulation, bypass cache")
):
    """
    Run Monte Carlo simulation of the full World Cup tournament.
    
    Query Parameters:
        force_fresh: If True, bypass cache and run new simulation
    """
    start_time = datetime.now()
    print(f"Starting simulation at {start_time} (force_fresh={force_fresh})")
    
    try:
        results = get_cached_or_fresh_simulation(force_fresh=force_fresh)
        
        elapsed = (datetime.now() - start_time).total_seconds()
        print(f"Simulation completed in {elapsed:.2f}s")
        
        if elapsed > 10.0:
            print(f"WARNING: Simulation took {elapsed:.2f}s - check prediction cache efficiency!")
            
        return results

    except Exception as e:
        print(f"Simulation error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Simulation failed: {str(e)}"
        )

# =============================================================================
# ENDPOINT 3: Specific Matchup Prediction
# =============================================================================

@app.get("/matchup/{team_a}/{team_b}")
async def predict_matchup(
    team_a: str,
    team_b: str,
    is_knockout: bool = Query(default=False, description="Treat as knockout match (no draws)")
):
    if team_a not in WC2026_TEAMS:
        raise HTTPException(
            status_code=404,
            detail=f"Team '{team_a}' not found in WC 2026 teams."
        )
    if team_b not in WC2026_TEAMS:
        raise HTTPException(
            status_code=404,
            detail=f"Team '{team_b}' not found in WC 2026 teams."
        )
    
    try:
        current_elos = _get_team_elos()
        fifa_rankings = _get_fifa_ranks()
        recent_stats = _get_team_stats()
        
        result = predict_match(
            team_a=team_a,
            team_b=team_b,
            current_elos=current_elos,
            fifa_rankings=fifa_rankings,
            recent_stats=recent_stats,
            is_knockout=is_knockout
        )
        
        return {
            "matchup": f"{team_a} vs {team_b}",
            "is_knockout": is_knockout,
            "probabilities": {
                f"{team_a}_win": round(result["team_a_win"], 4),
                "draw": round(result["draw"], 4),
                f"{team_b}_win": round(result["team_b_win"], 4)
            },
            "predicted_winner": team_a if result["team_a_win"] > result["team_b_win"] else team_b,
            "generated_at": datetime.now().strftime("%Y-%m-%dT%H:%M:%SZ")
        }
        
    except Exception as e:
        print(f"Prediction error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Prediction failed: {str(e)}"
        )

# =============================================================================
# ENDPOINT 4: Tournament Bracket
# =============================================================================

@app.get("/bracket")
async def get_bracket():
    try:
        sim_results = get_cached_or_fresh_simulation()
        bracket = {}
        
        r16_probs = sim_results.get("reach_r16", {})
        sorted_r16 = sorted(r16_probs.items(), key=lambda x: x[1], reverse=True)
        bracket["round_of_32"] = [team for team, _ in sorted_r16[:32]]
        
        win_probs = sim_results.get("win_tournament", {})
        sorted_winners = sorted(win_probs.items(), key=lambda x: x[1], reverse=True)
        
        bracket["quarter_finalists"] = [t for t, _ in sorted_winners[:8]]
        bracket["semi_finalists"] = [t for t, _ in sorted_winners[:4]]
        bracket["finalists"] = [t for t, _ in sorted_winners[:2]]
        bracket["champion"] = sorted_winners[0][0] if sorted_winners else None
        
        return {
            "bracket": bracket,
            "generated_at": datetime.now().strftime("%Y-%m-%dT%H:%M:%SZ")
        }
        
    except Exception as e:
        print(f"Bracket error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Bracket generation failed: {str(e)}"
        )

# =============================================================================
# DATA HELPERS
# =============================================================================

def _get_team_elos() -> dict:
    elos = {
        "Argentina": 1988, "France": 1955, "Brazil": 1895, "England": 1890,
        "Spain": 1989, "Germany": 1872, "Netherlands": 1874, "Portugal": 1886,
        "Italy": 1770, "Belgium": 1856, "Croatia": 1780, "Uruguay": 1820,
        "Colombia": 1872, "Japan": 1873, "Morocco": 1825, "USA": 1750,
        "Mexico": 1775, "Canada": 1680, "South Korea": 1780, "Australia": 1720,
        "Saudi Arabia": 1680, "Qatar": 1620, "Iran": 1750, "Egypt": 1680,
        "Senegal": 1785, "Nigeria": 1680, "Ghana": 1620, "Algeria": 1650,
        "Tunisia": 1620, "Cameroon": 1580, "Switzerland": 1720, "Denmark": 1720,
        "Poland": 1700, "Serbia": 1680, "Wales": 1650, "Scotland": 1620,
        "Austria": 1650, "Ukraine": 1650, "Czech Republic": 1580, "Turkey": 1620,
        "Paraguay": 1620, "Chile": 1680, "Ecuador": 1650, "Peru": 1620,
        "Venezuela": 1550, "Costa Rica": 1580, "Panama": 1480, "Jamaica": 1480,
        "Honduras": 1450, "El Salvador": 1420, "New Zealand": 1500,
        "Iraq": 1580, "Jordan": 1550, "Uzbekistan": 1520
    }
    return {t: elos.get(t, 1500) for t in WC2026_TEAMS}

def _get_fifa_ranks() -> dict:
    ranks = {
        "Argentina": 1, "France": 2, "Spain": 3, "England": 4,
        "Brazil": 5, "Netherlands": 6, "Portugal": 7, "Germany": 8,
        "Italy": 9, "Belgium": 10, "Colombia": 11, "Uruguay": 12,
        "Croatia": 13, "Japan": 14, "Morocco": 15, "USA": 16,
        "Mexico": 17, "South Korea": 18, "Australia": 21, "Switzerland": 22,
        "Senegal": 24, "Egypt": 28, "Iran": 20, "Ecuador": 29,
        "Canada": 31, "Denmark": 19, "Serbia": 32, "Poland": 26,
        "Austria": 25, "Algeria": 33, "Tunisia": 34, "Nigeria": 30,
        "Cameroon": 42, "Ghana": 45, "Saudi Arabia": 56, "Qatar": 58,
        "Iraq": 64, "Uzbekistan": 62, "Jordan": 68, "Paraguay": 35,
        "Chile": 40, "Wales": 46, "Scotland": 39, "Czech Republic": 48,
        "Turkey": 44, "Ukraine": 47, "Costa Rica": 52, "Panama": 62,
        "Jamaica": 55, "Honduras": 70, "El Salvador": 75, "New Zealand": 93
    }
    return {t: ranks.get(t, 100) for t in WC2026_TEAMS}

def _get_team_stats() -> dict:
    stats = {}
    for team in WC2026_TEAMS:
        stats[team] = {
            "goals_scored": 1.8,
            "goals_conceded": 1.0,
            "form": 10,
            "wc_exp": 5
        }
    return stats

# =============================================================================
# ENTRY POINT
# =============================================================================

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", "8000"))
    uvicorn.run(app, host="0.0.0.0", port=port)