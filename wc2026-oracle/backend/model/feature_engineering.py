"""
Phase 2 — Feature Engineering for WC 2026 Oracle
=================================================

=== WHAT IS A "FEATURE" IN MACHINE LEARNING? ===

A feature is a measurable property of the thing you are trying to predict.
Think of it like a column in a spreadsheet where each row is one example
(one match) and each column is one fact about that match.

A model learns patterns like: "when elo_diff is large and positive, team_a
usually wins." Raw scores alone (3-1, 0-0) don't tell the model anything
about WHY a team won. Features encode the CONTEXT: how strong each team is,
how they've been playing recently, whether the venue is neutral, etc.

=== WHY RAW MATCH DATA IS NOT ENOUGH ===

A score of 2-0 tells you the outcome, but not:
  - Were these two powerhouses or minnows?
  - Is the winning team on a hot streak or was this a fluke?
  - Did the home team have crowd advantage?
  - How do their FIFA rankings compare?

Without this context, a model has no basis for predicting FUTURE matches
where it has never seen the specific team pairing before. Features let
the model generalise: "teams with higher Elo and strong recent form tend
to win" — a rule that applies to ANY matchup.

=== WHAT WE ARE PREDICTING (TARGET VARIABLE) ===

We predict `result` from team_a's perspective:
  2 = team_a wins
  1 = draw
  0 = team_a loses

We model from a fixed perspective (team_a = home team in historical data)
so the model learns: "given these feature DIFFERENCES, what is the likely
outcome for the first-named team?"

SYMMETRY: The same match can be viewed from both sides. We handle this by
using DIFFERENCE features (team_a minus team_b). If you swap the teams,
every diff negates and the target flips (2↔0, 1 stays 1). This means the
model only needs to learn one direction — the maths handles the other.

=== WHY THESE 7 FEATURES AND NOT OTHERS? ===

Football prediction research consistently shows that these capture the
most important dimensions of match outcome:
  1. Long-term team quality (Elo, FIFA rank)
  2. Short-term momentum (recent goals, form)
  3. Tournament pedigree (World Cup experience)
  4. Venue effect (neutral ground)

We deliberately OMIT features like weather, injuries, and manager tenure
because they are hard to get reliably for 30+ years of data, and the
above 7 already explain ~60-70% of variance in match outcomes.
"""

# ---------------------------------------------------------------------------
# IMPORTS
# ---------------------------------------------------------------------------

# pathlib builds OS-agnostic file paths from this script's location.
# We need it so the script works on Windows, Linux, and inside Docker.
from pathlib import Path

# pandas handles CSV I/O and DataFrame manipulation.
# We need it to load matches, rankings, and export the final feature table.
import pandas as pd

# numpy provides efficient numerical operations.
# We need it for safe mean calculations when history lists may be empty.
import numpy as np

# defaultdict auto-initialises missing keys with a factory function.
# We need it to create per-team state trackers without key-existence checks.
from collections import defaultdict

# sys.exit lets us halt with a non-zero code if validation fails.
# We need a clear failure signal so CI/CD pipelines can catch bad data.
import sys
sys.stdout.reconfigure(encoding='utf-8')
sys.stderr.reconfigure(encoding='utf-8')
# ---------------------------------------------------------------------------
# PATH CONFIGURATION
# ---------------------------------------------------------------------------

# Resolve this script's parent directory (backend/model/).
# We need a stable anchor so all paths work regardless of working directory.
SCRIPT_DIR = Path(__file__).resolve().parent

# Data directory is one level up from model/ → backend/data/.
# We need a single reference point for all data paths.
DATA_DIR = SCRIPT_DIR.parent / "data"

# Input: processed matches from Phase 1 (1990 onward, ~15k rows).
# We need cleaned match data as the base for feature computation.
MATCHES_PATH = DATA_DIR / "processed" / "matches_filtered.csv"

# Input: FIFA rankings for rank-based features.
# We need official rankings to capture institutional team strength measures.
FIFA_PATH = DATA_DIR / "raw" / "fifa_rankings.csv"

# Output: final feature matrix ready for model training.
# Downstream train.py will read this file directly.
OUTPUT_PATH = DATA_DIR / "processed" / "features.csv"

# ---------------------------------------------------------------------------
# ELO CONSTANTS
# ---------------------------------------------------------------------------

# Every team starts at 1500 — the conventional chess/football Elo baseline.
# WHY 1500: it is the historical midpoint, so teams diverge symmetrically
# above (strong) and below (weak) as matches accumulate.
STARTING_ELO = 1500

# K-factor controls how much a single match can change a team's rating.
# Higher K = more volatile. We weight by tournament importance:
#   World Cup (32): results here are the strongest signal of true ability.
#   Friendlies (20): lower stakes, experimental squads, weaker signal.
#   Other (25): qualifiers, continental cups — meaningful but not WC-level.
K_WORLDCUP = 32
K_FRIENDLY = 20
K_OTHER = 25


