import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Database, Code, GitCommit } from 'lucide-react'
import DashboardMockup from '../components/DashboardMockup'

const WC2026_GROUPS = {
  A: ['Mexico', 'South Korea', 'South Africa', 'Czechia'],
  B: ['Canada', 'Switzerland', 'Qatar', 'Bosnia & Herzegovina'],
  C: ['Brazil', 'Morocco', 'Scotland', 'Haiti'],
  D: ['United States', 'Australia', 'Paraguay', 'Türkiye'],
  E: ['Germany', 'Ecuador', 'Ivory Coast', 'Curaçao'],
  F: ['Netherlands', 'Japan', 'Tunisia', 'Sweden'],
  G: ['Belgium', 'Iran', 'Egypt', 'New Zealand'],
  H: ['Spain', 'Uruguay', 'Saudi Arabia', 'Cape Verde'],
  I: ['France', 'Senegal', 'Norway', 'Iraq'],
  J: ['Argentina', 'Austria', 'Algeria', 'Jordan'],
  K: ['Portugal', 'Colombia', 'Uzbekistan', 'Congo DR'],
  L: ['England', 'Croatia', 'Panama', 'Ghana'],
}

const DATA_SOURCES = [
  { name: 'International Match Results', desc: '1990–2024 competitive fixtures', rows: '~16,000', source: 'Kaggle / RSSSF' },
  { name: 'FIFA Rankings', desc: 'Monthly snapshots from 2006 to 2024', rows: '~5,200', source: 'Kaggle / FIFA.com' },
  { name: 'Elo Ratings', desc: 'Club Elo computed from historical results', rows: '~210 teams', source: 'Computed' },
  { name: 'WC 2026 Groups', desc: 'Official group draw seedings', rows: '48 teams', source: 'FIFA Official' },
]

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5, delay, ease: 'easeOut' }
})

