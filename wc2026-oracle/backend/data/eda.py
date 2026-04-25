"""Run basic exploratory statistics for international football matches."""

# Import pathlib to build reliable file paths from this script location.
# We need consistent paths so this script runs locally and in deployment containers.
from pathlib import Path

# Import pandas for CSV loading and DataFrame analytics.
# We need pandas to compute summary statistics efficiently on match data.
import pandas as pd

# Point to this script's directory.
# We need a stable base path to locate processed data files.
BASE_DIR = Path(__file__).resolve().parent

# Define the input path for filtered match data created by load_data.py.
# We need this curated dataset so EDA reflects the modern-era match subset.
MATCHES_PATH = BASE_DIR / "processed" / "matches_filtered.csv"


# Define main execution function for clear script structure.
# We need organized control flow so future EDA additions remain maintainable.
def main() -> None:
    # Print section heading for easier terminal scanning.
    # We need readable output because this script is intended for quick diagnostics.
    print("=== WC2026 Oracle EDA (1990+) ===")

    # Load processed matches CSV into a DataFrame.
    # We need match-level records to compute all requested aggregate statistics.
    matches_df = pd.read_csv(MATCHES_PATH)

    # Compute total number of matches (rows).
    # We need dataset size awareness before trusting downstream statistics.
    total_matches = len(matches_df)

    # Print total match count.
    # We need this top-level metric as a baseline health check.
    print(f"1) Total matches in dataset: {total_matches}")

    # Build a combined team Series from home and away team columns.
    # We need both columns together to count unique teams and participation volume.
    all_teams = pd.concat([matches_df["home_team"], matches_df["away_team"]], ignore_index=True)

    # Compute number of unique teams.
    # We need entity coverage insight to judge model generalization potential.
    unique_teams = all_teams.nunique()

    # Print unique team count.
    # We need a quick signal of how broad the dataset is across nations.
    print(f"2) Total unique teams: {unique_teams}")

    # Compute match appearances by team from combined home/away entries.
    # We need participation frequency to identify high-sample teams for robust modeling.
    team_match_counts = all_teams.value_counts()

    # Extract top 10 teams by total matches played.
    # We need this ranking to understand which teams dominate the historical sample.
    top_10_teams = team_match_counts.head(10)

    # Print top-10 heading.
    # We need clear formatting to separate this block from scalar metrics.
    print("3) Top 10 teams by total matches played:")

    # Print the top-10 team counts table.
    # We need concrete team frequencies for initial dataset sanity checks.
    print(top_10_teams)

    # Compute mean home goals per match.
    # We need home scoring baseline for feature calibration and simulator priors.
    avg_home_goals = matches_df["home_score"].mean()

    # Compute mean away goals per match.
    # We need away scoring baseline to compare venue effects in future modeling.
    avg_away_goals = matches_df["away_score"].mean()

    # Print average home/away goals.
    # We need expected scoring rates for baseline model assumptions.
    print(f"4) Average goals per match -> home: {avg_home_goals:.3f}, away: {avg_away_goals:.3f}")

    # Create boolean mask where home team wins.
    # We need this to calculate home win rate directly from score outcomes.
    home_wins = matches_df["home_score"] > matches_df["away_score"]

    # Create boolean mask where away team wins.
    # We need this to calculate away win rate for home-advantage context.
    away_wins = matches_df["away_score"] > matches_df["home_score"]

    # Create boolean mask where match is a draw.
    # We need draw frequency to model full three-way outcome probabilities.
    draws = matches_df["home_score"] == matches_df["away_score"]

    # Convert home wins mask to percentage.
    # We need normalized rates instead of raw counts for interpretable comparisons.
    home_win_rate = home_wins.mean() * 100

    # Convert away wins mask to percentage.
    # We need rate format to compare with home and draw outcomes consistently.
    away_win_rate = away_wins.mean() * 100

    # Convert draws mask to percentage.
    # We need draw probability as part of baseline outcome distribution.
    draw_rate = draws.mean() * 100

    # Print home/away/draw win rates.
    # We need this to quantify historical outcome imbalance before training classifiers.
    print(
        "5) Win rates -> "
        f"home: {home_win_rate:.2f}%, "
        f"away: {away_win_rate:.2f}%, "
        f"draw: {draw_rate:.2f}%"
    )

    # Build mask for matches with tournament exactly equal to 'FIFA World Cup'.
    # We need a clean subset to compare World Cup dynamics with general international matches.
    world_cup_mask = matches_df["tournament"].astype(str).str.strip().eq("FIFA World Cup")

    # Filter DataFrame to World Cup matches only.
    # We need this subset for WC-specific count and scoring analysis.
    world_cup_df = matches_df[world_cup_mask]

    # Count World Cup matches.
    # We need to know WC sample size to assess reliability of WC-specific metrics.
    world_cup_match_count = len(world_cup_df)

    # Print World Cup match count.
    # We need a direct indicator of tournament-specific data availability.
    print(f"6) Number of FIFA World Cup matches: {world_cup_match_count}")

    # Compute average total goals per match over all matches.
    # We need a global scoring benchmark for comparison against World Cup games.
    avg_total_goals_all = (matches_df["home_score"] + matches_df["away_score"]).mean()

    # Compute average total goals per match for World Cup subset.
    # We need this to test whether World Cup games are historically higher/lower scoring.
    avg_total_goals_wc = (world_cup_df["home_score"] + world_cup_df["away_score"]).mean()

    # Print all-matches vs World-Cup average goals.
    # We need this comparison to inform tournament-specific simulation assumptions.
    print(
        "7) Average total goals per match -> "
        f"all matches: {avg_total_goals_all:.3f}, "
        f"FIFA World Cup: {avg_total_goals_wc:.3f}"
    )


# Guard execution so this code runs only when file is called directly.
# We need this pattern to allow safe import without triggering script side effects.
if __name__ == "__main__":
    # Run the EDA workflow.
    # We need this call so the requested statistics are actually produced.
    main()