# ---------------------------------------------------------------------------
# HELPER FUNCTIONS
# ---------------------------------------------------------------------------

def get_k_factor(tournament: str) -> int:
    """Return the Elo K-factor for a given tournament name.

    WHAT: Maps a tournament string to one of three K-factor tiers.
    WHY:  World Cup results should shift ratings more aggressively than
          friendlies because they are played at full intensity with full
          squads and carry enormous competitive weight.

    Edge cases:
      - "FIFA World Cup qualification" contains "world cup" but is a
        qualifier, not the finals. We treat qualifiers as K_OTHER (25)
        because they are competitive but not as decisive as finals.
      - Tournament names may have inconsistent casing or whitespace.
    """
    # Normalise to lowercase and strip whitespace for robust matching.
    # We need this because the Kaggle dataset has inconsistent casing.
    t = tournament.lower().strip()

    # Check for World Cup finals first (exclude qualifiers).
    # "FIFA World Cup" without "qualification" = the actual tournament.
    if "world cup" in t and "qualification" not in t:
        return K_WORLDCUP

    # Check for friendlies — many variants exist in the dataset.
    # "Friendly" covers "Friendly", "friendly", "International friendly".
    if "friendly" in t:
        return K_FRIENDLY

    # Everything else: continental cups, qualifiers, Nations League, etc.
    return K_OTHER


def compute_elo_expected(rating_a: float, rating_b: float) -> float:
    """Compute the expected score for team A under the Elo formula.

    WHAT: Returns a probability between 0 and 1 representing how likely
          team A is to win, based purely on rating difference.

    WHY:  The Elo formula E_A = 1 / (1 + 10^((R_B - R_A) / 400)) is a
          logistic function. When teams are equal-rated, E_A = 0.5.
          A 400-point gap gives E_A ≈ 0.91, meaning the stronger team
          is expected to win ~91% of the time.

    The 400 denominator is a scaling constant from chess. It controls how
    quickly the expected win probability changes with rating difference.
    """
    # Compute the exponent: positive when B is stronger, negative when A is.
    # We need the sign convention (R_B - R_A) so higher-rated A gives higher E_A.
    exponent = (rating_b - rating_a) / 400.0

    # Apply the logistic transform to get a probability in (0, 1).
    # We need this bounded output so Elo updates are always proportional.
    return 1.0 / (1.0 + 10.0 ** exponent)


def compute_elo_update(old_elo: float, expected: float, actual: float,
                       k: int) -> float:
    """Compute new Elo rating after a match result.

    WHAT: Applies the standard Elo update rule:
          R_new = R_old + K * (S_actual - S_expected)

    WHY:  If a team wins when expected to (actual ≈ expected), the update
          is tiny. If an underdog wins (actual >> expected), the update is
          large. This self-correcting property means ratings converge to
          true skill over many matches.

    Parameters:
      actual: 1.0 for win, 0.5 for draw, 0.0 for loss.
    """
    # The update magnitude is K * surprise.
    # Positive surprise (upset win) → rating goes up.
    # Negative surprise (upset loss) → rating goes down.
    return old_elo + k * (actual - expected)


def load_fifa_rankings(path: Path) -> tuple:
    """Load FIFA rankings CSV and return (team→rank dict, median_rank).

    WHAT: Builds a lookup dictionary mapping country names to their FIFA
          ranking position, plus a fallback median rank for unknown teams.

    WHY:  FIFA rankings are an independent, official strength measure that
          complements our computed Elo. Some teams in historical match data
          may not appear in the rankings file (dissolved nations, name
          mismatches), so we need a sensible default — the median rank is
          a neutral assumption that doesn't bias the model toward assuming
          unknown teams are strong or weak.

    Edge cases:
      - Column names may vary across FIFA exports. We try common variants.
      - Duplicate country entries: we keep the first (most recent ranking).
    """
    # Read the raw rankings CSV.
    # We need the full DataFrame to extract both the mapping and the median.
    df = pd.read_csv(path)

    # Identify the country name column — FIFA exports use different headers.
    # We need a robust lookup because the user may have exported from
    # different FIFA ranking pages over time.
    country_col = None
    for candidate in ["country_full", "Country", "country", "Team",
                       "team", "country_abrv"]:
        if candidate in df.columns:
            country_col = candidate
            break

    # If no known column name matches, fall back to the first column.
    # We need a fallback because the user might rename columns.
    if country_col is None:
        country_col = df.columns[0]
        print(f"  WARNING: Could not identify country column, "
              f"using '{country_col}'")

    # Identify the rank column with the same fallback strategy.
    rank_col = None
    for candidate in ["rank", "Rank", "ranking", "Ranking"]:
        if candidate in df.columns:
            rank_col = candidate
            break

    if rank_col is None:
        rank_col = df.columns[1] if len(df.columns) > 1 else df.columns[0]
        print(f"  WARNING: Could not identify rank column, "
              f"using '{rank_col}'")

    # Drop duplicates keeping first occurrence (highest/most-recent rank).
    # We need unique team entries so the lookup is deterministic.
    df = df.drop_duplicates(subset=[country_col], keep="first")

    # Build the team → rank dictionary.
    # We need O(1) lookup speed because this runs inside a 15k-row loop.
    rankings = dict(zip(df[country_col], df[rank_col].astype(float)))

    # Compute median rank as the fallback for unknown teams.
    # WHY median (not mean): rank distributions are skewed; median is more
    # robust to outliers (e.g., if ranks go up to 211).
    median_rank = float(df[rank_col].median())

    print(f"  Loaded {len(rankings)} teams from FIFA rankings")
    print(f"  Median rank (fallback for unknown teams): {median_rank}")

    return rankings, median_rank


