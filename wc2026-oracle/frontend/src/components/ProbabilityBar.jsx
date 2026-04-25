import { motion } from 'framer-motion'

export default function ProbabilityBar({
  probA,
  probB,
  teamA,
  teamB,
  label,
  variant = 'duel'
}) {
  const safeA = Math.max(0, Math.min(100, Number(probA) || 0))
  const safeB = Math.max(0, Math.min(100, Number(probB) || 0))
  const total = safeA + safeB || 1
  const widthA = (safeA / total) * 100
  const widthB = 100 - widthA

  return (
    <div className="w-full">
      <div className="flex items-center justify-between text-[10px] font-body text-text-muted mb-2 uppercase tracking-tighter">
        <span className="truncate max-w-[40%]">{teamA} {safeA.toFixed(1)}%</span>
        <span className="text-white font-bold">{label}</span>
        <span className="truncate max-w-[40%] text-right">{safeB.toFixed(1)}% {teamB}</span>
      </div>
      
      <div className="relative h-2.5 rounded-full bg-white/5 overflow-hidden border border-white/5 flex">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${widthA}%` }}
          transition={{ duration: 1, ease: 'circOut' }}
          className="h-full bg-gradient-to-r from-white to-yellow-400 relative"
        >
          <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
        </motion.div>
        
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${widthB}%` }}
          transition={{ duration: 1, ease: 'circOut' }}
          className="h-full bg-white/10"
        />

        {/* Center Indicator */}
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/20 -translate-x-1/2" />
      </div>
    </div>
  )
}
