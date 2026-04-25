// src/components/TeamShowcase.jsx
import { motion } from 'framer-motion'
import { TOP_8_TEAMS } from '../data/teamProfiles'
import { getTeamLogo } from '../data/teamLogos'
import { TiltCard } from './TiltCard'

export default function TeamShowcase() {
    return (
        <section className="relative py-32 px-4 bg-[#000000] overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/5 blur-[150px] rounded-full pointer-events-none" />

            <div className="max-w-7xl mx-auto relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-20"
                >
                    <p className="font-body text-white tracking-[0.5em] text-sm mb-4 uppercase">The Elite Eight</p>
                    <h2 className="font-display text-5xl md:text-7xl text-white text-glow mb-4">Top Contenders</h2>
                    <p className="font-body text-text-muted text-lg max-w-2xl mx-auto">
                        Based on 10,000 tournament simulations, these teams have the highest probability of lifting the trophy
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {TOP_8_TEAMS.map((team, index) => (
                        <TeamCard key={team.id} team={team} index={index} />
                    ))}
                </div>
            </div>
        </section>
    )
}

function TeamCard({ team, index }) {
    const formArray = team.form ? team.form.split('-') : [];

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="flex h-full"
        >
            <TiltCard 
                className="w-full rounded-2xl bg-[#080808] border border-white/5 p-6 flex flex-col shadow-2xl"
                tiltLimit={8}
                scale={1.03}
                spotlight={true}
            >
                {/* Top Header */}
                <div className="flex items-center justify-between mb-4 opacity-70">
                    <span className="font-display text-xl text-white">#{index + 1}</span>
                    <div className="h-[1px] flex-grow bg-white/20 mx-4" />
                    <span className="font-body text-xs tracking-widest text-white uppercase">{team.shortName}</span>
                </div>

                {/* Fallback Image Implementation */}
                <div className="mb-4 relative w-16 h-16 rounded-full overflow-hidden border border-white/20 bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center">
                    <img 
                        src={`/images/teams/${team.name.toLowerCase().replace(/ /g, '-')}.jpg`}
                        alt={team.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                        }}
                    />
                    <div className="absolute inset-0 hidden items-center justify-center bg-gradient-to-br from-purple-500/20 to-blue-500/20">
                        <span className="font-display font-bold text-white/50 text-xl">{team.shortName}</span>
                    </div>
                </div>

                {/* Title */}
                <h3 className="font-display text-4xl sm:text-5xl text-white italic font-bold mb-1 uppercase tracking-tight" style={{textShadow: "0 2px 10px rgba(0,0,0,0.5)"}}>
                    {team.name}
                </h3>
                
                {/* Subtitle / Coach */}
                <p className="font-body text-[10px] text-white/50 uppercase tracking-widest mb-5 font-semibold">
                    COACH: {team.coach}
                </p>

                {/* Narrative */}
                <p className="font-body text-[13px] text-white/80 leading-relaxed mb-6">
                    {team.narrative}
                </p>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-2 mt-auto">
                    {/* WC Titles */}
                    <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex flex-col shadow-inner">
                        <span className="font-body text-[9px] text-white/40 uppercase tracking-wider mb-2 font-bold">WC Titles</span>
                        <span className="font-display text-2xl text-white mt-auto">{team.worldCupWins}</span>
                    </div>

                    {/* Best Finish */}
                    <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex flex-col shadow-inner">
                        <span className="font-body text-[9px] text-white/40 uppercase tracking-wider mb-2 font-bold">Best Finish</span>
                        <span className="font-body text-xs text-white leading-tight font-semibold mt-auto break-words">{team.bestFinish}</span>
                    </div>

                    {/* Appearances */}
                    <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex flex-col shadow-inner">
                        <span className="font-body text-[9px] text-white/40 uppercase tracking-wider mb-2 font-bold">Appearances</span>
                        <span className="font-display text-2xl text-white mt-auto">{team.totalAppearances}</span>
                    </div>

                    {/* FIFA Rank */}
                    <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex flex-col shadow-inner">
                        <span className="font-body text-[9px] text-white/40 uppercase tracking-wider mb-2 font-bold">FIFA Rank</span>
                        <span className="font-display text-2xl text-white mt-auto">#{team.fifaRanking}</span>
                    </div>

                    {/* Key Player */}
                    <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex flex-col shadow-inner">
                        <span className="font-body text-[9px] text-white/40 uppercase tracking-wider mb-2 font-bold">Key Player</span>
                        <span className="font-body text-xs text-white leading-tight font-semibold mt-auto break-words">{team.keyPlayer}</span>
                    </div>

                    {/* Recent Form */}
                    <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex flex-col shadow-inner">
                        <span className="font-body text-[9px] text-white/40 uppercase tracking-wider mb-2 font-bold">Recent Form</span>
                        <div className="flex gap-1 mt-auto flex-wrap">
                            {formArray.map((result, i) => (
                                <span 
                                    key={i} 
                                    className={`w-[18px] h-[18px] flex items-center justify-center rounded-[3px] text-[9px] font-bold border 
                                        ${result === 'W' ? 'bg-[#00421e]/40 border-[#00ff73]/30 text-[#00ff73]' : 
                                        result === 'D' ? 'bg-[#4a3600]/40 border-[#ffb700]/30 text-[#ffb700]' : 
                                        'bg-[#4a0000]/40 border-[#ff0000]/30 text-[#ff0000]'}`
                                    }
                                >
                                    {result}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </TiltCard>
        </motion.div>
    )
}