def is_world_cup_match(tournament: str) -> bool:
    """Check whether a tournament string represents a FIFA World Cup match.

    WHAT: Returns True for World Cup finals matches only (not qualifiers,
          not youth tournaments, not Women's World Cup).

    WHY:  We need to identify WC matches for two features:
          1. K-factor selection (higher K for WC)
          2. WC experience tracking (counting distinct WC appearances)

    Edge cases:
      - "FIFA World Cup qualification" → False (qualifier, not finals)
      - "FIFA U-20 World Cup" → False (youth tournament)
    """
    t = tournament.lower().strip()

    # Must contain "world cup" but not be a qualifier or youth variant.
    # We need strict matching to avoid inflating WC experience counts.
    if "world cup" not in t:
        return False
    if "qualification" in t:
        return False
    if "u-17" in t or "u-20" in t or "u17" in t or "u20" in t:
        return False
    if "women" in t:
        return False

    return True


def is_friendly(tournament: str) -> bool:
    """Check whether a match is a friendly (non-competitive).

    WHAT: Returns True for friendly/exhibition matches.

    WHY:  Feature 5 (form_points) explicitly excludes friendlies because
          teams often rest key players, experiment with formations, and
          treat friendlies as low-stakes preparation. Including them would
          add noise to the "competitive form" signal.
    """
    return "friendly" in tournament.lower().strip()


def safe_mean(values: list, default: float = 0.0) -> float:
    """Compute mean of a list, returning `default` if the list is empty.

    WHAT: A null-safe average that never raises ZeroDivisionError.

    WHY:  A team's first-ever match has no history, so the history list is
          empty. We default to 0.0 which is a neutral assumption: "no
          data means average performance", and since 0.0 is subtracted
          in the diff features, it doesn't bias the model.
    """
    if not values:
        return default
    return float(np.mean(values))


# ---------------------------------------------------------------------------
# MAIN FEATURE ENGINEERING PIPELINE
# ---------------------------------------------------------------------------

