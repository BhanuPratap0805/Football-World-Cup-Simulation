<div align="center">
  <h1>🏆 WC2026 Oracle</h1>
  <p><strong>A Cinematic, Data-Driven World Cup 2026 Prediction Engine</strong></p>
  <p>10,000 parallel realities simulated using XGBoost, historical data, and Monte Carlo mathematics.</p>
</div>

---

## 📖 Overview

The **WC2026 Oracle** is a full-stack web application designed to forecast the outcomes of the 2026 FIFA World Cup. By leveraging an XGBoost machine learning pipeline trained on decades of international football results and dynamic Elo ratings, the engine runs 10,000 Monte Carlo simulations per tournament run to predict every matchup from the group stages to the grand final.

Wrapped in a premium, cinematic UI, the Oracle presents raw data through an immersive dashboard, dynamic orbital timelines, and real-time matchup cards.

## 🛠 Tech Stack

### Frontend (The Cinematic UI)
* **Framework:** React 18 + Vite
* **Styling:** Tailwind CSS (with advanced glassmorphism & gradients)
* **Animations:** Framer Motion (page transitions, scroll reveals, orbital nodes)
* **Routing:** React Router v6

### Backend (The Prediction Engine)
* **Framework:** FastAPI (Python)
* **Machine Learning:** XGBoost (Multi-class probabilistic modeling)
* **Data Processing:** Pandas, Scikit-Learn
* **Simulation Logic:** Monte Carlo 10,000-run simulation pipeline
* **Data Core:** Historical Match Data + Active Elo Rating System

---

## ✨ Key Features

1. **The Simulation Engine:** Runs 10,000 iterative Monte Carlo bracket simulations using the trained XGBoost model to predict exact percentage odds for each team to reach specific knockout rounds.
2. **Dynamic Probabilistic Matchups:** Knockout rounds implement penalty shootout mechanics (distributing draw probabilities back to the favorites proportionally).
3. **The Data Dashboard:** A fully responsive, premium data dashboard featuring CSS/SVG bar charts, live simulation data, and team metrics.
4. **Cinematic Journey:** Scroll-driven animations, shader-based backgrounds, and interactive 3D-tilt showcase cards for the Top 8 predictive favorites.
5. **URL Sharing:** Simulation outcomes are cached locally, allowing users to share specific simulation run results via URL parameters (`?id=xyz`).

---

## 🚀 Getting Started

### Prerequisites
* **Node.js** (v16+)
* **Python** (3.9+)
* **Git**

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/wc2026-oracle.git
cd wc2026-oracle
```

### 2. Run the Backend (FastAPI)
The backend requires its dependencies and needs to train the XGBoost model locally.
```bash
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Run the data pipeline and train the XGBoost Model
python model/train.py

# Start the FastAPI Server (runs on http://localhost:8000)
uvicorn api.main:app --reload
```

### 3. Run the Frontend (React)
Open a new terminal window:
```bash
cd frontend

# Install Node dependencies
npm install

# Start the development server (runs on http://localhost:5173)
npm run dev
```

---

## 🧠 Methodology & Machine Learning

The Oracle does not rely on subjective opinions. It feeds entirely on historical metrics engineered into an 8-feature pipeline for XGBoost:

* `elo_diff`: The dynamic gap in historical skill rating between two opponents.
* `fifa_rank_diff`: The official global ranking differential.
* `avg_goals_scored_last5` / `avg_goals_conceded_last5`: Form indicators based on recent offensive and defensive performances.
* `h2h_win_rate`: Head-to-head historical win rates between specific nations.
* `form_points`: Points accumulated over the last 5 international breaks.
* `wc_experience`: Historical depth in deep-tournament pressure environments.
* `is_neutral`: Home advantage toggle (critical for 2026 hosts USA, Mexico, and Canada).

*Note: To prevent future data leakage, the model uses a strictly chronological `shuffle=False` train/test split.*

---

## 📂 Project Structure

```text
├── backend/                  # FastAPI & Machine Learning Logic
│   ├── api/                  # Endpoints (/simulate, /matchup)
│   ├── data/                 # Raw CSVs & processed datasets
│   ├── model/                # XGBoost training and prediction scripts
│   └── requirements.txt      # Python dependencies
├── frontend/                 # React UI Codebase
│   ├── src/
│   │   ├── api/              # Axios API client
│   │   ├── components/       # Reusable UI (Navbar, MatchCards, TiltCard)
│   │   ├── hooks/            # Custom hooks (useSimulation)
│   │   ├── pages/            # View components (Home, Data, Methodology, Simulation)
│   │   └── utils/            # Simulation state storage logic
│   ├── index.css             # Tailwind directives & custom animations
│   └── package.json          # Node dependencies
└── .gitignore                # Safely ignores node_modules, .venv, and raw data archives
```

---

## 🤝 Contributing
Contributions are welcome! Please feel free to submit a Pull Request if you have optimizations for the machine learning model, UI enhancements, or real-time data integrations.

## 📝 License
This project is open-source and available under the MIT License.
