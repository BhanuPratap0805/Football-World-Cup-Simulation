import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const MESSAGES = [
  "ANALYZING HISTORICAL GOAL DATA...",
  "RUNNING 10,000 MONTE CARLO PATHS...",
  "SYNTHESIZING TACTICAL VARIABLES...",
  "CONSULTING PITCH TRAJECTORY MODELS...",
  "CALCULATING WORLD CUP PROBABILITIES...",
  "ALGORITHMICALLY FORECASTING DESTINY...",
  "DECODING TOURNAMENT MOMENTUM..."
]

export default function LoadingOracle({ progressMessage }) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % MESSAGES.length)
    }, 2000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="fixed inset-0 z-[100] bg-[#000000] flex flex-col items-center justify-center overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-white/10 blur-[100px] rounded-full animate-pulse" />
      
      {/* Mystical Alchemist Football SVG */}
      <motion.div
        animate={{ 
          y: [0, -20, 0],
          rotate: [0, 10, -10, 0],
          scale: [1, 1.05, 1]
        }}
        transition={{ 
          duration: 4, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
        className="relative z-10 w-32 h-32 mb-12"
      >
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_20px_rgba(255,255,255,0.4)]">
          <circle cx="50" cy="50" r="48" fill="none" stroke="#FFFFFF" strokeWidth="1" strokeDasharray="4 4" className="opacity-40" />
          <path d="M50 2 L50 98 M2 50 L98 50 M15 15 L85 85 M15 85 L85 15" stroke="#FFFFFF" strokeWidth="0.5" className="opacity-20" />
          <defs>
            <radialGradient id="ballGrad">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.2" />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>
          </defs>
          <circle cx="50" cy="50" r="40" fill="url(#ballGrad)" />
          {/* Soccer ball wireframe */}
          <path 
            d="M50 10 L40 30 L60 30 Z M40 30 L20 40 L30 60 L50 70 L70 60 L80 40 Z M30 60 L40 85 L60 85 L70 60 M20 40 L5 50 L15 70 M80 40 L95 50 L85 70" 
            fill="none" 
            stroke="#FFFFFF" 
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        {/* Orbiting Ring */}
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 border-2 border-dashed border-white/20 rounded-full scale-150"
        />
      </motion.div>

      {/* Terminal Text */}
      <div className="relative z-10 w-full max-w-sm text-center font-mono">
        <div className="h-20 flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
              transition={{ duration: 0.5 }}
              className="text-white tracking-widest text-sm"
            >
              {MESSAGES[index]}
            </motion.div>
          </AnimatePresence>
        </div>
        
        {/* Progress Bar (Decorative) */}
        <div className="mt-4 w-48 h-1 bg-white/5 mx-auto rounded-full overflow-hidden border border-white/5">
          <motion.div
            animate={{ x: ["-100%", "100%"] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="w-1/2 h-full bg-gradient-to-r from-transparent via-white to-transparent"
          />
        </div>

        {/* Live progress stage from hook */}
        {progressMessage && (
          <AnimatePresence mode="wait">
            <motion.p
              key={progressMessage}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.4 }}
              className="mt-6 text-white/40 text-xs tracking-widest uppercase text-center"
            >
              {progressMessage}
            </motion.p>
          </AnimatePresence>
        )}
      </div>

      {/* Grid Pattern Background */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(circle, #FFFFFF 1px, transparent 0)', backgroundSize: '40px 40px' }}
      />
    </div>
  )
}
