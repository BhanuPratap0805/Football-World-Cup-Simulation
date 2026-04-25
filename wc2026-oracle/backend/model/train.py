"""
Phase 3: Model Training
Trains an XGBoost multi-class classifier to predict WC matches.
"""
# Import json so we can save our feature importance dictionary to a standard format.
import json
# Import pathlib to construct robust, OS-independent file paths.
from pathlib import Path
# Import pandas to load and manipulate our CSV tabular data.
import pandas as pd
# Import train_test_split algorithm to randomly divide our data into learning and testing buckets.
from sklearn.model_selection import train_test_split
# Import accuracy_score to see the top-level percentage of matches the model guessed correctly.
from sklearn.metrics import accuracy_score
# Import classification_report to get deep insights (precision/recall) into each class (win/draw/loss).
from sklearn.metrics import classification_report
# Import XGBClassifier, the powerful ensemble model we are going to train on our data.
from xgboost import XGBClassifier

# Anchor the file paths relative to where this Python script is located.
# WHY: This ensures the script runs from any terminal directory.
BASE_DIR = Path(__file__).resolve().parent
# Define where the data lives.
DATA_DIR = BASE_DIR.parent / "data"
# Define the exact file containing our extracted features.
FEATURES_PATH = DATA_DIR / "processed" / "features.csv"
# Define where to save the mathematical model once it finishes learning.
MODEL_SAVE_PATH = BASE_DIR / "xgb_wc2026.json"
# Define where to save the ranking of which football stats influence winning the most.
IMPORTANCE_SAVE_PATH = BASE_DIR / "feature_importance.json"

def main() -> None:
    # Print a status message to the console.
    print("Loading features.csv...")
    # Read the historical data into a pandas DataFrame.
    # WHY: DataFrames allow rapid array manipulation for ML models.
    df = pd.read_csv(FEATURES_PATH)

    # Define the exact core columns we engineered in Phase 2.
    # WHY: We must strip out 'date', 'country', etc., so the model learns football rules, not string names.
    FEATURE_COLS = [
        'elo_diff', 'fifa_rank_diff', 'avg_goals_scored_last5',
        'avg_goals_conceded_last5', 'form_points', 
        'wc_experience', 'is_neutral', 'h2h_win_rate'
    ]

    # Extract the feature matrix "X" (input data).
    X = df[FEATURE_COLS]
    # Extract the target column "y" (the answers: 0=Loss, 1=Draw, 2=Win).
    y = df['result']

    # Execute the train/test split. 80% train, 20% test.
    # FIXED: Added shuffle=False to prevent future data leakage (chronological split)
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, shuffle=False)

    # Print how much data the model has to learn from.
    print(f"Training on {len(X_train)} matches, evaluating on {len(X_test)} matches.")

    # Initialize the XGBoost Classifier with the specific hyperparameter requirements constraints.
    model = XGBClassifier(
        # n_estimators=300: Build up to 300 sequential error-correcting trees.
        n_estimators=300,
        # max_depth=5: Restrict tree branches to depth 5 to prevent it from memorizing hyper-specific scenarios (overfitting).
        max_depth=5,
        # learning_rate=0.05: Force the model to learn slowly and steadily, increasing robustness.
        learning_rate=0.05,
        # objective='multi:softprob': Output the statistical probability of every single class (win %, draw %, loss %), not just a hard prediction.
        objective='multi:softprob',
        # num_class=3: Tell XGBoost explicitly that we have 3 unique answers (loss, draw, win).
        num_class=3,
        # eval_metric='mlogloss': Use Multi-class Logarithmic Loss to measure and minimize mistakes during training.
        eval_metric='mlogloss',
        # random_state=42: Ensure the internal randomized heuristics reproduce identically every time.
        random_state=42
    )

    # Print status message.
    print("Training XGBoost model (this may take a few seconds)...")
    # Tell the model to study X_train and learn the patterns that lead to y_train.
    model.fit(X_train, y_train)

    # Ask the trained model to predict the answers for the training data it just saw.
    y_train_pred = model.predict(X_train)
    # Ask the model to predict the answers for the test data it has NEVER seen.
    y_test_pred = model.predict(X_test)

    # Calculate train accuracy (it should be higher because it has seen the data).
    train_acc = accuracy_score(y_train, y_train_pred)
    # Calculate test accuracy (the true measure of predictive capability on future data).
    test_acc = accuracy_score(y_test, y_test_pred)

    # Print the accuracies clearly.
    print(f"\n--- Accuracy Report ---")
    print(f"Training Accuracy:  {train_acc*100:.2f}%")
    print(f"Test Accuracy:      {test_acc*100:.2f}%")
    
    if test_acc < 0.60:
        print("\nTest accuracy below 60%. Retraining with anti-overfitting parameters...")
        model_v2 = XGBClassifier(
            n_estimators=500,
            max_depth=5,
            learning_rate=0.05,
            subsample=0.8,
            colsample_bytree=0.8,
            objective='multi:softprob',
            num_class=3,
            eval_metric='mlogloss',
            random_state=42
        )
        model_v2.fit(X_train, y_train)
        
        y_train_pred_v2 = model_v2.predict(X_train)
        y_test_pred_v2 = model_v2.predict(X_test)
        
        train_acc_v2 = accuracy_score(y_train, y_train_pred_v2)
        test_acc_v2 = accuracy_score(y_test, y_test_pred_v2)
        
        print(f"New Training Accuracy:  {train_acc_v2*100:.2f}%")
        print(f"New Test Accuracy:      {test_acc_v2*100:.2f}%")
        
        # Override the original model with the improved one for the classification report and save
        model = model_v2
        y_test_pred = y_test_pred_v2
    
    # Print a detailed classification report looking at how well it guess draws vs wins.
    print("\n--- Classification Report (Test Data) ---")
    # WHY: Accuracy alone hides flaws (e.g. if the model never guesses draws). This shows precision/recall for all 3 outcomes.
    print(classification_report(y_test, y_test_pred, target_names=["Loss (0)", "Draw (1)", "Win (2)"]))

    # Retrieve the internal array measuring how strongly each feature split the trees.
    importances = model.feature_importances_
    # Build a dictionary zipping the feature names with their importance score (converted to native float).
    importance_dict = {col: float(score) for col, score in zip(FEATURE_COLS, importances)}
    # Sort the dictionary so the most important feature is at the top.
    importance_dict = dict(sorted(importance_dict.items(), key=lambda item: item[1], reverse=True))

    # Save the serialized JSON dictionary to disk.
    with open(IMPORTANCE_SAVE_PATH, "w", encoding="utf-8") as f:
        # Dump with formatting.
        json.dump(importance_dict, f, indent=4)
    # Print where we saved it.
    print(f"\nSaved feature importance chart to: {IMPORTANCE_SAVE_PATH}")

    # Serialize and save the complex XGBoost model tree architecture to disk for future predictions.
    model.save_model(MODEL_SAVE_PATH)
    # Print ending message.
    print(f"Saved trained model to: {MODEL_SAVE_PATH}")

# Safety check. If run from command line, trigger main().
if __name__ == "__main__":
    main()