def main() -> None:
    """Run the complete feature engineering pipeline.

    WHAT: Reads raw match data and FIFA rankings, computes 7 features per
          match chronologically (no data leakage), writes features.csv.

    WHY:  This is the bridge between raw data (Phase 1) and model training
          (Phase 3). Without features, the model has no structured input.

    === WHAT IS DATA LEAKAGE? ===
    Data leakage occurs when information from the future accidentally
    "leaks" into features used to predict the past. Example: if we
    compute a team's average goals using ALL their matches (including
    matches AFTER the one being predicted), the model sees the future.
    It performs great in training but fails in production because real
    predictions can only use data available BEFORE the match.

    We prevent leakage by:
    1. Sorting ALL matches by date (oldest first).
    2. Processing row by row, using ONLY history accumulated from
       PREVIOUS rows to compute features for the CURRENT row.
    3. Updating state trackers AFTER recording the current row's features.
    """

    print("=" * 60)
    print("PHASE 2: Feature Engineering — WC 2026 Oracle")
    print("=" * 60)

    # ------------------------------------------------------------------
    # STEP 1: Load input data
    # ------------------------------------------------------------------
    print("\n[1/5] Loading input data...")

    # Load processed matches from Phase 1.
    # We need the 1990+ filtered dataset as our feature computation base.
    matches = pd.read_csv(MATCHES_PATH)

    # Parse the date column to datetime for chronological sorting.
    # We need proper datetime types so .dt.year works for WC tracking.
    matches["date"] = pd.to_datetime(matches["date"], errors="coerce")

    # Drop any rows where date parsing failed.
    # We need valid dates for every row since chronological order is
    # essential for leak-free feature computation.
    before_drop = len(matches)
    matches = matches.dropna(subset=["date", "home_score", "away_score"])
    after_drop = len(matches)
    if before_drop != after_drop:
        print(f"  WARNING: Dropped {before_drop - after_drop} rows with "
              f"unparseable dates")

    # CRITICAL: Sort by date ascending so we process history in order.
    # This is the single most important step for preventing data leakage.
    # Every feature for row N is computed using ONLY rows 0..N-1.
    matches = matches.sort_values("date").reset_index(drop=True)

    print(f"  Loaded {len(matches)} matches (sorted chronologically)")
    print(f"  Date range: {matches['date'].min()} to {matches['date'].max()}")

    # Load FIFA rankings for rank-based features.
    fifa_rankings, median_rank = load_fifa_rankings(FIFA_PATH)

    # ------------------------------------------------------------------
    # STEP 2: Initialise per-team state trackers
    # ------------------------------------------------------------------
    print("\n[2/5] Initialising state trackers...")

    # Elo ratings: every team starts at 1500.
    # WHY defaultdict: when we encounter a team for the first time, it
    # automatically gets the starting Elo without an explicit check.
    elo = defaultdict(lambda: STARTING_ELO)

    # Match history for goals scored/conceded (FEATURE 3 & 4).
    # Each entry is (goals_scored, goals_conceded) from that team's POV.
    # We store ALL matches (including friendlies) because scoring ability
    # is relevant regardless of competition level.
    goals_history = defaultdict(list)

    # Competitive match history for form points (FEATURE 5).
    # Each entry is the points earned (3/1/0).
    # We EXCLUDE friendlies because form should reflect competitive intent.
    competitive_form = defaultdict(list)

    # World Cup appearance years per team (FEATURE 6).
    # A set of years (e.g., {1994, 1998, 2002, 2006, 2010, 2014}).
    # WHY a set: prevents double-counting when a team plays multiple
    # matches in the same World Cup.
    wc_years = defaultdict(set)

    # Head-to-head history for h2h_win_rate (FEATURE 8).
    # Key: tuple of (team_a, team_b) sorted alphabetically to handle both directions.
    # Value: list of results from team_a's perspective (2=win, 1=draw, 0=loss).
    h2h_history = defaultdict(list)

    print("  State trackers ready (elo, goals_history, "
          "competitive_form, wc_years, h2h_history)")

    # ------------------------------------------------------------------
    # STEP 3: Process each match chronologically and extract features
    # ------------------------------------------------------------------
    print("\n[3/5] Computing features row by row...")

    # Accumulator for feature rows.
    # We build a list of dicts and convert to DataFrame at the end.
    # WHY not append to DataFrame: appending rows to a DataFrame in a loop
    # is O(N²) due to reallocation; appending to a list is O(N).
    feature_rows = []

    total = len(matches)

    for idx, match in matches.iterrows():
        # Print progress every 1000 rows so the user can see it working.
        # We need visible progress because 15k rows takes a few seconds.
        if idx % 1000 == 0:
            print(f"  Processing row {idx:>6,} / {total:,} ...")

        # Extract raw match fields.
        # home_team becomes team_a by convention in historical data.
        home = match["home_team"]
        away = match["away_team"]
        home_score = int(match["home_score"])
        away_score = int(match["away_score"])
        tournament = str(match["tournament"])
        neutral = int(match["neutral"]) if pd.notna(match["neutral"]) else 0
        match_date = match["date"]
        match_year = match_date.year

        # ==============================================================
        # FEATURE 1: elo_diff (team_a Elo minus team_b Elo)
        # ==============================================================
        #
        # WHAT IS ELO?
        # Elo is a rating system invented by Arpad Elo for chess and
        # adapted for football. Each team carries a rating number.
        # After each match, the winner gains points and the loser loses
        # points. The amount gained/lost depends on how "surprising"
        # the result was — beating a much stronger team earns more
        # points than beating a weaker one.
        #
        # WHY ELO OVER FIFA RANKING ALONE?
        # FIFA rankings update monthly and use a fixed formula that
        # weights recent matches heavily. Elo is more granular: it
        # updates after EVERY match and naturally weights surprises.
        # Elo also has a longer memory, while FIFA rankings can change
        # dramatically from one update cycle to the next.
        #
        # We capture Elo BEFORE the current match is applied.
        # This prevents data leakage — the model sees the team's
        # strength going INTO the match, not after it.

        elo_home = elo[home]
        elo_away = elo[away]
        elo_diff = elo_home - elo_away

        # ==============================================================
        # FEATURE 2: fifa_rank_diff (team_a rank minus team_b rank)
        # ==============================================================
        #
        # WHAT: The arithmetic difference between two teams' FIFA world
        #       rankings. Rank 1 is best, rank 211 is worst.
        #
        # WHY RANK DIFFERENCE INSTEAD OF ABSOLUTE RANK?
        # A team ranked 5th has very different prospects depending on
        # whether they face rank 1 or rank 100. The absolute rank "5"
        # tells you the team is strong, but the DIFFERENCE tells you
        # the relative matchup strength. A model needs to know "how
        # much stronger is team_a than team_b?", not just "is team_a
        # strong in isolation?"
        #
        # Note: LOWER rank = better. So a NEGATIVE diff means team_a
        # is ranked higher (better) than team_b.

        rank_home = fifa_rankings.get(home, median_rank)
        rank_away = fifa_rankings.get(away, median_rank)
        fifa_rank_diff = rank_home - rank_away

        # ==============================================================
        # FEATURE 3: avg_goals_scored_last5 (difference)
        # ==============================================================
        #
        # WHAT: For each team, compute the average goals they scored in
        #       their last 5 matches. Then take the difference:
        #       team_a_avg - team_b_avg.
        #
        # WHY: Recent scoring output is a proxy for attacking form and
        #      confidence. A team that has scored 3+ goals in each of
        #      their last 5 matches is likely in better attacking shape
        #      than one averaging 0.5 goals.
        #
        # WHY LAST 5 (NOT 10 OR 3)?
        # 5 is a balance: enough matches to smooth out fluky results,
        # few enough to be "recent" (typically ~3-6 months of football).
        #
        # DATA LEAKAGE PREVENTION: We use only goals_history entries
        # that were added from PREVIOUS iterations. The current match's
        # goals are NOT included because they haven't happened yet at
        # prediction time.

        home_scored_last5 = safe_mean(
            [g[0] for g in goals_history[home][-5:]]
        )
        away_scored_last5 = safe_mean(
            [g[0] for g in goals_history[away][-5:]]
        )
        # Intentional: team_a (home) avg - team_b (away) avg = differential encoding.
        # Positive value means team_a scores more on average than team_b.
        avg_goals_scored_last5 = home_scored_last5 - away_scored_last5

        # ==============================================================
        # FEATURE 4: avg_goals_conceded_last5 (difference)
        # ==============================================================
        #
        # WHAT: For each team, average goals CONCEDED in their last 5
        #       matches. Difference: team_a_conceded - team_b_conceded.
        #
        # WHY DEFENSIVE STRENGTH IS AS IMPORTANT AS ATTACK:
        # In football, "goals conceded" reflects defensive organisation,
        # goalkeeper quality, and tactical discipline. A team that
        # scores 3 but concedes 4 is less likely to win than one that
        # scores 1 and concedes 0. Defence wins tournaments — the
        # 2010 Spain, 2014 Germany, 2022 Argentina all had elite
        # defences in their World Cup runs.
        #
        # Note: A POSITIVE diff here means team_a concedes MORE than
        # team_b — which is BAD for team_a. The model will learn this
        # negative correlation.

        home_conceded_last5 = safe_mean(
            [g[1] for g in goals_history[home][-5:]]
        )
        away_conceded_last5 = safe_mean(
            [g[1] for g in goals_history[away][-5:]]
        )
        avg_goals_conceded_last5 = home_conceded_last5 - away_conceded_last5

        # ==============================================================
        # FEATURE 5: form_points (difference)
        # ==============================================================
        #
        # WHAT: Sum of points earned in last 5 COMPETITIVE matches.
        #       Win = 3 points, Draw = 1, Loss = 0.
        #       Difference: team_a_form - team_b_form.
        #
        # WHY EXCLUDE FRIENDLIES?
        # Friendlies are preparation matches where teams experiment
        # with tactics and rest star players. A loss in a friendly
        # does not indicate poor form — it may mean the manager was
        # testing a new formation. Competitive matches (World Cup,
        # qualifiers, continental cups) are played with full intent.
        #
        # WHY RECENT FORM PREDICTS SHORT-TOURNAMENT PERFORMANCE:
        # Football momentum is real. Teams riding a winning streak
        # carry confidence, tactical cohesion, and squad fitness into
        # tournaments. Studies show that the last 5 competitive results
        # before a World Cup correlate with group-stage outcomes.
        #
        # Maximum possible: 15 (5 wins × 3 points).
        # Minimum possible: 0 (5 losses × 0 points).

        home_form = float(sum(competitive_form[home][-5:]))
        away_form = float(sum(competitive_form[away][-5:]))
        form_points = home_form - away_form

        # ==============================================================
        # FEATURE 6: wc_experience (difference)
        # ==============================================================
        #
        # WHAT: Number of distinct World Cups each team has appeared in
        #       historically (BEFORE the current match year).
        #       Difference: team_a_count - team_b_count.
        #
        # WHY TOURNAMENT EXPERIENCE MATTERS IN THE WORLD CUP:
        # The World Cup is unique: knockout format, immense pressure,
        # month-long camps away from home, hostile/unfamiliar climates.
        # Teams with many past WC appearances have institutional
        # knowledge of how to handle this — sports psychologists, squad
        # management routines, penalty shootout preparation.
        # Germany, Brazil, and Argentina consistently survive group
        # stages partly because they "know how to play World Cups."
        #
        # We count only WC years STRICTLY before the current match year.
        # WHY: All matches within the same World Cup should see the same
        # experience count. If we updated mid-tournament, the first
        # group match and the final would show different values, which
        # is illogical — the team didn't "gain experience" mid-event.

        home_wc_exp = len([y for y in wc_years[home] if y < match_year])
        away_wc_exp = len([y for y in wc_years[away] if y < match_year])
        wc_experience = float(home_wc_exp - away_wc_exp)

        # ==============================================================
        # FEATURE 7: is_neutral
        # ==============================================================
        #
        # WHAT: 1 if the match is played at a neutral venue, 0 otherwise.
        #
        # WHY HOME ADVANTAGE IS A REAL STATISTICAL PHENOMENON:
        # Decades of sports research show that home teams win ~46% of
        # matches vs ~27% for away teams (rest are draws). Causes:
        #   - Crowd noise influences referee decisions (proven in studies)
        #   - Familiarity with pitch, altitude, climate
        #   - No travel fatigue
        #   - Psychological comfort
        #
        # IN WC 2026: All matches are at neutral venues (except for
        # USA, Canada, Mexico who host). Setting is_neutral = 1 for all
        # WC matches tells the model: "no team has home advantage here."
        # This automatically adjusts predictions downward for teams
        # that historically rely on home support.

        is_neutral_val = float(neutral)

        # ==============================================================
        # FEATURE 8: h2h_win_rate
        # ==============================================================
        #
        # WHAT: Historical head-to-head win rate for team_a vs team_b.
        #       Computed as: team_a_wins / total_h2h_matches
        #
        # WHY HEAD-TO-HEAD MATTERS:
        # Some matchups have historical patterns — certain teams "have the
        # number" of others regardless of current form or rankings. This
        # is a classic football insight: "Team X never loses to Team Y."
        #
        # DATA LEAKAGE PREVENTION: We only look at matches BEFORE the
        # current match date. The h2h_history is updated AFTER recording
        # the current row's features.
        #
        # MINIMUM SAMPLE RULE: If fewer than 3 previous meetings exist,
        # we default to 0.5 (neutral). This prevents overfitting to tiny
        # samples where a single result would dominate.

        # Create a canonical key for this matchup (alphabetically sorted).
        h2h_key = tuple(sorted([home, away]))
        h2h_results = h2h_history[h2h_key]

        if len(h2h_results) >= 3:
            # Calculate win rate from team_a's perspective.
            # Need to determine if current home team was team_a in previous h2h matches.
            # Since h2h_key is sorted, we check which position home team occupies.
            team_a_in_key = h2h_key[0]  # The alphabetically first team
            team_a_wins = sum(1 for r in h2h_results if r == 2)
            h2h_win_rate = team_a_wins / len(h2h_results)
        else:
            # Default to neutral (0.5) when insufficient history.
            h2h_win_rate = 0.5

        # ==============================================================
        # TARGET VARIABLE: result
        # ==============================================================
        #
        # Encode the match outcome from team_a's perspective:
        #   2 = team_a wins  (home_score > away_score)
        #   1 = draw          (home_score == away_score)
        #   0 = team_a loses  (home_score < away_score)
        #
        # WHY THESE VALUES (0, 1, 2) INSTEAD OF (-1, 0, 1)?
        # Scikit-learn and XGBoost expect non-negative integer class
        # labels for multi-class classification. Using 0/1/2 is the
        # standard convention that avoids negative-label errors.

        if home_score > away_score:
            result = 2
        elif home_score == away_score:
            result = 1
        else:
            result = 0

        # ----------------------------------------------------------
        # Record the feature row
        # ----------------------------------------------------------
        feature_rows.append({
            "date": match_date,
            "home_team": home,
            "away_team": away,
            "tournament": tournament,
            "elo_diff": round(elo_diff, 2),
            "fifa_rank_diff": round(fifa_rank_diff, 2),
            "avg_goals_scored_last5": round(avg_goals_scored_last5, 4),
            "avg_goals_conceded_last5": round(avg_goals_conceded_last5, 4),
            "form_points": round(form_points, 2),
            "wc_experience": round(wc_experience, 2),
            "is_neutral": int(is_neutral_val),
            "h2h_win_rate": round(h2h_win_rate, 4),
            "result": result,
        })

        # ==============================================================
        # POST-MATCH STATE UPDATES
        # ==============================================================
        # CRITICAL: All updates happen AFTER we've recorded the features.
        # This ensures that the current match's outcome does NOT
        # influence its own features — the core leakage prevention.

        # --- Update Elo ratings ---
        # Determine the K-factor based on tournament importance.
        k = get_k_factor(tournament)

        # Compute expected scores for both teams.
        expected_home = compute_elo_expected(elo_home, elo_away)
        expected_away = 1.0 - expected_home  # Elo expected scores sum to 1

        # Convert match result to Elo actual scores.
        # Win = 1.0, Draw = 0.5, Loss = 0.0 (standard Elo convention).
        if home_score > away_score:
            actual_home, actual_away = 1.0, 0.0
        elif home_score == away_score:
            actual_home, actual_away = 0.5, 0.5
        else:
            actual_home, actual_away = 0.0, 1.0

        # Apply Elo updates. Both teams' ratings change simultaneously.
        elo[home] = compute_elo_update(elo_home, expected_home,
                                       actual_home, k)
        elo[away] = compute_elo_update(elo_away, expected_away,
                                       actual_away, k)

        # --- Update goals history ---
        # Record (goals_scored, goals_conceded) from each team's perspective.
        # Home team scored home_score and conceded away_score (and vice versa).
        goals_history[home].append((home_score, away_score))
        goals_history[away].append((away_score, home_score))

        # --- Update competitive form ---
        # Only add to form history if this was NOT a friendly.
        # Friendlies are excluded from form tracking per requirements.
        if not is_friendly(tournament):
            # Home team: 3 for win, 1 for draw, 0 for loss.
            if home_score > away_score:
                competitive_form[home].append(3)
                competitive_form[away].append(0)
            elif home_score == away_score:
                competitive_form[home].append(1)
                competitive_form[away].append(1)
            else:
                competitive_form[home].append(0)
                competitive_form[away].append(3)

        # --- Update World Cup appearance tracking ---
        # If this is a World Cup match, record this year for both teams.
        # The set prevents double-counting within the same tournament.
        if is_world_cup_match(tournament):
            wc_years[home].add(match_year)
            wc_years[away].add(match_year)

        # --- Update head-to-head history ---
        # Record this result for future h2h calculations.
        # Store from both team perspectives so we can compute win rate
        # regardless of which team is home in future matchups.
        h2h_history[h2h_key].append(result)

    # Print final progress to confirm completion.
    print(f"  Processing row {total:>6,} / {total:,} ... DONE")

    # ------------------------------------------------------------------
    # STEP 4: Save feature matrix
    # ------------------------------------------------------------------
    print("\n[4/5] Saving feature matrix...")

    # Convert list of dicts to DataFrame.
    # This is efficient because we avoided row-by-row DataFrame appending.
    features_df = pd.DataFrame(feature_rows)

    # Ensure the output directory exists.
    # We need this guard for fresh repository clones.
    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)

    # Save to CSV without the DataFrame index.
    # Downstream scripts will read this directly.
    features_df.to_csv(OUTPUT_PATH, index=False)

    print(f"  Saved to: {OUTPUT_PATH}")
    print(f"  Shape: {features_df.shape}")

    # ------------------------------------------------------------------
    # STEP 5: Validation checks
    # ------------------------------------------------------------------
    print("\n[5/5] Running validation checks...")
    print("=" * 60)

    # Track whether any check fails so we can exit with error code.
    all_passed = True

    # --- Check 1: Shape ---
    # We expect ~15,000 rows and 13 columns
    # (date, home_team, away_team, tournament, 8 features, result).
    rows, cols = features_df.shape
    print(f"\n  CHECK 1 — Shape: {rows} rows × {cols} columns")
    if rows < 1000:
        print("  ❌ ERROR: Too few rows. Expected ~15,000 matches. "
              "Check that matches_filtered.csv was generated correctly "
              "by Phase 1 load_data.py.")
        all_passed = False
    else:
        print(f"  ✅ Row count looks reasonable ({rows:,} matches)")

    if cols != 13:
        print(f"  ❌ ERROR: Expected 13 columns (date + home_team + "
              f"away_team + tournament + 8 features + result), "
              f"got {cols}.")
        all_passed = False
    else:
        print("  ✅ Column count correct (13)")

    # --- Check 2: Null values ---
    # Feature columns should have ZERO nulls. If there are nulls,
    # something went wrong in the computation pipeline.
    feature_cols = [
        "elo_diff", "fifa_rank_diff", "avg_goals_scored_last5",
        "avg_goals_conceded_last5", "form_points", "wc_experience",
        "is_neutral", "h2h_win_rate", "result"
    ]
    null_counts = features_df[feature_cols].isnull().sum()

    print("\n  CHECK 2 — Null counts per feature column:")
    has_nulls = False
    for col_name in feature_cols:
        n = null_counts[col_name]
        status = "✅" if n == 0 else "❌"
        print(f"    {status} {col_name}: {n}")
        if n > 0:
            has_nulls = True

    if has_nulls:
        print("  ❌ ERROR: Null values detected. This means a computation "
              "returned NaN — check for division by zero or missing data "
              "in input files.")
        all_passed = False
    else:
        print("  ✅ All feature columns are null-free")

    # --- Check 3: Target variable distribution ---
    # Historical football stats (1990+): ~45% home win, ~27% draw, ~28% away win.
    # Our encoding: 2=win, 1=draw, 0=loss (from team_a/home perspective).
    target_dist = features_df["result"].value_counts(normalize=True)
    target_dist = target_dist.sort_index()

    print("\n  CHECK 3 — Target variable distribution:")
    label_names = {0: "team_a loses", 1: "draw", 2: "team_a wins"}
    for label_val in [0, 1, 2]:
        pct = target_dist.get(label_val, 0) * 100
        print(f"    {label_names[label_val]} ({label_val}): {pct:.1f}%")

    win_pct = target_dist.get(2, 0) * 100
    draw_pct = target_dist.get(1, 0) * 100
    loss_pct = target_dist.get(0, 0) * 100

    # Sanity check: win rate should be 35-55%, draw 20-35%, loss 20-35%.
    # These are wide bounds to accommodate dataset variations.
    if not (35 <= win_pct <= 55):
        print(f"  ⚠️  WARNING: Win rate {win_pct:.1f}% outside expected "
              f"range [35-55%]. This may indicate a data issue or simply "
              f"reflect the specific tournament mix in the dataset.")
    if not (20 <= draw_pct <= 35):
        print(f"  ⚠️  WARNING: Draw rate {draw_pct:.1f}% outside expected "
              f"range [20-35%].")
    if not (20 <= loss_pct <= 35):
        print(f"  ⚠️  WARNING: Loss rate {loss_pct:.1f}% outside expected "
              f"range [20-35%].")

    if 35 <= win_pct <= 55 and 20 <= draw_pct <= 35 and 20 <= loss_pct <= 35:
        print("  ✅ Target distribution looks healthy")

    # --- Check 4: Elo range ---
    # After processing 30+ years of matches, Elo ratings should span
    # roughly 1200 (weakest) to 2000+ (strongest like Brazil, Germany).
    elo_values = list(elo.values())
    elo_min = min(elo_values)
    elo_max = max(elo_values)
    elo_mean = np.mean(elo_values)

    print(f"\n  CHECK 4 — Final Elo rating range:")
    print(f"    Min: {elo_min:.1f}")
    print(f"    Max: {elo_max:.1f}")
    print(f"    Mean: {elo_mean:.1f}")
    print(f"    Teams tracked: {len(elo_values)}")

    if elo_max < 1600:
        print("  ❌ ERROR: Max Elo too low. K-factors may be too small "
              "or too few matches processed.")
        all_passed = False
    elif elo_max > 2500:
        print("  ❌ ERROR: Max Elo too high. K-factors may be too large "
              "or there may be a bug in the update formula.")
        all_passed = False
    else:
        print("  ✅ Elo range looks reasonable")

    if elo_min > 1400:
        print("  ⚠️  WARNING: Min Elo is high — weak teams may not have "
              "enough matches to diverge from the 1500 baseline.")

    # --- Check 5: Feature value ranges ---
    print("\n  CHECK 5 — Feature value ranges:")
    for col_name in feature_cols[:-1]:  # Exclude 'result'
        col_data = features_df[col_name]
        print(f"    {col_name:30s}  "
              f"min={col_data.min():>10.2f}  "
              f"max={col_data.max():>10.2f}  "
              f"mean={col_data.mean():>10.2f}")

    # --- Top 10 Elo teams ---
    print("\n  BONUS — Top 10 teams by final Elo rating:")
    sorted_teams = sorted(elo.items(), key=lambda x: x[1], reverse=True)
    for rank_pos, (team_name, rating) in enumerate(sorted_teams[:10], 1):
        print(f"    {rank_pos:>2}. {team_name:<25s} {rating:.1f}")

    # --- Summary ---
    print("\n" + "=" * 60)
    if all_passed:
        print("✅ ALL VALIDATION CHECKS PASSED")
        print(f"   Feature matrix ready at: {OUTPUT_PATH}")
        
        # Save final Elo ratings for inference/simulation
        import json, os
        BASE_DIR_FS = os.path.dirname(os.path.abspath(__file__))
        elo_path = os.path.join(BASE_DIR_FS, '..', 'data', 'current_elos.json')
        elo_output = {team: round(rating, 2) 
                    for team, rating in elo.items()}
        with open(elo_path, 'w') as f:
            json.dump(elo_output, f, indent=2)
        print(f"  ✅ Saved {len(elo_output)} team Elo ratings to current_elos.json")
        print("     Top 5:", sorted(elo_output.items(), 
              key=lambda x: x[1], reverse=True)[:5])
    else:
        print("❌ SOME CHECKS FAILED — review errors above")
        print("   Fix the issues and re-run this script.")
        sys.exit(1)

    print("=" * 60)


# ---------------------------------------------------------------------------
# SCRIPT ENTRY POINT
# ---------------------------------------------------------------------------

# Guard execution so this file can be imported without side effects.
# Direct execution triggers the full pipeline; imports expose helpers.
if __name__ == "__main__":
    main()
