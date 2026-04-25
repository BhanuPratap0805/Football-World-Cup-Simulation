import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import useSimulation from '../hooks/useSimulation'
import LoadingOracle from '../components/LoadingOracle'
import MatchCard from '../components/MatchCard'
import { saveSimulation } from '../utils/simStorage'

// Seeded PRNG: ensures each simulation run produces different results
// even if the underlying API data (probabilities) stays the same.
function makePRNG() {
  let seed = Date.now() ^ (Math.random() * 0xFFFFFFFF | 0)
  return function () {
    seed ^= seed << 13
    seed ^= seed >> 17
    seed ^= seed << 5
    return ((seed >>> 0) / 0xFFFFFFFF)
  }
}

const ROUNDS = [
  { id: 'r32', name: 'Round of 32', metric: 'reach_qf' },
  { id: 'r16', name: 'Round of 16', metric: 'reach_qf' },
  { id: 'qf', name: 'Quarter-Finals', metric: 'reach_sf' },
  { id: 'sf', name: 'Semi-Finals', metric: 'reach_final' },
  { id: 'f', name: 'Grand Final', metric: 'win_tournament' }
]

export default function Simulation() {
  const { data, loading, error } = useSimulation()
  const [currentRoundIdx, setCurrentRoundIdx] = useState(0)
  const [completedMatches, setCompletedMatches] = useState([])
  const [isFinishing, setIsFinishing] = useState(false)
  const [skipReveal, setSkipReveal] = useState(false)
  const navigate = useNavigate()

  const fullSimulation = useMemo(() => {
    if (!data) return null

    const rand = makePRNG() // Fresh PRNG every render of this memo

    const buildBracket = () => {
      let currentTeams = Object.keys(data.win_tournament).slice(0, 32)
      // Fisher-Yates shuffle with seeded random
      for (let i = currentTeams.length - 1; i > 0; i--) {
        const j = Math.floor(rand() * (i + 1));
        [currentTeams[i], currentTeams[j]] = [currentTeams[j], currentTeams[i]]
      }

      const allRounds = []
      let roundTeams = [...currentTeams]

      ROUNDS.forEach((round) => {
        const matches = []
        const winners = []

        for (let i = 0; i < roundTeams.length; i += 2) {
          const teamA = roundTeams[i]
          const teamB = roundTeams[i + 1]

          const probA = data[round.metric][teamA] || 0
          const probB = data[round.metric][teamB] || 0

          const total = probA + probB || 1
          const winThreshold = probA / total
          const winner = rand() < winThreshold ? teamA : teamB

          matches.push({ teamA, teamB, probA, probB, winner, metricLabel: round.name })
          winners.push(winner)
        }

        allRounds.push({ ...round, matches })
        roundTeams = winners
      })

      return allRounds
    }

    return buildBracket()
  }, [data])

  useEffect(() => {
    if (skipReveal && fullSimulation) {
      setCompletedMatches(fullSimulation.flatMap(r => r.matches))
      setIsFinishing(true)
      setTimeout(() => {
        const id = saveSimulation(data)
        navigate(`/results?id=${id}`, { replace: true })
      }, 3000)
    }
  }, [skipReveal, fullSimulation, data, navigate])

  useEffect(() => {
    if (fullSimulation && !skipReveal) {
      const interval = setInterval(() => {
        setCompletedMatches(prev => {
          if (prev.length < fullSimulation.flatMap(r => r.matches).length) {
            const nextMatch = fullSimulation.flatMap(r => r.matches)[prev.length]
            return [...prev, nextMatch]
          }
          clearInterval(interval)
          setIsFinishing(true)
          setTimeout(() => {
            const id = saveSimulation(data)
            navigate(`/results?id=${id}`, { replace: true })
          }, 4000)
          return prev
        })
      }, 1500)
      return () => clearInterval(interval)
    }
  }, [fullSimulation, navigate, data, skipReveal])

  if (loading) return <LoadingOracle />
  if (error) return <div className="text-red-500 p-10">Error loading simulation.</div>

  const lastMatch = completedMatches[completedMatches.length - 1]
  const champion = isFinishing ? lastMatch?.winner : null

  return (
    <div className="min-h-screen bg-[#000000] text-white pt-24 p-4 md:p-8 relative overflow-hidden">
      {/* Dynamic Stadium Background */}
      <div className="fixed inset-0 stadium-atmosphere opacity-30 grayscale pointer-events-none" />
      
      <div className="max-w-4xl mx-auto relative z-10">
        <header className="flex justify-between items-end mb-12">
          <div>
            <h1 className="text-4xl md:text-6xl font-display text-glow mb-2 italic uppercase">The Prophecy</h1>
            <p className="font-body text-text-muted tracking-widest uppercase text-xs">Simulating 10,000 parallel realities...</p>
          </div>
          {!isFinishing && (
            <button 
              onClick={() => setSkipReveal(true)}
              className="px-4 py-2 rounded-full border border-white/40 text-xs font-display text-white hover:bg-white/10 transition-colors"
            >
              SKIP RITUAL
            </button>
          )}
        </header>

        {/* Live Feed */}
        <div className="space-y-6">
          <AnimatePresence mode="popLayout">
            {completedMatches.slice().reverse().map((match, i) => (
              <MatchCard 
                key={`${match.teamA}-${match.teamB}-${i}`} 
                match={match} 
                isVisible={true}
                isRecent={i === 0}
              />
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Finale Takeover */}
      <AnimatePresence>
        {isFinishing && champion && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 bg-[#000000]/90 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-center"
          >
            <motion.div
              initial={{ scale: 0.5, y: 50, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              transition={{ type: "spring", damping: 15 }}
            >
              <div className="text-white font-body tracking-[0.5em] mb-4 uppercase">New World Order</div>
              <h2 className="text-6xl md:text-9xl font-display text-white text-glow mb-8 italic uppercase">{champion}</h2>
              <div className="w-24 h-24 mx-auto mb-12 relative">
                <div className="absolute inset-0 bg-white rounded-full opacity-20 animate-ping" />
                <div className="relative z-10 w-full h-full bg-white rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(255,255,255,0.4)]">
                   <svg viewBox="0 0 24 24" className="w-12 h-12 text-[#000000]" fill="currentColor">
                     <path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v3c0 2.55 1.92 4.63 4.39 4.94A5.01 5.01 0 0 0 11 15.9V19H7v2h10v-2h-4v-3.1a5.01 5.01 0 0 0 3.61-1.96C19.08 11.63 21 9.55 21 7V5c0-1.1-.9-2-2-2zM5 7h2v3c0 1.25-.79 2.32-1.9 2.73C4.44 11.97 4 11.04 4 10V7c0-.55.45-1 1-1zm14 3c0 1.04-.44 1.97-1.1 2.73-1.11-.41-1.9-1.48-1.9-2.73V7h2c.55 0 1 .45 1 1v2z"/>
                   </svg>
                </div>
              </div>
              <p className="text-text-muted font-body animate-pulse">Finalizing tournament data...</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