export default function Data() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-[#000000] text-white relative overflow-x-hidden">
      <div className="fixed inset-0 stadium-atmosphere opacity-25 grayscale pointer-events-none" />

      {/* NEW HERO SECTION */}
      <section className="relative mx-auto w-full px-4 lg:px-12 2xl:px-24 pt-32 pb-20 md:pt-40 md:pb-24 lg:pt-48 lg:pb-32">
        {/* Shades */}
        <div aria-hidden="true" className="absolute inset-0 size-full overflow-hidden pointer-events-none">
          <div className="absolute inset-0 isolate -z-10 bg-[radial-gradient(20%_80%_at_20%_0%,rgba(255,255,255,0.05),transparent)]" />
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-8 px-6 md:px-12">
          
          {/* Left Text Content */}
          <div className="flex max-w-2xl flex-col gap-6 lg:w-1/2">
            <motion.a
              {...fadeUp(0)}
              className="group flex w-fit items-center gap-3 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm p-1 shadow-xs transition-all hover:bg-white/10"
              href="#data-sources"
            >
              <div className="rounded-full border border-white/20 bg-white/10 px-2 py-0.5 shadow-sm">
                <p className="font-mono text-[10px] uppercase tracking-widest text-[#A855F7]">LIVE</p>
              </div>
              <span className="text-xs font-body tracking-wider text-white/80">Data Pipeline Active</span>
              <span className="block h-4 border-l border-white/20" />
              <div className="pr-2">
                <ArrowRight className="h-3 w-3 text-white/60 transition-transform group-hover:translate-x-1" />
              </div>
            </motion.a>

            <motion.h1
              {...fadeUp(0.1)}
              className="font-display text-5xl leading-tight text-white md:text-6xl lg:text-7xl xl:text-[5.5rem] uppercase tracking-wider"
            >
              Powered by <span className="text-[#A855F7] text-glow">35+ Years</span> of Football History
            </motion.h1>

            <motion.p
              {...fadeUp(0.2)}
              className="font-body text-base tracking-wide text-white/60 sm:text-lg md:text-xl lg:text-2xl max-w-2xl leading-relaxed"
            >
              The Oracle aggregates and processes thousands of historical matches, FIFA rankings, and Elo ratings to train our simulation engine and build the ultimate predictive model.
            </motion.p>

            <motion.div {...fadeUp(0.3)} className="flex flex-wrap items-center gap-4 pt-4">
              <button
                onClick={() => document.getElementById('data-sources').scrollIntoView({ behavior: 'smooth' })}
                className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 py-2.5 font-body text-sm font-medium text-white transition-all hover:bg-white/10"
              >
                <Database className="h-4 w-4 text-[#A855F7]" />
                View Raw Sources
              </button>
              <button
                onClick={() => navigate('/methodology')}
                className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-2.5 font-body text-sm font-bold text-black transition-all hover:bg-white/90"
              >
                Methodology
                <ArrowRight className="h-4 w-4" />
              </button>
            </motion.div>
          </div>

          {/* Right Dashboard Visual */}
          <motion.div {...fadeUp(0.4)} className="relative w-full lg:w-1/2">
            <div className="absolute -inset-x-20 inset-y-0 -translate-y-1/4 scale-125 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(168,85,247,0.15),transparent,transparent)] blur-[60px]" />
            <div className="relative mx-auto w-full max-w-5xl xl:max-w-[100%] shadow-2xl">
              <DashboardMockup />
            </div>
          </motion.div>

        </div>
      </section>

      {/* REST OF DATA PAGE */}
      <div id="data-sources" className="relative z-10 px-4 lg:px-12 2xl:px-24 pb-24 w-full mx-auto pt-10">
        
        {/* Stats Row */}
        <motion.div {...fadeUp(0.1)} className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          {[
            { value: '48', label: 'Teams' },
            { value: '12', label: 'Groups' },
            { value: '10K', label: 'Simulations' },
            { value: '57.5%', label: 'Model Accuracy' },
          ].map((stat) => (
            <div key={stat.label} className="p-5 rounded-2xl bg-white/5 border border-white/10 text-center backdrop-blur-sm">
              <div className="font-display text-4xl text-white mb-1">{stat.value}</div>
              <div className="font-body text-[10px] text-[#A855F7] uppercase tracking-widest">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Data Sources */}
        <motion.div {...fadeUp(0.15)} className="mb-20">
          <h2 className="font-display text-2xl text-white uppercase tracking-wider mb-6 flex items-center gap-3">
            <Database className="w-6 h-6 text-[#A855F7]" />
            Raw Data Sources
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {DATA_SOURCES.map((src) => (
              <div key={src.name} className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-white/30 transition-all backdrop-blur-sm group">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-display text-lg text-white group-hover:text-[#E1E0CC] transition-colors">{src.name}</h3>
                  <span className="text-[10px] font-body text-[#A855F7] px-3 py-1 rounded-full border border-[#A855F7]/30 bg-[#A855F7]/10 shrink-0">{src.rows}</span>
                </div>
                <p className="font-body text-sm text-white/60 mb-2">{src.desc}</p>
                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/10">
                  <GitCommit className="w-3 h-3 text-white/30" />
                  <p className="font-body text-[10px] text-white/40 uppercase tracking-widest">{src.source}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Group Grid */}
        <motion.div {...fadeUp(0.2)} className="mb-12">
          <h2 className="font-display text-2xl text-white uppercase tracking-wider mb-6 flex items-center gap-3">
            <Code className="w-6 h-6 text-[#A855F7]" />
            WC 2026 Groups
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Object.entries(WC2026_GROUPS).map(([group, teams], i) => (
              <motion.div
                key={group}
                {...fadeUp(i * 0.04)}
                className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all backdrop-blur-sm"
              >
                <div className="font-display text-2xl text-white mb-4 border-b border-white/10 pb-3">Group {group}</div>
                <div className="flex flex-col gap-2">
                  {teams.map((team) => (
                    <div key={team} className="flex items-center gap-2 py-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#A855F7] shrink-0" />
                      <span className="font-body text-xs text-white/80">{team}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div {...fadeUp(0.4)} className="text-center pt-12">
          <button
            onClick={() => navigate('/simulate')}
            className="btn-minimal oracle-cta relative group overflow-hidden"
          >
            <span className="relative z-10">SEE THE PREDICTIONS</span>
            <motion.div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500" />
          </button>
        </motion.div>
      </div>
    </div>
  )
}
