import { useRef, useState, useEffect } from 'react'
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { TOP_8_TEAMS } from '../data/teamProfiles'
import { TiltCard } from './TiltCard'

/**
 * StatBox — a single glassy tile showing one stat
 */
function StatBox({ label, value }) {
  return (
    <div className="p-3 md:p-4 rounded-xl bg-white/5 border border-white/5 hover:border-white/30 transition-colors duration-300">
      <p className="font-body text-[10px] text-text-muted uppercase tracking-widest mb-1">{label}</p>
      <p className="font-display text-base md:text-lg text-white leading-tight">{value}</p>
    </div>
  )
}

/**
 * FormBadge — coloured W/D/L pills
 */
function FormBadge({ form }) {
  const results = form.split('-')
  const colours = { W: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', D: 'bg-amber-500/20 text-amber-400 border-amber-500/30', L: 'bg-red-500/20 text-red-400 border-red-500/30' }
  return (
    <div className="flex gap-1 flex-wrap">
      {results.map((r, i) => (
        <span key={i} className={`text-[10px] font-display px-2 py-0.5 rounded border ${colours[r] || 'bg-white/5 text-white border-white/10'}`}>{r}</span>
      ))}
    </div>
  )
}

/**
 * TeamSection — one full-viewport section per team.
 * 
 * Scroll mechanics:
 *  - We track this section's scroll progress from "start entering viewport" to "end leaving viewport".
 *  - maskX: The mask sweep goes from right→left so the background image reveals itself as user scrolls in.
 *  - textOpacity/textY: Stats panel fades + slides up in the middle of the scroll range.
 */
function TeamSection({ team, index }) {
  const ref = useRef(null)
  const [imgError, setImgError] = useState(false)

  const { scrollYProgress } = useScroll({
    target: ref,
    // "start end" = when section top hits viewport bottom
    // "end start" = when section bottom hits viewport top
    offset: ['start end', 'end start']
  })

  // Spring-smooth the raw scroll progress for buttery animations
  const smooth = useSpring(scrollYProgress, { stiffness: 60, damping: 22 })

  // The mask clips from right→center. At 0% scroll it's fully hidden (mask starts at 100%).
  // At 55% scroll it's fully revealed (0%). Stays revealed after that.
  const maskX = useTransform(smooth, [0, 0.55], ['100%', '0%'])

  // Stats panel: invisible below → slides in at midpoint
  const textOpacity = useTransform(smooth, [0.25, 0.5], [0, 1])
  const textY = useTransform(smooth, [0.25, 0.5], [50, 0])

  // Subtle parallax on the background image
  const bgY = useTransform(smooth, [0, 1], ['-8%', '8%'])

  const isEven = index % 2 === 0

  return (
    <section
      ref={ref}
      className="relative h-screen w-full flex items-center overflow-hidden"
      id={`team-${team.id}`}
    >
      {/* ── Background image (left side, masked) ── */}
      <motion.div
        className="absolute inset-0 z-0"
        style={{ y: bgY }}
      >
        {/* Fallback gradient always behind — shown if image fails */}
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(135deg, ${team.color}55 0%, ${team.color}11 60%, transparent 100%)`
          }}
        />

        {/* Actual image, masked with a right-to-left CSS clip */}
        {!imgError && (
          <motion.div
            className="absolute inset-0"
            style={{
              // clipPath mask sweeps left as user scrolls in
              // We can't directly bind `maskX` to a CSS variable inside style prop for mask-image,
              // so we use clipPath which Framer Motion handles natively on the DOM element.
              clipPath: maskX.get !== undefined
                ? undefined // handled below via motionValue subscriber
                : undefined
            }}
          >
            <img
              src={team.imageUrl}
              alt={team.name}
              onError={() => setImgError(true)}
              className="w-full h-full object-cover object-center opacity-50"
              style={{ filter: 'saturate(0.7) brightness(0.7)' }}
            />
            {/* Left→right dark vignette so text stays legible */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#000000]/10 via-[#000000]/40 to-[#000000]/90" />
          </motion.div>
        )}
      </motion.div>

      {/* ── Scroll-linked mask overlay (clip the image reveal) ── */}
      {/* We use a solid overlay that shrinks from right to reveal the image beneath */}
      <motion.div
        className="absolute inset-0 z-[1] bg-[#000000] origin-right"
        style={{ scaleX: maskX.get !== undefined ? maskX : 1 }}
        // scaleX from 1→0 (fully covering → fully revealing)
      >
        {/* Dark shade while mask is covering */}
        <div className="w-full h-full bg-[#000000]" />
      </motion.div>

      {/* ── Stats panel ── */}
      <motion.div
        style={{ opacity: textOpacity, y: textY }}
        className={`relative z-10 w-full max-w-xl px-4 ${isEven ? 'ml-auto pr-4 md:pr-16' : 'mr-auto pl-4 md:pl-16'}`}
      >
        <TiltCard 
          tiltLimit={12} 
          scale={1.03} 
          effect="gravitate" 
          spotlight={true} 
          className="backdrop-blur-2xl bg-white/5 border border-white/20 rounded-3xl p-6 md:p-10 shadow-[0_8px_32px_rgba(0,0,0,0.37)]"
        >

          {/* Rank + Country code row */}
          <div className="flex items-center gap-3 mb-3">
            <span className="font-display text-3xl text-white leading-none">#{index + 1}</span>
            <div className="h-px flex-1 bg-gradient-to-r from-white/40 to-transparent" />
            <span className="font-body text-xs text-text-muted tracking-[0.3em] uppercase">{team.shortName}</span>
          </div>

          {/* Team name */}
          <h2 className="font-display text-4xl md:text-6xl text-white italic uppercase mb-1 leading-none" style={{ textShadow: '0 0 30px rgba(255,255,255,0.15)' }}>
            {team.name}
          </h2>

          {/* Coach */}
          <p className="font-body text-xs text-text-muted uppercase tracking-widest mb-4">
            Coach: {team.coach}
          </p>

          {/* Narrative */}
          <p className="font-body text-sm md:text-base text-white/70 leading-relaxed mb-6">
            {team.narrative}
          </p>

          {/* Stats grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3 mb-4">
            <StatBox label="WC Titles" value={team.worldCupWins} />
            <StatBox label="Best Finish" value={team.bestFinish} />
            <StatBox label="Appearances" value={team.totalAppearances} />
            <StatBox label="FIFA Rank" value={`#${team.fifaRanking}`} />
            <StatBox label="Key Player" value={team.keyPlayer} />
            <div className="p-3 md:p-4 rounded-xl bg-white/5 border border-white/5">
              <p className="font-body text-[10px] text-text-muted uppercase tracking-widest mb-2">Recent Form</p>
              <FormBadge form={team.form} />
            </div>
          </div>
        </TiltCard>
      </motion.div>

      {/* ── Team initial watermark ── */}
      <div className="absolute bottom-6 left-8 z-[2] pointer-events-none select-none">
        <span
          className="font-display text-[8rem] md:text-[12rem] leading-none opacity-[0.04] text-white"
          aria-hidden
        >
          {team.shortName}
        </span>
      </div>
    </section>
  )
}

/**
 * ProgressRail — fixed right-side indicator showing which team is active.
 */
function ProgressRail({ activeIndex }) {
  return (
    <div className="fixed right-5 top-1/2 -translate-y-1/2 z-50 hidden md:flex flex-col items-center gap-2">
      {TOP_8_TEAMS.map((t, i) => (
        <a
          key={t.id}
          href={`#team-${t.id}`}
          title={t.name}
          className="group flex items-center gap-2"
          onClick={(e) => {
            e.preventDefault()
            document.getElementById(`team-${t.id}`)?.scrollIntoView({ behavior: 'smooth' })
          }}
        >
          <span className={`hidden group-hover:block font-body text-[10px] text-white uppercase tracking-widest transition-all`}>
            {t.shortName}
          </span>
          <motion.div
            animate={{
              width: i === activeIndex ? 24 : 6,
              backgroundColor: i === activeIndex ? '#FFFFFF' : 'rgba(255,255,255,0.2)'
            }}
            transition={{ duration: 0.3 }}
            className="h-1.5 rounded-full"
          />
        </a>
      ))}
    </div>
  )
}

/**
 * TeamJourney — the scroll-driven section with all 8 teams + CTA.
 * Placed after the hero on the Home page.
 */
export default function TeamJourney() {
  const navigate = useNavigate()
  const [activeIndex, setActiveIndex] = useState(0)

  // Track which section is in view for the progress rail
  useEffect(() => {
    const observers = TOP_8_TEAMS.map((team, i) => {
      const el = document.getElementById(`team-${team.id}`)
      if (!el) return null
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveIndex(i) },
        { threshold: 0.5 }
      )
      obs.observe(el)
      return obs
    })
    return () => observers.forEach(o => o?.disconnect())
  }, [])

  return (
    <div className="relative w-full bg-[#000000]">

      {/* Section intro divider */}
      <div className="relative z-10 flex flex-col items-center py-20 px-4 text-center">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="font-body text-[10px] text-white uppercase tracking-[0.4em] mb-4"
        >
          The Contenders
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="font-display text-4xl md:text-6xl text-white italic uppercase"
        >
          Top 8 Teams
        </motion.h2>
        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="w-24 h-px bg-white/50 mt-6 origin-left"
        />
      </div>

      {/* Progress Rail */}
      <ProgressRail activeIndex={activeIndex} />

      {/* 8 team sections */}
      {TOP_8_TEAMS.map((team, i) => (
        <TeamSection key={team.id} team={team} index={i} />
      ))}

      {/* CTA Footer */}
      <div className="relative h-screen flex items-center justify-center bg-[#000000] overflow-hidden">
        {/* Subtle radial glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.05)_0%,transparent_70%)]" />

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="relative z-10 text-center px-6 max-w-2xl"
        >
          <p className="font-body text-xs text-white uppercase tracking-[0.4em] mb-4">The Oracle Awaits</p>
          <h3 className="font-display text-4xl md:text-6xl text-white italic uppercase mb-4 leading-tight">
            Know Their History.<br />
            <span className="text-white" style={{ textShadow: '0 0 40px rgba(255,255,255,0.4)' }}>Predict Their Future.</span>
          </h3>
          <p className="font-body text-text-muted mb-10 leading-relaxed">
            You've seen the legends. Now run 10,000 simulations to uncover who lifts the trophy in 2026.
          </p>
          <motion.button
            onClick={() => navigate('/simulate')}
            whileHover={{ scale: 1.05, boxShadow: '0 0 40px rgba(255,255,255,0.4)' }}
            whileTap={{ scale: 0.95 }}
            className="btn-minimal oracle-cta relative group overflow-hidden inline-flex items-center gap-3"
          >
            <span className="relative z-10">START SIMULATION</span>
            <svg className="w-4 h-4 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
            <motion.div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500" />
          </motion.button>
        </motion.div>
      </div>
    </div>
  )
}
