"""Load and validate raw football datasets for WC 2026 modeling."""

# Import pathlib so we can build robust file paths across operating systems.
# We need reliable paths because this script will run on different machines/environments.
from pathlib import Path

# Import pandas for tabular data loading and manipulation.
# We need pandas because both source files are CSV datasets.
import pandas as pd

# Build a Path object pointing to the folder where this script lives.
# We need this to construct project-relative paths without hardcoding absolute directories.
BASE_DIR = Path(__file__).resolve().parent

# Define the expected path to Kaggle international results CSV in raw storage.
# We need a clear source path so the pipeline reads the correct unmodified input file.
RESULTS_RAW_PATH = BASE_DIR / "raw" / "results.csv"

# Define the expected path to FIFA rankings CSV in raw storage.
# We need this path to load rankings that will become model features later.
FIFA_RAW_PATH = BASE_DIR / "raw" / "fifa_rankings.csv"

# Define the destination path for filtered matches in processed storage.
# We need a processed artifact so downstream scripts can train on a curated dataset.
FILTERED_OUTPUT_PATH = BASE_DIR / "processed" / "matches_filtered.csv"


# Define the script entry point so top-level execution is explicit and maintainable.
# We need a main function to keep logic organized and easy to reuse/test.
def main() -> None:
    # Print a section header for readability in terminal output.
    # We need readable logs so quick sanity checks are easy during iterative development.
    print("=== Loading raw datasets ===")

    # Read international results CSV into a DataFrame.
    # We need match-level historical data as the core training dataset.
    results_df = pd.read_csv(RESULTS_RAW_PATH)

    # Read FIFA rankings CSV into a DataFrame.
    # We need ranking strength signals to engineer team quality features later.
    fifa_df = pd.read_csv(FIFA_RAW_PATH)

    # Print a header before showing results.csv diagnostics.
    # We need explicit dataset separation so diagnostics are not mixed together.
    print("\n--- results.csv overview ---")

    # Print row/column count for results dataset.
    # We need shape checks to confirm full file load and detect truncation/corruption.
    print(f"Shape: {results_df.shape}")

    # Print column names for results dataset.
    # We need schema visibility to verify expected fields exist before feature engineering.
    print(f"Columns: {list(results_df.columns)}")

    # Print first five rows of results dataset.
    # We need a sample view to quickly validate data quality and value formats.
    print("First 5 rows:")
    print(results_df.head(5))

    # Print a header before showing fifa_rankings.csv diagnostics.
    # We need consistent diagnostics for each input source.
    print("\n--- fifa_rankings.csv overview ---")

    # Print row/column count for rankings dataset.
    # We need this to validate that rankings export was downloaded correctly.
    print(f"Shape: {fifa_df.shape}")

    # Print column names for rankings dataset.
    # We need schema checks because exported FIFA columns can vary across downloads.
    print(f"Columns: {list(fifa_df.columns)}")

    # Print first five rows of rankings dataset.
    # We need a quick preview to verify rank and points fields are populated.
    print("First 5 rows:")
    print(fifa_df.head(5))

    # Print section header before null-check reporting.
    # We need explicit quality gates to catch missing values early.
    print("\n=== Null value checks ===")

    # Count nulls per column in results dataset.
    # We need null counts to identify columns requiring cleaning or imputation.
    results_nulls = results_df.isnull().sum()

    # Print null summary for results dataset.
    # We need this report to decide preprocessing strategy for match features.
    print("results.csv null counts:")
    print(results_nulls)

    # Count nulls per column in rankings dataset.
    # We need to detect incomplete ranking rows before merge operations.
    fifa_nulls = fifa_df.isnull().sum()

    # Print null summary for rankings dataset.
    # We need this to ensure rank/points features are trustworthy.
    print("\nfifa_rankings.csv null counts:")
    print(fifa_nulls)

    # Convert the date column to datetime type safely.
    # We need datetime parsing to filter by era and build time-aware features.
    results_df["date"] = pd.to_datetime(results_df["date"], errors="coerce")

    # Drop rows where date failed to parse and became null.
    # We need valid dates so era-based filtering and chronological modeling stay correct.
    results_df = results_df.dropna(subset=["date"])

    # Filter to matches from 1990 onward.
    # We use 1990 as a modern-football-era cutoff to better match contemporary tactics and competition structure.
    results_filtered_df = results_df[results_df["date"].dt.year >= 1990].copy()

    # Ensure the processed directory exists before writing output.
    # We need this guard so the save step never fails due to a missing folder.
    FILTERED_OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)

    # Save filtered matches without the DataFrame index column.
    # We need a clean CSV artifact for downstream EDA, training, and simulation scripts.
    results_filtered_df.to_csv(FILTERED_OUTPUT_PATH, index=False)

    # Print output status with record count and path.
    # We need confirmation that preprocessing succeeded and where the file was written.
    print("\n=== Filter and save complete ===")
    print(f"Filtered matches count (1990+): {len(results_filtered_df)}")
    print(f"Saved to: {FILTERED_OUTPUT_PATH}")


# Check whether this file is run as a script.
# We need this guard so main() executes only on direct run, not on import.
if __name__ == "__main__":
    # Execute the data loading workflow.
    # We need this call to actually run the end-to-end data ingestion and filtering logic.
    main()
