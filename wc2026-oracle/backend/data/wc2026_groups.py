"""Create a WC2026 groups template without hallucinating unconfirmed teams."""

# Import json to write structured group data to disk.
# We need a machine-readable format that later scripts can consume directly.
import json

# Import pathlib for robust path handling.
# We need safe file path construction across local and deployment environments.
from pathlib import Path

# Resolve the directory where this script lives.
# We need this base path to save output in the correct project location.
BASE_DIR = Path(__file__).resolve().parent

# Define output path for generated groups template.
# We need a predictable file path for downstream loaders and validation checks.
OUTPUT_PATH = BASE_DIR / "processed" / "wc2026_groups_template.json"


# Define script entrypoint for explicit execution flow.
# We need maintainable structure as this file will later be replaced with official groups.
def main() -> None:
    # Build a template dictionary with only host nations and TODO placeholders.
    # We avoid fabricating group placements until FIFA officially confirms the final draw.
    groups_template = {
        "verification_url": "https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026",
        "status": "TODO_VERIFY_OFFICIAL_DRAW",
        "notes": [
            "Do not treat placeholders as real assignments.",
            "Replace every TODO entry only after official FIFA publication.",
        ],
        "hosts_confirmed": ["Canada", "Mexico", "United States"],
        "groups": {
            "Group_A": ["TODO_VERIFY_TEAM_1", "TODO_VERIFY_TEAM_2", "TODO_VERIFY_TEAM_3", "TODO_VERIFY_TEAM_4"],
            "Group_B": ["TODO_VERIFY_TEAM_1", "TODO_VERIFY_TEAM_2", "TODO_VERIFY_TEAM_3", "TODO_VERIFY_TEAM_4"],
            "Group_C": ["TODO_VERIFY_TEAM_1", "TODO_VERIFY_TEAM_2", "TODO_VERIFY_TEAM_3", "TODO_VERIFY_TEAM_4"],
            "Group_D": ["TODO_VERIFY_TEAM_1", "TODO_VERIFY_TEAM_2", "TODO_VERIFY_TEAM_3", "TODO_VERIFY_TEAM_4"],
            "Group_E": ["TODO_VERIFY_TEAM_1", "TODO_VERIFY_TEAM_2", "TODO_VERIFY_TEAM_3", "TODO_VERIFY_TEAM_4"],
            "Group_F": ["TODO_VERIFY_TEAM_1", "TODO_VERIFY_TEAM_2", "TODO_VERIFY_TEAM_3", "TODO_VERIFY_TEAM_4"],
            "Group_G": ["TODO_VERIFY_TEAM_1", "TODO_VERIFY_TEAM_2", "TODO_VERIFY_TEAM_3", "TODO_VERIFY_TEAM_4"],
            "Group_H": ["TODO_VERIFY_TEAM_1", "TODO_VERIFY_TEAM_2", "TODO_VERIFY_TEAM_3", "TODO_VERIFY_TEAM_4"],
            "Group_I": ["TODO_VERIFY_TEAM_1", "TODO_VERIFY_TEAM_2", "TODO_VERIFY_TEAM_3", "TODO_VERIFY_TEAM_4"],
            "Group_J": ["TODO_VERIFY_TEAM_1", "TODO_VERIFY_TEAM_2", "TODO_VERIFY_TEAM_3", "TODO_VERIFY_TEAM_4"],
            "Group_K": ["TODO_VERIFY_TEAM_1", "TODO_VERIFY_TEAM_2", "TODO_VERIFY_TEAM_3", "TODO_VERIFY_TEAM_4"],
            "Group_L": ["TODO_VERIFY_TEAM_1", "TODO_VERIFY_TEAM_2", "TODO_VERIFY_TEAM_3", "TODO_VERIFY_TEAM_4"],
        },
    }

    # Ensure processed output folder exists.
    # We need this to avoid file-write failures on fresh project setups.
    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)

    # Write template JSON with indentation.
    # We need readable output so manual verification and updates are straightforward.
    OUTPUT_PATH.write_text(json.dumps(groups_template, indent=2), encoding="utf-8")

    # Print completion message and output location.
    # We need immediate confirmation that template generation succeeded.
    print(f"Saved groups template with TODO placeholders to: {OUTPUT_PATH}")


# Execute only when run directly.
# We need import safety so other modules can reuse functions without side effects.
if __name__ == "__main__":
    # Run template creation workflow.
    # We need this call to generate the JSON artifact.
    main()
