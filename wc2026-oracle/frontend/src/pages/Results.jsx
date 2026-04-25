import { useMemo, useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, TrendingUp, Shield, Ghost, Crosshair, Star } from 'lucide-react'
import { loadSimulation } from '../utils/simStorage'
import { getTeamLogo } from '../data/teamLogos'

const TEAM_COLORS = {
  'Spain': { main: '#ff0000', secondary: '#ffd700' },
  'Argentina': { main: '#75aadb', secondary: '#ffffff' },
  'France': { main: '#002395', secondary: '#ed2939' },
  'Brazil': { main: '#009b3a', secondary: '#fedf00' },
  'England': { main: '#cf081f', secondary: '#ffffff' },
  'Portugal': { main: '#ff0000', secondary: '#006600' },
  'Netherlands': { main: '#ff4f00', secondary: '#21468b' },
  'Germany': { main: '#000000', secondary: '#ffce00' },
  'Italy': { main: '#0064aa', secondary: '#ffffff' }
}

const getTeamColor = (team) => {
  return TEAM_COLORS[team] || { main: '#3b82f6', secondary: '#8b5cf6' }
}

function FallbackAvatar({ name, size = "w-10 h-10" }) {
  const color = getTeamColor(name)
  return (
    <div 
      className={`${size} rounded-full flex items-center justify-center shadow-lg border border-white/20 flex-shrink-0`}
      style={{ background: `linear-gradient(135deg, ${color.main}, ${color.secondary})` }}
    >
      <span className="font-display text-white font-bold tracking-wider" style={{ fontSize: 'calc(100% * 0.4)' }}>
        {name.substring(0, 3).toUpperCase()}
      </span>
    </div>
  )
}

function TeamAvatar({ name, size = "w-10 h-10" }) {
  const logoUrl = getTeamLogo(name)
  const [imgError, setImgError] = useState(false)

  if (!logoUrl || imgError) {
    return <FallbackAvatar name={name} size={size} />
  }

  return (
    <div className={`${size} rounded-full overflow-hidden border border-white/20 shadow-lg bg-white/5 flex-shrink-0`}>
      <img 
        src={logoUrl} 
        alt={name} 
        className="w-full h-full object-cover"
        onError={() => setImgError(true)}
      />
    </div>
  )
}

