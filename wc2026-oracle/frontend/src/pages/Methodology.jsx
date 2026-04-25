import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Database, Brain, Shuffle, AlertTriangle, ArrowRight, Check } from 'lucide-react'

const SECTIONS = [
  {
    icon: Database,
    step: '01',
    title: 'Data Pipeline',
    accent: '#3b82f6',
    gradient: 'from-blue-500/10 to-transparent',
    tag: 'INGESTION',
    content: 'Historical international match data from 1990 to present, combined with FIFA/ClubElo ratings, World Cup experience metrics, and recent form indicators. Anti-leakage guards prevent future data contamination by ensuring features are engineered chronologically.',
    bullets: [
      'Match results from 1990+ filtered for competitive fixtures',
      'Elo ratings computed with home advantage and tournament weighting',
      'FIFA rankings mapped per-team with temporal alignment',
      'Recent form windows (5, 10, 20 matches) with goal differentials',
    ]
  },
  {
    icon: Brain,
    step: '02',
    title: 'Model Architecture',
    accent: '#a855f7',
    gradient: 'from-purple-500/10 to-transparent',
    tag: 'ML ENGINE',
    content: 'XGBoost multi-class classifier trained to predict win/draw/loss outcomes. Chosen for its superior performance on tabular data, fast inference speed, and built-in feature importance for interpretability. Probabilities are calibrated via Platt scaling for reliable confidence scores.',
    bullets: [
      '~57.5% test accuracy on held-out international match data',
      'Multi-class objective with softmax probability outputs',
      'Hyperparameters tuned via cross-validation on temporal splits',
      'Feature importance tracked for model transparency',
    ]
  },
  {
    icon: Shuffle,
    step: '03',
    title: 'Monte Carlo Simulation',
    accent: '#f59e0b',
    gradient: 'from-amber-500/10 to-transparent',
    tag: 'SIMULATION',
    content: '10,000 full tournament iterations per simulation run. Each path samples match outcomes from calibrated win probabilities, building a distribution of possible tournament brackets. Knockout ties are resolved with draw probability redistribution weighted by team strength.',
    bullets: [
      '10,000 independent tournament paths per run',
      'Group stage → Round of 32 → Final bracket progression',
      'Knockout draws redistributed proportionally (no coin flips)',
      'Results aggregated into stage-by-stage advancement probabilities',
    ]
  },
  {
    icon: AlertTriangle,
    step: '04',
    title: 'Limitations & Next Steps',
    accent: '#ef4444',
    gradient: 'from-red-500/10 to-transparent',
    tag: 'ROADMAP',
    content: 'The current model does not account for live injuries, expected goals (xG), or detailed tactical matchup data. Weather and altitude impacts are approximated heuristically. The pipeline is designed for extensibility.',
    bullets: [
      'Real-time API sync for live Elo and ranking updates',
      'SHAP explainability layer for per-match feature attribution',
      'User scenario tuning (custom bracket, injury toggles)',
      'xG integration and tactical formation modeling',
    ]
  }
]

const FEATURES = [
  { name: 'elo_diff', desc: 'Dynamic skill rating gap', color: '#3b82f6' },
  { name: 'fifa_rank_diff', desc: 'Official global ranking delta', color: '#a855f7' },
  { name: 'avg_goals_scored', desc: 'Offensive form (last 5)', color: '#f59e0b' },
  { name: 'avg_goals_conceded', desc: 'Defensive form (last 5)', color: '#ef4444' },
  { name: 'h2h_win_rate', desc: 'Historical head-to-head', color: '#10b981' },
  { name: 'form_points', desc: 'Points in last 5 games', color: '#8b5cf6' },
  { name: 'wc_experience', desc: 'WC deep-run history', color: '#ec4899' },
  { name: 'is_neutral', desc: 'Home advantage toggle', color: '#14b8a6' },
]

const TECH_STACK = [
  { name: 'Python', category: 'Backend' },
  { name: 'XGBoost', category: 'ML' },
  { name: 'FastAPI', category: 'Backend' },
  { name: 'Pandas', category: 'Data' },
  { name: 'Scikit-Learn', category: 'ML' },
  { name: 'React 18', category: 'Frontend' },
  { name: 'Vite', category: 'Frontend' },
  { name: 'Tailwind CSS', category: 'Frontend' },
  { name: 'Framer Motion', category: 'Frontend' },
]

const CATEGORY_COLORS = {
  Backend: '#3b82f6',
  ML: '#a855f7',
  Data: '#f59e0b',
  Frontend: '#10b981',
}

