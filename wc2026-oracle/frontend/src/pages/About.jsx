import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import RadialOrbitalTimeline from '../components/RadialOrbitalTimeline'
import { Target, Microscope, LineChart, Rocket } from 'lucide-react'
import MagicRings from '../components/MagicRings'

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6, delay, ease: 'easeOut' }
})

const oracleTimeline = [
  {
    id: 1,
    title: "Why I Built This",
    date: "Inception",
    content: "To demonstrate a full ML pipeline — from raw data ingestion, feature engineering, and model training — to a production-ready REST API consumed by a modern React frontend.",
    category: "origin",
    icon: Target,
    relatedIds: [2, 3],
    status: "completed",
    energy: 90
  },
  {
    id: 2,
    title: "What Makes It Different",
    date: "Core Engine",
    content: "Rather than simple predictions, the Oracle runs 10,000 independent tournament simulations to produce probability distributions across all top 32 teams, giving nuanced insight.",
    category: "feature",
    icon: Microscope,
    relatedIds: [1],
    status: "completed",
    energy: 100
  },
  {
    id: 3,
    title: "Portfolio Goals",
    date: "Architecture",
    content: "Showcases end-to-end ML engineering: data pipeline design, anti-leakage feature construction, model calibration, FastAPI deployment, and a cinematic React frontend.",
    category: "goals",
    icon: LineChart,
    relatedIds: [1, 4],
    status: "completed",
    energy: 85
  },
  {
    id: 4,
    title: "What's Next",
    date: "Future Roadmap",
    content: "Real-time Elo updates via API sync, SHAP explainability for match predictions, user-controlled scenario toggles, and potential Vercel + Render deployment.",
    category: "roadmap",
    icon: Rocket,
    relatedIds: [2, 3],
    status: "in-progress",
    energy: 75
  }
];

export default function About() {
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
      <div className="fixed inset-0 stadium-atmosphere opacity-25 grayscale pointer-events-none" />

      <div className="relative z-10 px-4 pt-32 pb-24 max-w-4xl mx-auto">

        {/* Header */}
        <motion.div {...fadeUp(0)} className="mb-20 text-center">
          <p className="font-body text-xs text-text-muted tracking-[0.4em] uppercase mb-4">The Project</p>
          <h1 className="font-display text-5xl md:text-7xl text-white italic uppercase mb-6">
            About the <span className="text-white text-glow">Oracle</span>
          </h1>
          <p className="font-body text-text-muted max-w-2xl mx-auto leading-relaxed text-lg">
            A data science portfolio project built to forecast the FIFA World Cup 2026 using 
            machine learning and Monte Carlo simulation — combining historical match data, 
            Elo ratings, and XGBoost predictions into a cinematic prediction engine.
          </p>
        </motion.div>

        {/* Radial Orbital Timeline */}
        <motion.div {...fadeUp(0.2)} className="w-full mb-16 relative z-20">
          <RadialOrbitalTimeline timelineData={oracleTimeline} />
        </motion.div>

        {/* Tech Stack */}
        <motion.div {...fadeUp(0.4)} className="p-6 rounded-3xl bg-white/5 border border-white/10 mb-12">
          <h3 className="font-display text-xl text-white uppercase tracking-wider mb-5">Full Stack</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { layer: 'Data', techs: ['Python', 'Pandas', 'NumPy'] },
              { layer: 'Model', techs: ['XGBoost', 'Scikit-learn', 'Platt Scaling'] },
              { layer: 'Backend', techs: ['FastAPI', 'Uvicorn', 'Python 3.11'] },
              { layer: 'Frontend', techs: ['React 18', 'Vite', 'React Router v6'] },
              { layer: 'UI/UX', techs: ['Tailwind CSS', 'Framer Motion', 'Lucide'] },
              { layer: 'Deploy', techs: ['Render (API)', 'Vercel (UI)', 'GitHub'] },
            ].map((group) => (
              <div key={group.layer}>
                <p className="font-body text-[10px] text-white tracking-widest uppercase mb-2">{group.layer}</p>
                {group.techs.map((t) => (
                  <p key={t} className="font-body text-xs text-text-muted mb-1">{t}</p>
                ))}
              </div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div {...fadeUp(0.5)} className="text-center">
          <button
            onClick={() => navigate('/simulate')}
            className="btn-minimal oracle-cta relative group overflow-hidden"
          >
            <span className="relative z-10">RUN THE SIMULATION</span>
            <motion.div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500" />
          </button>
        </motion.div>
      </div>
    </div>
  )
}
