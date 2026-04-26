import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import useSimulation from '../hooks/useSimulation'
import LoadingOracle from '../components/LoadingOracle'
import { saveSimulation } from '../utils/simStorage'
import { getTeamLogo } from '../data/teamLogos'
import { Trophy, Zap, ChevronRight } from 'lucide-react'

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
  { id: 'r32', name: 'Round of 32', metric: 'reach_qf', color: 'from-slate-500/20', accent: '#64748b' },
  { id: 'r16', name: 'Round of 16', metric: 'reach_qf', color: 'from-blue-500/20', accent: '#3b82f6' },
  { id: 'qf', name: 'Quarter-Finals', metric: 'reach_sf', color: 'from-purple-500/20', accent: '#a855f7' },
  { id: 'sf', name: 'Semi-Finals', metric: 'reach_final', color: 'from-amber-500/20', accent: '#f59e0b' },
  { id: 'f', name: 'Grand Final', metric: 'win_tournament', color: 'from-yellow-500/20', accent: '#eab308' },
]

// Speed tiers per round (ms per card)
const ROUND_SPEEDS = { r32: 180, r16: 280, qf: 400, sf: 600, f: 1200 }

function FlagAvatar({ name, size = 'w-10 h-10' }) {
  const [err, setErr] = useState(false)
  const url = getTeamLogo(name)
  const short = name?.substring(0, 3).toUpperCase()

  if (!url || err) {
    return (
      <div className={`${size} rounded-full bg-white/10 border border-white/20 flex items-center justify-center flex-shrink-0`}>
        <span className="text-white font-display font-bold text-[10px]">{short}</span>
      </div>
    )
  }
  return (
    <div className={`${size} rounded-full overflow-hidden border border-white/20 shadow-md flex-shrink-0 bg-black`}>
      <img src={url} alt={name} className="w-full h-full object-cover" onError={() => setErr(true)} />
    </div>
  )
}

