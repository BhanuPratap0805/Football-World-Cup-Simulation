import { motion } from 'framer-motion'
import { Activity, BarChart3, TrendingUp, Trophy } from 'lucide-react'

export default function DashboardMockup() {
  return (
    <div className="w-full aspect-video bg-black/80 rounded-xl border border-white/10 p-4 md:p-6 shadow-2xl backdrop-blur-xl flex flex-col gap-4 overflow-hidden relative font-body text-white">
      {/* Background glow effects inside the dashboard */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] pointer-events-none" />

      {/* Top Row */}
      <div className="flex gap-4 h-1/2">
        {/* Groups Panel */}
        <div className="w-1/2 bg-white/5 border border-white/10 rounded-lg p-4 flex flex-col relative z-10">
          <div className="flex justify-between items-center mb-4">
            <span className="text-xs font-display text-white/50 tracking-widest uppercase">Group Standings</span>
            <Trophy className="w-3 h-3 text-white/30" />
          </div>
          <div className="flex gap-2 md:gap-4 h-full min-h-0">
            <div className="flex-1 flex flex-col gap-1 min-w-0">
              <span className="text-[10px] text-white/40 mb-1 shrink-0">GROUP A</span>
              <TeamRow flag="🇲🇽" name="MEXICO" pts="9pt" />
              <TeamRow flag="🇰🇷" name="S. KOREA" pts="6pt" />
              <TeamRow flag="🇿🇦" name="S. AFRICA" pts="3pt" />
              <TeamRow flag="🇨🇿" name="CZECHIA" pts="0pt" />
            </div>
            <div className="flex-1 flex flex-col gap-1 min-w-0">
              <span className="text-[10px] text-white/40 mb-1 shrink-0">GROUP B</span>
              <TeamRow flag="🇨🇦" name="CANADA" pts="7pt" />
              <TeamRow flag="🇨🇭" name="SWITZERLAND" pts="6pt" />
              <TeamRow flag="🇶🇦" name="QATAR" pts="2pt" />
              <TeamRow flag="🇧🇦" name="BOSNIA" pts="1pt" />
            </div>
          </div>
        </div>

        {/* Top 5 Elo Panel */}
        <div className="w-1/2 bg-white/5 border border-white/10 rounded-lg p-4 flex flex-col relative z-10">
          <div className="flex justify-between items-center mb-4">
            <span className="text-xs font-display text-white/50 tracking-widest uppercase">Top 5 Elo Ratings</span>
            <span className="text-[10px] text-white/30">ELO</span>
          </div>
          <div className="flex flex-col gap-2.5 flex-1 justify-center">
            <EloRow rank="1" flag="🇫🇷" name="France" elo="2104" trend="up" />
            <EloRow rank="2" flag="🇧🇷" name="Brazil" elo="2088" trend="down" />
            <EloRow rank="3" flag="🇩🇪" name="Germany" elo="2012" trend="up" />
            <EloRow rank="4" flag="🇪🇸" name="Spain" elo="1998" trend="up" />
            <EloRow rank="5" flag="🇦🇷" name="Argentina" elo="1985" trend="down" />
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="flex gap-4 h-1/2">
        {/* Statistics Bar Chart */}
        <div className="w-1/2 bg-white/5 border border-white/10 rounded-lg p-4 flex flex-col relative z-10">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-3 h-3 text-[#A855F7]" />
              <span className="text-xs font-display text-white/90 tracking-widest uppercase">Match Statistics</span>
            </div>
            <span className="text-[10px] text-white/30">AVG</span>
          </div>
          <div className="flex justify-around items-end h-full pb-2">
            <BarGroup label="Goals" v1={80} v2={40} v3={50} />
            <BarGroup label="Possession" v1={60} v2={50} v3={45} />
            <BarGroup label="Shots" v1={70} v2={55} v3={50} />
          </div>
        </div>

        {/* ML Prediction Area Chart */}
        <div className="w-1/2 bg-white/5 border border-white/10 rounded-lg p-4 flex flex-col relative z-10">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2">
              <Activity className="w-3 h-3 text-[#A855F7]" />
              <span className="text-xs font-display text-white/90 tracking-widest uppercase">ML Prediction Accuracy</span>
            </div>
            <span className="text-xs text-[#A855F7] font-bold">91.8%</span>
          </div>
          <div className="flex justify-end gap-3 mb-2">
            <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-[#A855F7] shadow-[0_0_5px_#A855F7]" /><span className="text-[9px] text-white/50">Predicted</span></div>
            <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-[#6366F1] shadow-[0_0_5px_#6366F1]" /><span className="text-[9px] text-white/50">Actual</span></div>
          </div>
          <div className="flex-1 relative w-full h-full border-b border-l border-white/10">
            {/* Y Axis labels */}
            <div className="absolute -left-6 top-0 bottom-0 flex flex-col justify-between text-[8px] text-white/30 py-1">
              <span>100%</span>
              <span>80%</span>
              <span>60%</span>
              <span>40%</span>
            </div>
            {/* X Axis grid lines */}
            <div className="absolute inset-0 flex justify-between">
              {[...Array(6)].map((_, i) => <div key={i} className="w-[1px] h-full bg-white/5" />)}
            </div>
            {/* SVG Area Chart */}
            <svg viewBox="0 0 100 50" preserveAspectRatio="none" className="absolute inset-0 w-full h-full overflow-visible">
              <defs>
                <linearGradient id="gradient1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#A855F7" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#A855F7" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="gradient2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366F1" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#6366F1" stopOpacity="0" />
                </linearGradient>
              </defs>
              
              {/* Actual Line (Blue) */}
              <motion.path 
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
                d="M 0,40 L 20,35 L 40,45 L 60,15 L 80,30 L 100,10" 
                fill="none" 
                stroke="#6366F1" 
                strokeWidth="1.5" 
              />
              <path d="M 0,40 L 20,35 L 40,45 L 60,15 L 80,30 L 100,10 L 100,50 L 0,50 Z" fill="url(#gradient2)" />

              {/* Predicted Line (Purple) */}
              <motion.path 
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                d="M 0,45 L 20,25 L 40,40 L 60,10 L 80,25 L 100,20" 
                fill="none" 
                stroke="#A855F7" 
                strokeWidth="1.5" 
                className="drop-shadow-[0_0_3px_rgba(168,85,247,0.8)]"
              />
              <path d="M 0,45 L 20,25 L 40,40 L 60,10 L 80,25 L 100,20 L 100,50 L 0,50 Z" fill="url(#gradient1)" />
              
              {/* Data points */}
              {[
                {x: 0, y: 45}, {x: 20, y: 25}, {x: 40, y: 40}, 
                {x: 60, y: 10}, {x: 80, y: 25}, {x: 100, y: 20}
              ].map((point, i) => (
                <motion.circle 
                  key={i}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 1 + (i * 0.1) }}
                  cx={point.x} cy={point.y} r="2" fill="white" 
                  className="drop-shadow-[0_0_4px_#A855F7]"
                />
              ))}
            </svg>
          </div>
        </div>
      </div>
    </div>
  )
}

function TeamRow({ flag, name, pts }) {
  return (
    <div className="flex items-center justify-between text-xs bg-white/5 rounded px-2 py-1 md:py-1.5 border border-white/5 min-w-0">
      <div className="flex items-center gap-1.5 md:gap-2 min-w-0 flex-1">
        <span className="text-sm shrink-0">{flag}</span>
        <span className="font-display tracking-wider text-white/90 truncate">{name}</span>
      </div>
      <span className="text-white/50 shrink-0 ml-2">{pts}</span>
    </div>
  )
}

function EloRow({ rank, flag, name, elo, trend }) {
  return (
    <div className="flex items-center justify-between text-xs px-2 py-1 min-w-0">
      <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
        <span className="text-white/40 w-3 shrink-0">{rank}.</span>
        <span className="text-sm shrink-0">{flag}</span>
        <span className="font-display tracking-wider text-white/90 truncate">{name}</span>
      </div>
      <div className="flex items-center gap-2 md:gap-3 shrink-0 ml-2">
        <span className="text-white/80 font-mono">{elo}</span>
        {trend === 'up' ? (
          <TrendingUp className="w-3 h-3 text-green-400 shrink-0" />
        ) : (
          <TrendingUp className="w-3 h-3 text-red-400 rotate-180 shrink-0" />
        )}
      </div>
    </div>
  )
}

function BarGroup({ label, v1, v2, v3 }) {
  return (
    <div className="flex flex-col items-center gap-2 h-full justify-end w-12">
      <div className="flex items-end gap-1 h-full w-full justify-center">
        <motion.div 
          initial={{ height: 0 }} animate={{ height: `${v1}%` }} transition={{ duration: 1, ease: "easeOut" }}
          className="w-2.5 bg-[#A855F7] rounded-t-sm shadow-[0_0_8px_rgba(168,85,247,0.5)]" 
        />
        <motion.div 
          initial={{ height: 0 }} animate={{ height: `${v2}%` }} transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
          className="w-2.5 bg-white/40 rounded-t-sm" 
        />
        <motion.div 
          initial={{ height: 0 }} animate={{ height: `${v3}%` }} transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
          className="w-2.5 bg-white/20 rounded-t-sm" 
        />
      </div>
      <span className="text-[9px] text-white/50 uppercase">{label}</span>
    </div>
  )
}