function ResultCard({ title, icon, color, gradient, children }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="p-6 md:p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl relative group overflow-hidden shadow-2xl"
    >
      <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${gradient}`} />
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/4 pointer-events-none" />
      <div className="flex items-center gap-4 mb-8 relative z-10">
        <div className={`p-3 rounded-2xl bg-white/5 border border-white/10 shadow-inner ${color}`}>
          {icon}
        </div>
        <h3 className="font-display text-2xl text-white uppercase tracking-wider">{title}</h3>
      </div>
      <div className="relative z-10">{children}</div>
    </motion.div>
  )
}

function TrajectoryCard({ stage, prob, index, icon: Icon, colorClass, accent, isLast }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, type: 'spring', stiffness: 100 }}
      className="flex-1 relative flex flex-col items-center justify-center p-6 md:p-8 group"
    >
      {/* Connecting arrow - hidden on last item */}
      {!isLast && (
        <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-10 hidden md:flex items-center">
          <div className="w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
            <svg width="10" height="10" viewBox="0 0 10 10"><path d="M2 5h6M6 2l3 3-3 3" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" fill="none" strokeLinecap="round"/></svg>
          </div>
        </div>
      )}

      {/* Icon + label */}
      <div className={`p-2.5 rounded-xl bg-white/5 border border-white/10 mb-4 ${colorClass}`}>
        <Icon className="w-5 h-5" />
      </div>
      <span className="font-body text-[10px] text-white/40 mb-3 tracking-[0.25em] uppercase">{stage}</span>

      {/* Big number */}
      <div className="font-display leading-none mb-5" style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)' }}>
        <span className="text-white">{prob.toFixed(1)}</span>
        <span className="text-white/30 text-2xl">%</span>
      </div>

      {/* Full-width bar */}
      <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: `${prob}%` }}
          transition={{ duration: 1.5, ease: 'easeOut', delay: index * 0.1 }}
          className="h-full rounded-full"
          style={{ background: `linear-gradient(to right, ${accent}60, ${accent})` }}
        />
      </div>
    </motion.div>
  )
}

export default function Results() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const simId = searchParams.get('id')
  const persistedData = useMemo(() => simId ? loadSimulation(simId) : null, [simId])
  const data = state?.data || persistedData

  if (!data) return (
    <div className="min-h-screen bg-[#000000] flex flex-col items-center justify-center p-6 text-center">
      <Ghost className="w-16 h-16 text-white/20 mb-6" />
      <h2 className="font-display text-2xl text-white mb-2">Simulation Expired</h2>
      <p className="text-text-muted font-body mb-8 max-w-md">The requested simulation data is no longer available or the link is invalid.</p>
      <button onClick={() => navigate('/')} className="btn-minimal">RUN NEW SIMULATION</button>
    </div>
  )

  const sortedWinners = Object.entries(data.win_tournament).sort(([, a], [, b]) => b - a)
  const champion = sortedWinners[0]
  const championColor = getTeamColor(champion[0])
  
  const probabilityData = [
    { stage: 'Quarter Final', prob: data.reach_qf[champion[0]], icon: Crosshair, colorClass: 'text-blue-400', accent: '#3b82f6' },
    { stage: 'Semi Final', prob: data.reach_sf[champion[0]], icon: Shield, colorClass: 'text-purple-400', accent: '#a855f7' },
    { stage: 'The Final', prob: data.reach_final[champion[0]], icon: Star, colorClass: 'text-amber-400', accent: '#f59e0b' },
    { stage: 'Champions', prob: champion[1], icon: Trophy, colorClass: 'text-yellow-400', accent: '#eab308' }
  ]

  const darkHorses = sortedWinners.slice(8, 16)

  return (
    <div className="min-h-screen bg-[#000000] text-white pt-20 pb-32 relative overflow-hidden">
      {/* Dynamic Background Glow based on Champion */}
      <div 
        className="fixed top-0 left-1/2 -translate-x-1/2 w-[120vw] h-[80vh] blur-[150px] pointer-events-none opacity-20"
        style={{
          background: `radial-gradient(ellipse at top, ${championColor.main}, transparent 70%)`
        }}
      />
      
      <div className="fixed inset-0 stadium-atmosphere opacity-20 grayscale pointer-events-none mix-blend-overlay" />

      {/* Hero: The Winner */}
      <section className="relative pt-32 pb-24 px-4 text-center z-10 flex flex-col items-center justify-center min-h-[60vh]">
        
        {/* Flag Hero Integration */}
        <motion.div
          initial={{ opacity: 0, scale: 0, rotate: -20 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ type: "spring", damping: 20, stiffness: 100, delay: 0.2 }}
          className="relative mb-8"
        >
          <div className="absolute inset-0 bg-white/20 blur-3xl rounded-full scale-150 animate-pulse" />
          <div className="relative p-2 rounded-full bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-xl border border-white/20 shadow-[0_0_50px_rgba(255,255,255,0.1)]">
            <TeamAvatar name={champion[0]} size="w-32 h-32 md:w-40 md:h-40" />
            <div className="absolute -bottom-4 -right-4 bg-[#000000] p-3 rounded-full border border-white/20 shadow-xl">
              <Trophy className="w-8 h-8 text-yellow-400" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="relative"
        >
          <p className="font-body text-white/70 tracking-[0.6em] text-sm mb-4 uppercase flex items-center justify-center gap-3">
            <span className="w-12 h-[1px] bg-white/30" />
            Simulated Champion
            <span className="w-12 h-[1px] bg-white/30" />
          </p>
          
          <h1 className="font-display text-[clamp(4rem,12vw,12rem)] leading-none mb-6 tracking-tighter" style={{
            background: `linear-gradient(to bottom right, #ffffff, ${championColor.secondary || '#a8a8a8'})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            filter: `drop-shadow(0 0 40px ${championColor.main}40)`
          }}>
            {champion[0]}
          </h1>
          
          <div className="inline-flex items-center gap-4 px-8 py-3 rounded-full bg-white/10 border border-white/20 backdrop-blur-md shadow-2xl">
            <span className="font-body text-text-muted uppercase tracking-wider text-xs">Win Probability</span>
            <div className="h-4 w-[1px] bg-white/20" />
            <span className="font-display text-3xl text-white">{champion[1].toFixed(2)}%</span>
          </div>


        </motion.div>
      </section>

      <div className="w-full px-4 md:px-8 grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 relative z-20">
        {/* Trajectory — full width */}
        <div className="lg:col-span-12 space-y-8">
          <ResultCard title="Trajectory to Glory" icon={<TrendingUp />} color="text-white" gradient="from-white/40 via-white/10 to-transparent">
            <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-white/5">
              {probabilityData.map((d, i) => (
                <TrajectoryCard key={d.stage} {...d} index={i} isLast={i === probabilityData.length - 1} />
              ))}
            </div>
          </ResultCard>
        </div>

        <div className="lg:col-span-8 space-y-8">
          <ResultCard title="Top Seeds Output" icon={<Shield />} color="text-blue-400" gradient="from-blue-500/40 via-blue-500/10 to-transparent">
            <div className="space-y-5">
              {sortedWinners.slice(0, 8).map(([team, prob], i) => {
                const isWinner = i === 0
                return (
                  <motion.div 
                    key={team}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-4 group"
                  >
                    <span className={`w-6 font-display text-right ${isWinner ? 'text-yellow-400' : 'text-text-muted'}`}>{i + 1}</span>
                    <TeamAvatar name={team} size="w-10 h-10" />
                    
                    <div className="flex-1 flex flex-col justify-center">
                      <div className="flex justify-between items-end mb-2">
                        <span className={`font-display text-lg tracking-wide ${isWinner ? 'text-white' : 'text-white/80 group-hover:text-white transition-colors'}`}>{team}</span>
                        <span className="font-body text-sm font-bold text-white/90">{prob.toFixed(1)}%</span>
                      </div>
                      <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden shadow-inner">
                        <motion.div 
                          initial={{ width: 0 }}
                          whileInView={{ width: `${(prob / champion[1]) * 100}%` }}
                          transition={{ duration: 1, delay: i * 0.1 }}
                          className={`h-full relative rounded-full ${
                            isWinner ? 'bg-gradient-to-r from-yellow-600 to-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.5)]' 
                                     : 'bg-gradient-to-r from-blue-600/50 to-blue-400/80'
                          }`}
                        >
                          <div className="absolute top-0 right-0 w-2 h-full bg-white/50 blur-[1px]" />
                        </motion.div>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </ResultCard>
        </div>

        <div className="lg:col-span-4 space-y-8">
          <ResultCard title="Potential Dark Horses" icon={<Ghost />} color="text-purple-400" gradient="from-purple-500/40 via-purple-500/10 to-transparent">
            <div className="grid grid-cols-1 gap-3">
              {darkHorses.map(([team, prob], i) => (
                <motion.div 
                  key={team}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-purple-500/30 transition-all cursor-default group shadow-md"
                >
                  <div className="flex items-center gap-4">
                    <TeamAvatar name={team} size="w-8 h-8" />
                    <span className="font-display md:text-lg text-white/80 group-hover:text-white transition-colors tracking-wide">{team}</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[9px] text-purple-400/80 font-bold tracking-widest mb-0.5">RADAR</span>
                    <span className="font-body text-sm text-white">{prob.toFixed(1)}%</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </ResultCard>
        </div>
      </div>

      {/* Centered CTA at bottom */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="flex justify-center mt-16 pb-16 relative z-20"
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          className="px-10 py-5 rounded-full bg-white text-[#000000] font-display text-lg shadow-[0_0_40px_rgba(255,255,255,0.2)] flex items-center gap-4 cursor-pointer hover:bg-gray-100 transition-all border border-white/20"
          onClick={() => navigate('/')}
        >
          <span>RESTART SIMULATION</span>
          <div className="w-8 h-8 rounded-full bg-[#000000] text-white flex items-center justify-center">
            <TrendingUp className="w-4 h-4" />
          </div>
        </motion.button>
      </motion.div>
    </div>
  )
}
