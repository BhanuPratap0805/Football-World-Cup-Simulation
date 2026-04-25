import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import MagicRings from '../components/MagicRings'

const sectionVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.6, ease: 'easeOut' }
  })
}

function MethodologySection({ icon, title, content, bullets, index }) {
  return (
    <motion.section
      custom={index}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={sectionVariants}
      className="p-6 md:p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md relative group overflow-hidden hover:border-white/30 transition-colors duration-500"
    >
      <div className="absolute top-0 left-0 w-1 h-full bg-white" />
      <div className="flex items-center gap-4 mb-6">
        <span className="text-3xl">{icon}</span>
        <h2 className="font-display text-2xl md:text-3xl text-white uppercase tracking-wider">{title}</h2>
      </div>
      <p className="font-body text-text-muted leading-relaxed mb-4">{content}</p>
      {bullets && (
        <ul className="space-y-2">
          {bullets.map((item, i) => (
            <li key={i} className="flex items-start gap-3 font-body text-sm text-white/70">
              <span className="text-white mt-0.5">▸</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )}
    </motion.section>
  )
}

const SECTIONS = [
  {
    icon: '📊',
    title: 'Data Pipeline',
    content: 'Historical international match data from 1990 to present, combined with FIFA/ClubElo ratings, World Cup experience metrics, and recent form indicators. Anti-leakage guards prevent future data contamination by ensuring features are engineered chronologically.',
    bullets: [
      'Match results from 1990+ filtered for competitive fixtures',
      'Elo ratings computed with home advantage and tournament weighting',
      'FIFA rankings mapped per-team with temporal alignment',
      'Recent form windows (5, 10, 20 matches) with goal differentials'
    ]
  },
  {
    icon: '🤖',
    title: 'Model Architecture',
    content: 'XGBoost multi-class classifier trained to predict win/draw/loss outcomes. Chosen for its superior performance on tabular data, fast inference speed, and built-in feature importance for interpretability. Probabilities are calibrated via Platt scaling for reliable confidence scores.',
    bullets: [
      '~57.5% test accuracy on held-out international match data',
      'Multi-class objective with softmax probability outputs',
      'Hyperparameters tuned via cross-validation on temporal splits',
      'Feature importance tracked for model transparency'
    ]
  },
  {
    icon: '⚽',
    title: 'Monte Carlo Simulation',
    content: '10,000 full tournament iterations per simulation run. Each path samples match outcomes from calibrated win probabilities, building a distribution of possible tournament brackets. Knockout ties are resolved with draw probability redistribution weighted by team strength.',
    bullets: [
      '10,000 independent tournament paths per run',
      'Group stage → Round of 32 → Final bracket progression',
      'Knockout draws redistributed proportionally (no coin flips)',
      'Results aggregated into stage-by-stage advancement probabilities'
    ]
  },
  {
    icon: '⚠️',
    title: 'Limitations & Next Steps',
    content: 'The current model does not account for live injuries, expected goals (xG), or detailed tactical matchup data. Weather and altitude impacts are approximated heuristically. The pipeline is designed for extensibility with planned improvements.',
    bullets: [
      'Real-time API sync for live Elo and ranking updates',
      'SHAP explainability layer for per-match feature attribution',
      'User scenario tuning (custom bracket, injury toggles)',
      'xG integration and tactical formation modeling'
    ]
  }
]

export default function Methodology() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-transparent text-white relative overflow-hidden">
      <div className="fixed inset-0 z-[-50] pointer-events-none bg-black">
        <MagicRings
          color="#A855F7"
          colorTwo="#6366F1"
          ringCount={6}
          speed={1}
          attenuation={10}
          lineThickness={2}
          baseRadius={0.35}
          radiusStep={0.1}
          scaleRate={0.1}
          opacity={1}
          blur={0}
          noiseAmount={0.1}
          rotation={0}
          ringGap={1.5}
          fadeIn={0.7}
          fadeOut={0.5}
          followMouse={false}
          mouseInfluence={0.2}
          hoverScale={1.2}
          parallax={0.05}
          clickBurst={false}
        />
      </div>
      {/* Background Atmosphere */}
      <div className="fixed inset-0 stadium-atmosphere opacity-30 grayscale pointer-events-none" />

      <div className="relative z-10 px-4 pt-32 pb-24 max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-16 text-center"
        >
          <p className="font-body text-xs text-text-muted tracking-[0.4em] uppercase mb-4">Behind the Prophecy</p>
          <h1 className="font-display text-5xl md:text-7xl text-glow text-white mb-4 italic uppercase">
            How the Oracle Works
          </h1>
          <p className="font-body text-text-muted max-w-xl mx-auto leading-relaxed">
            A transparent look at the data science, machine learning, and simulation engine 
            powering the WC 2026 Oracle predictions.
          </p>
        </motion.div>

        {/* Sections */}
        <div className="space-y-8">
          {SECTIONS.map((section, i) => (
            <MethodologySection key={section.title} {...section} index={i} />
          ))}
        </div>

        {/* Tech Stack Badge Row */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-16 p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md"
        >
          <h3 className="font-display text-xl text-white uppercase tracking-wider mb-4">Tech Stack</h3>
          <div className="flex flex-wrap gap-3">
            {['Python', 'XGBoost', 'FastAPI', 'Pandas', 'React 18', 'Vite', 'Tailwind CSS', 'Framer Motion', 'Axios'].map((tech) => (
              <span
                key={tech}
                className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 font-body text-xs text-white/70 hover:border-white/40 hover:text-white transition-colors cursor-default"
              >
                {tech}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Back Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <button
            onClick={() => navigate('/')}
            className="btn-minimal oracle-cta relative group overflow-hidden"
          >
            <span className="relative z-10">BACK TO HOME</span>
            <motion.div
              className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500"
            />
          </button>
        </motion.div>
      </div>
    </div>
  )
}
