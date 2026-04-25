import { useMemo, useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Trophy, TrendingUp, Shield, Ghost } from 'lucide-react'
import { loadSimulation } from '../utils/simStorage'
import { getTeamLogo } from '../data/teamLogos'

function ResultCard({ title, icon, color, children }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="p-6 md:p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md relative group overflow-hidden"
    >
      <div className={`absolute top-0 left-0 w-1 h-full ${color}`} />
      <div className="flex items-center gap-4 mb-8">
        <div className={`p-3 rounded-2xl bg-white/5 border border-white/5 text-white ${color.replace('bg-', 'text-')}`}>
          {icon}
        </div>
        <h3 className="font-display text-2xl text-white uppercase tracking-wider">{title}</h3>
      </div>
      {children}
    </motion.div>
  )
}

function TrajectoryCard({ stage, prob, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.1 }}
      className="flex-shrink-0 w-40 p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center text-center group hover:border-white transition-colors"
    >
      <span className="font-body text-[10px] text-text-muted mb-2 tracking-widest uppercase">{stage}</span>
      <div className="text-3xl font-display text-white mb-3">{prob.toFixed(1)}%</div>
      <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          whileInView={{ width: `${prob}%` }}
          className="h-full bg-white"
        />
      </div>
    </motion.div>
  )
}

export default function Results() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [copied, setCopied] = useState(false)

  const simId = searchParams.get('id')
  const persistedData = useMemo(() => simId ? loadSimulation(simId) : null, [simId])
  const data = state?.data || persistedData

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!data) return (
    <div className="min-h-screen bg-[#000000] flex flex-col items-center justify-center p-6">
      <p className="text-text-muted font-body mb-4">Simulation expired or link invalid.</p>
      <p className="text-text-muted/50 font-body text-sm mb-8">Run a new simulation to generate fresh results.</p>
      <button onClick={() => navigate('/')} className="btn-minimal">BACK TO HOME</button>
    </div>
  )

  const sortedWinners = Object.entries(data.win_tournament).sort(([, a], [, b]) => b - a)
  const champion = sortedWinners[0]
  const probabilityData = [
    { stage: 'Reach QF', prob: data.reach_qf[champion[0]] },
    { stage: 'Reach SF', prob: data.reach_sf[champion[0]] },
    { stage: 'Reach Final', prob: data.reach_final[champion[0]] },
    { stage: 'Win Trophy', prob: champion[1] }
  ]

  const darkHorses = sortedWinners.slice(8, 16)

  return (
    <div className="min-h-screen bg-[#000000] text-white pt-20 pb-32">
      {/* Dynamic Background */}
      <div className="fixed inset-0 stadium-atmosphere opacity-40 grayscale pointer-events-none" />

      {/* Hero: The Winner */}
      <section className="relative pt-24 pb-20 px-4 text-center overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/10 blur-[120px] rounded-full pointer-events-none"
        />

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10"
        >
          <div className="flex justify-center mb-6">
            <motion.div 
              animate={{ rotateY: [0, 180, 360] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
              className="p-4 rounded-3xl bg-white/10 border border-white/30 backdrop-blur-md"
            >
              <Trophy className="w-16 h-16 text-white" />
            </motion.div>
          </div>

          <p className="font-body text-white tracking-[0.6em] text-sm mb-4 uppercase">Simulated Champion</p>
          <h1 className="font-display text-[clamp(4rem,12vw,10rem)] leading-none text-white text-glow mb-2 tracking-tight">
            {champion[0]}
          </h1>
          <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm self-center mb-6">
            <span className="font-body text-text-muted">Win Probability:</span>
            <span className="font-display text-2xl text-white">{champion[1]}%</span>
          </div>

          {/* Share & Meta Row */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={handleCopyLink}
              className="px-4 py-2 rounded-full border border-white/40 text-xs font-display text-white hover:bg-white/10 transition-colors"
            >
              {copied ? '✓ LINK COPIED' : 'COPY SHARE LINK'}
            </button>
            {data.generated_at && (
              <span className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-[10px] font-body text-text-muted tracking-wider uppercase">
                Data: {new Date(data.generated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            )}
          </div>
        </motion.div>
      </section>

      <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Top Contenders */}
        <div className="lg:col-span-12 space-y-8">
          <ResultCard title="Trajectory to Glory" icon={<TrendingUp />} color="bg-white">
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
              {probabilityData.map((d, i) => (
                <TrajectoryCard key={d.stage} {...d} index={i} />
              ))}
            </div>
          </ResultCard>
        </div>

        <div className="lg:col-span-7 space-y-8">
          <ResultCard title="Top Seeds Output" icon={<Shield />} color="bg-blue-500">
            <div className="space-y-4">
              {sortedWinners.slice(0, 8).map(([team, prob], i) => (
                <motion.div 
                  key={team}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-4 group"
                >
                  <span className="w-6 font-display text-text-muted group-hover:text-white transition-colors">{i + 1}</span>
                  <div className="flex-1 flex flex-col">
                    <div className="flex justify-between items-end mb-1.5">
                      <span className="font-display text-lg text-white">{team}</span>
                      <span className="font-body text-sm font-bold text-white/80">{prob.toFixed(1)}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        whileInView={{ width: `${(prob / champion[1]) * 100}%` }}
                        className={`h-full ${i === 0 ? 'bg-white' : 'bg-blue-500/60'}`}
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </ResultCard>
        </div>

        <div className="lg:col-span-5 space-y-8">
          <ResultCard title="Potential Dark Horses" icon={<Ghost />} color="bg-purple-500">
            <div className="grid grid-cols-1 gap-3">
              {darkHorses.map(([team, prob], i) => (
                <motion.div 
                  key={team}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors cursor-default"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-purple-400 font-bold">RADAR</span>
                    <span className="font-display md:text-lg text-white/90">{team}</span>
                  </div>
                  <span className="font-body text-sm text-text-muted">{prob.toFixed(1)}%</span>
                </motion.div>
              ))}
            </div>
          </ResultCard>
        </div>
      </div>

      {/* Floating Action Button */}
      <motion.div 
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 px-6 py-4 rounded-full bg-white text-[#000000] font-display text-lg shadow-2xl flex items-center gap-4 cursor-pointer hover:scale-105 transition-transform"
        onClick={() => navigate('/')}
      >
        <span>RESTART SIMULATION</span>
        <div className="w-8 h-8 rounded-full bg-[#000000] text-white flex items-center justify-center">
          <TrendingUp className="w-4 h-4" />
        </div>
      </motion.div>
    </div>
  )
}