function MatchCard({ match, accent }) {
  const isWinnerA = match.winner === match.teamA
  const isWinnerB = match.winner === match.teamB
  const totalProb = (match.probA + match.probB) || 1
  const pctA = ((match.probA / totalProb) * 100).toFixed(0)
  const pctB = ((match.probB / totalProb) * 100).toFixed(0)

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      className="relative p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/8 transition-colors overflow-hidden"
    >
      {/* subtle accent glow top edge */}
      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(to right, transparent, ${accent}60, transparent)` }} />

      <div className="flex items-center gap-3">
        {/* Team A */}
        <div className={`flex items-center gap-2 flex-1 min-w-0 transition-all duration-500 ${!isWinnerA ? 'opacity-35 grayscale' : ''}`}>
          <FlagAvatar name={match.teamA} size="w-9 h-9" />
          <span className="font-display text-sm md:text-base text-white truncate leading-tight">{match.teamA}</span>
          {isWinnerA && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3, type: 'spring' }}
              className="ml-auto flex-shrink-0 w-5 h-5 rounded-full bg-white flex items-center justify-center">
              <ChevronRight className="w-3 h-3 text-black" />
            </motion.div>
          )}
        </div>

        {/* Centre probs */}
        <div className="flex flex-col items-center gap-1 flex-shrink-0 w-24">
          <div className="flex items-center gap-1 w-full">
            <div className="h-1.5 rounded-full flex-1 overflow-hidden bg-black/40">
              <motion.div initial={{ width: 0 }} animate={{ width: `${pctA}%` }} transition={{ duration: 0.8, ease: 'easeOut' }}
                className="h-full rounded-full bg-white/60" />
            </div>
            <span className="text-[10px] text-white/60 font-body w-7 text-right">{pctA}%</span>
          </div>
          <div className="flex items-center gap-1 w-full flex-row-reverse">
            <div className="h-1.5 rounded-full flex-1 overflow-hidden bg-black/40">
              <motion.div initial={{ width: 0 }} animate={{ width: `${pctB}%` }} transition={{ duration: 0.8, ease: 'easeOut' }}
                className="h-full rounded-full" style={{ background: `${accent}cc` }} />
            </div>
            <span className="text-[10px] text-white/60 font-body w-7 text-left">{pctB}%</span>
          </div>
        </div>

        {/* Team B */}
        <div className={`flex items-center gap-2 flex-1 min-w-0 justify-end transition-all duration-500 ${!isWinnerB ? 'opacity-35 grayscale' : ''}`}>
          {isWinnerB && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3, type: 'spring' }}
              className="mr-auto flex-shrink-0 w-5 h-5 rounded-full bg-white flex items-center justify-center">
              <ChevronRight className="w-3 h-3 text-black rotate-180" />
            </motion.div>
          )}
          <span className="font-display text-sm md:text-base text-white truncate text-right leading-tight">{match.teamB}</span>
          <FlagAvatar name={match.teamB} size="w-9 h-9" />
        </div>
      </div>
    </motion.div>
  )
}

function RoundSection({ round, matches, accent }) {
  if (!matches?.length) return null
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="h-px flex-1 bg-white/10" />
        <span className="font-display text-xs tracking-[0.3em] uppercase px-3 py-1 rounded-full border text-white/70"
          style={{ borderColor: `${accent}50`, background: `${accent}15` }}>
          {round.name}
        </span>
        <div className="h-px flex-1 bg-white/10" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {matches.map((match, i) => (
          <MatchCard key={`${match.teamA}-${match.teamB}-${i}`} match={match} accent={accent} />
        ))}
      </div>
    </motion.div>
  )
}

export default function Simulation() {
  const { data, loading, error, progressMessage } = useSimulation()
  const [revealedByRound, setRevealedByRound] = useState({})
  const [currentRoundIdx, setCurrentRoundIdx] = useState(0)
  const [matchIdxInRound, setMatchIdxInRound] = useState(0)
  const [isFinishing, setIsFinishing] = useState(false)
  const [skipReveal, setSkipReveal] = useState(false)
  const navigate = useNavigate()

  const fullSimulation = useMemo(() => {
    if (!data) return null
    const rand = makePRNG()
    let roundTeams = Object.keys(data.win_tournament).slice(0, 32)
    for (let i = roundTeams.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [roundTeams[i], roundTeams[j]] = [roundTeams[j], roundTeams[i]]
    }
    const allRounds = []
    ROUNDS.forEach((round) => {
      const matches = []
      const winners = []
      for (let i = 0; i < roundTeams.length; i += 2) {
        const teamA = roundTeams[i]
        const teamB = roundTeams[i + 1]
        if (!teamA || !teamB) continue
        const probA = data[round.metric]?.[teamA] || 0
        const probB = data[round.metric]?.[teamB] || 0
        const total = probA + probB || 1
        const winner = rand() < probA / total ? teamA : teamB
        matches.push({ teamA, teamB, probA, probB, winner, metricLabel: round.name })
        winners.push(winner)
      }
      allRounds.push({ ...round, matches })
      roundTeams = winners
    })
    return allRounds
  }, [data])

  // Skip: reveal all at once
  useEffect(() => {
    if (skipReveal && fullSimulation) {
      const byRound = {}
      fullSimulation.forEach(r => { byRound[r.id] = r.matches })
      setRevealedByRound(byRound)
      setIsFinishing(true)
      setTimeout(() => {
        const id = saveSimulation(data)
        navigate(`/results?id=${id}`, { replace: true })
      }, 2500)
    }
  }, [skipReveal, fullSimulation, data, navigate])

  // Auto-reveal round by round, card by card
  useEffect(() => {
    if (!fullSimulation || skipReveal || isFinishing) return
    const round = fullSimulation[currentRoundIdx]
    if (!round) return

    const speed = ROUND_SPEEDS[round.id] || 300
    const timer = setTimeout(() => {
      if (matchIdxInRound < round.matches.length) {
        setRevealedByRound(prev => {
          const existing = prev[round.id] || []
          return { ...prev, [round.id]: [...existing, round.matches[matchIdxInRound]] }
        })
        setMatchIdxInRound(i => i + 1)
      } else {
        // Move to next round
        if (currentRoundIdx + 1 < fullSimulation.length) {
          setCurrentRoundIdx(i => i + 1)
          setMatchIdxInRound(0)
        } else {
          // All done
          setIsFinishing(true)
          setTimeout(() => {
            const id = saveSimulation(data)
            navigate(`/results?id=${id}`, { replace: true })
          }, 2500)
        }
      }
    }, speed)

    return () => clearTimeout(timer)
  }, [fullSimulation, currentRoundIdx, matchIdxInRound, skipReveal, isFinishing, data, navigate])

  if (loading) return <LoadingOracle progressMessage={progressMessage} />
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-400">{error}</div>

  const allRevealed = fullSimulation?.flatMap(r => revealedByRound[r.id] || []) || []
  const champion = isFinishing ? allRevealed[allRevealed.length - 1]?.winner : null

  // Progress
  const totalMatches = fullSimulation?.reduce((s, r) => s + r.matches.length, 0) || 63
  const revealedCount = allRevealed.length
  const progress = Math.round((revealedCount / totalMatches) * 100)

  return (
    <div className="min-h-screen bg-[#000000] text-white pt-24 pb-32 relative overflow-hidden">
      <div className="fixed inset-0 stadium-atmosphere opacity-20 grayscale pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 relative z-10">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <p className="font-body text-white/50 tracking-[0.5em] uppercase text-xs mb-2">WC Oracle · 10,000 Simulations</p>
            <h1 className="text-5xl md:text-7xl font-display uppercase italic text-white leading-none"
              style={{ textShadow: '0 0 60px rgba(255,255,255,0.15)' }}>
              The Prophecy
            </h1>
          </div>
          <div className="flex items-center gap-4">
            {!isFinishing && (
              <button
                onClick={() => setSkipReveal(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-white/30 text-xs font-display text-white hover:bg-white/10 transition-colors"
              >
                <Zap className="w-3.5 h-3.5" />
                SKIP TO RESULTS
              </button>
            )}
          </div>
        </header>

        {/* Progress bar */}
        {!isFinishing && (
          <div className="mb-10">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[11px] text-white/40 font-body tracking-widest uppercase">Simulating Bracket</span>
              <span className="text-[11px] text-white/60 font-body">{revealedCount} / {totalMatches} matches</span>
            </div>
            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-white/40 to-white"
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            {fullSimulation && currentRoundIdx < fullSimulation.length && (
              <p className="text-[11px] text-white/40 font-body mt-2">
                Now revealing: <span className="text-white/70">{ROUNDS[currentRoundIdx]?.name}</span>
              </p>
            )}
          </div>
        )}

        {/* Rounds (newest first, collapsed older ones) */}
        <div className="space-y-2">
          {fullSimulation && [...ROUNDS].map((round, idx) => {
            const matches = revealedByRound[round.id]
            if (!matches?.length) return null
            return (
              <RoundSection
                key={round.id}
                round={round}
                matches={matches}
                accent={round.accent}
              />
            )
          })}
        </div>
      </div>

      {/* Champion Overlay */}
      <AnimatePresence>
        {isFinishing && champion && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-2xl flex flex-col items-center justify-center p-6 text-center"
          >
            <motion.div
              initial={{ scale: 0.6, y: 60, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              transition={{ type: 'spring', damping: 14, stiffness: 80 }}
              className="flex flex-col items-center"
            >
              <motion.div
                animate={{ rotate: [0, 180, 360] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
                className="mb-8 p-5 rounded-3xl bg-white/10 border border-white/20 backdrop-blur-md"
              >
                <Trophy className="w-14 h-14 text-yellow-400" />
              </motion.div>
              <p className="font-body text-white/60 tracking-[0.6em] uppercase text-sm mb-4 flex items-center gap-4">
                <span className="w-12 h-px bg-white/20" />New World Order<span className="w-12 h-px bg-white/20" />
              </p>
              <h2 className="font-display text-[clamp(4rem,16vw,11rem)] leading-none text-white italic uppercase"
                style={{ textShadow: '0 0 80px rgba(255,255,255,0.2)' }}>
                {champion}
              </h2>
              <p className="text-white/40 font-body text-sm mt-8 animate-pulse tracking-widest">
                Loading full results...
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
