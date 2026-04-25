import { motion } from 'framer-motion'
import ProbabilityBar from './ProbabilityBar'

export default function MatchCard({ match, isVisible, isRecent }) {
  const isWinnerA = match.winner === match.teamA
  const isWinnerB = match.winner === match.teamB

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative group p-4 md:p-6 rounded-2xl border transition-all duration-500 ${
        isRecent 
          ? 'bg-white/10 border-white/50 shadow-[0_0_30px_rgba(255,255,255,0.15)] ring-1 ring-white/20' 
          : 'bg-white/5 border-white/10'
      }`}
    >
      <div className="flex items-center justify-between gap-4 mb-4">
        {/* Team A */}
        <div className={`flex-1 flex flex-col transition-all duration-700 ${isWinnerA ? 'scale-105' : isVisible && isWinnerB ? 'opacity-40 grayscale' : ''}`}>
          <span className={`font-display text-lg md:text-2xl truncate ${isWinnerA ? 'text-white' : 'text-white'}`}>
            {match.teamA}
          </span>
          <span className="font-body text-[10px] text-text-muted uppercase tracking-widest">Contender</span>
        </div>

        {/* VS Divider */}
        <div className="flex flex-col items-center px-4">
          <div className="text-white font-display text-sm">VS</div>
          <div className="w-px h-8 bg-gradient-to-b from-transparent via-white/30 to-transparent" />
        </div>

        {/* Team B */}
        <div className={`flex-1 flex flex-col items-end transition-all duration-700 ${isWinnerB ? 'scale-105' : isVisible && isWinnerA ? 'opacity-40 grayscale' : ''}`}>
          <span className={`font-display text-lg md:text-2xl truncate ${isWinnerB ? 'text-white' : 'text-white'}`}>
            {match.teamB}
          </span>
          <span className="font-body text-[10px] text-text-muted uppercase tracking-widest">Contender</span>
        </div>
      </div>

      <div className="relative pt-2">
        <ProbabilityBar 
          probA={match.probA} 
          probB={match.probB} 
          teamA={match.teamA}
          teamB={match.teamB}
          label={match.metricLabel}
        />
        
        {/* Winner Reveal Badge */}
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-4 py-1 bg-white text-[#000000] font-display text-[10px] rounded-full shadow-[0_0_15px_rgba(255,255,255,0.5)]"
          >
            WINNER: {match.winner}
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}