export default function Methodology() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-[#000000] text-white relative overflow-hidden">
      {/* Subtle top gradient */}
      <div className="fixed top-0 left-0 right-0 h-[60vh] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at top, rgba(168,85,247,0.07), transparent 70%)' }} />

      <div className="relative z-10 px-4 pt-32 pb-32 max-w-5xl mx-auto">

        {/* Hero Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-24 text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-300 text-[11px] font-body tracking-[0.3em] uppercase mb-6">
            Behind the Prophecy
          </div>
          <h1 className="font-display text-[clamp(3rem,10vw,8rem)] leading-none italic uppercase text-white mb-6"
            style={{ textShadow: '0 0 80px rgba(168,85,247,0.25)' }}>
            How It<br /><span style={{ WebkitTextStroke: '1px rgba(255,255,255,0.4)', color: 'transparent' }}>Works</span>
          </h1>
          <p className="font-body text-white/50 max-w-xl mx-auto leading-relaxed text-sm">
            A transparent look at the data science, machine learning, and simulation engine powering the WC 2026 Oracle predictions.
          </p>
        </motion.div>

        {/* Pipeline Steps */}
        <div className="relative">
          {/* Vertical timeline line */}
          <div className="absolute left-7 top-8 bottom-8 w-px bg-gradient-to-b from-blue-500/50 via-purple-500/50 via-amber-500/50 to-red-500/50 hidden md:block" />

          <div className="space-y-6">
            {SECTIONS.map((section, i) => {
              const Icon = section.icon
              return (
                <motion.div
                  key={section.title}
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ delay: i * 0.1, duration: 0.6 }}
                  className="relative flex gap-6 md:gap-10"
                >
                  {/* Step circle */}
                  <div className="flex-shrink-0 relative z-10">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center border shadow-lg"
                      style={{
                        borderColor: `${section.accent}40`,
                        background: `${section.accent}15`,
                        boxShadow: `0 0 24px ${section.accent}20`
                      }}>
                      <Icon className="w-6 h-6" style={{ color: section.accent }} />
                    </div>
                  </div>

                  {/* Content card */}
                  <div className="flex-1 pb-6">
                    <div className={`p-6 md:p-8 rounded-3xl border border-white/10 bg-gradient-to-br ${section.gradient} bg-white/[0.03] backdrop-blur-sm relative overflow-hidden group hover:border-white/20 transition-all duration-500`}>
                      {/* Top accent bar */}
                      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(to right, ${section.accent}80, transparent)` }} />

                      <div className="flex flex-wrap items-center gap-3 mb-5">
                        <span className="text-[10px] font-body tracking-[0.3em] px-3 py-1 rounded-full border"
                          style={{ color: section.accent, borderColor: `${section.accent}40`, background: `${section.accent}10` }}>
                          {section.tag}
                        </span>
                        <span className="font-body text-white/20 text-xs">STEP {section.step}</span>
                      </div>

                      <h2 className="font-display text-2xl md:text-3xl text-white uppercase tracking-wider mb-4">{section.title}</h2>
                      <p className="font-body text-white/50 leading-relaxed mb-6 text-sm">{section.content}</p>

                      <ul className="space-y-3">
                        {section.bullets.map((item, j) => (
                          <li key={j} className="flex items-start gap-3 font-body text-sm text-white/70">
                            <div className="flex-shrink-0 mt-0.5 w-5 h-5 rounded-full flex items-center justify-center"
                              style={{ background: `${section.accent}20`, border: `1px solid ${section.accent}40` }}>
                              <Check className="w-3 h-3" style={{ color: section.accent }} />
                            </div>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* Feature Engineering Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-20"
        >
          <div className="text-center mb-10">
            <p className="font-body text-[11px] text-white/40 tracking-[0.4em] uppercase mb-2">The 8 signals</p>
            <h3 className="font-display text-3xl md:text-4xl text-white uppercase italic">Feature Engineering</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-white/20 transition-all duration-300 group"
                style={{ boxShadow: `inset 0 0 20px ${f.color}05` }}
              >
                <div className="w-8 h-1 rounded-full mb-3" style={{ background: f.color }} />
                <p className="font-display text-sm text-white mb-1 truncate">{f.name}</p>
                <p className="font-body text-[11px] text-white/40 leading-tight">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Tech Stack */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 p-6 md:p-8 rounded-3xl bg-white/[0.03] border border-white/10 backdrop-blur-sm"
        >
          <h3 className="font-display text-xl text-white uppercase tracking-wider mb-6">Tech Stack</h3>
          <div className="flex flex-wrap gap-2">
            {TECH_STACK.map((tech) => (
              <span
                key={tech.name}
                className="px-4 py-2 rounded-full text-xs font-body border transition-all duration-200 cursor-default"
                style={{
                  borderColor: `${CATEGORY_COLORS[tech.category]}40`,
                  background: `${CATEGORY_COLORS[tech.category]}10`,
                  color: CATEGORY_COLORS[tech.category]
                }}
              >
                {tech.name}
              </span>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 flex flex-col sm:flex-row gap-4 items-center justify-center"
        >
          <button
            onClick={() => navigate('/simulate')}
            className="flex items-center gap-3 px-8 py-4 rounded-full bg-white text-black font-display text-sm uppercase tracking-wider hover:bg-white/90 hover:scale-105 transition-all shadow-[0_0_40px_rgba(255,255,255,0.15)]"
          >
            Run a Simulation
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-3 px-8 py-4 rounded-full border border-white/20 text-white/70 font-display text-sm uppercase tracking-wider hover:bg-white/5 hover:text-white transition-all"
          >
            Back to Home
          </button>
        </motion.div>

      </div>
    </div>
  )
}
