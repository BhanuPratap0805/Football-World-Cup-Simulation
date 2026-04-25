import { motion } from 'framer-motion'

const TEAM_FLAGS = {
  'Argentina': 'argentina', 'France': 'france', 'Brazil': 'brazil', 'England': 'england',
  'Spain': 'spain', 'Germany': 'germany', 'Netherlands': 'netherlands', 'Portugal': 'portugal',
  'Italy': 'italy', 'Belgium': 'belgium', 'Croatia': 'croatia', 'Uruguay': 'uruguay',
  'Colombia': 'colombia', 'Japan': 'japan', 'Morocco': 'morocco', 'USA': 'us',
  'Mexico': 'mexico', 'Canada': 'canada', 'South Korea': 'south_korea', 'Australia': 'australia',
  'Saudi Arabia': 'saudi_arabia', 'Qatar': 'qatar', 'Iran': 'iran', 'Iraq': 'iraq',
  'Jordan': 'jordan', 'Uzbekistan': 'uzbekistan', 'Egypt': 'egypt', 'Senegal': 'senegal',
  'Nigeria': 'nigeria', 'Ghana': 'ghana', 'Algeria': 'algeria', 'Tunisia': 'tunisia',
  'Cameroon': 'cameroon', 'Ivory Coast': 'ivory_coast', 'South Africa': 'south_africa',
  'DR Congo': 'dr_congo', 'Cape Verde': 'cape_verde', 'Bosnia & Herzegovina': 'bosnia',
  'Serbia': 'serbia', 'Switzerland': 'switzerland', 'Austria': 'austria', 'Scotland': 'scotland',
  'Wales': 'wales', 'Norway': 'norway', 'Sweden': 'sweden', 'Denmark': 'denmark',
  'Poland': 'poland', 'Czechia': 'czechia', 'Türkiye': 'turkey', 'Ukraine': 'ukraine',
  'Hungary': 'hungary', 'Romania': 'romania', 'Paraguay': 'paraguay', 'Chile': 'chile',
  'Ecuador': 'ecuador', 'Peru': 'peru', 'Venezuela': 'venezuela', 'Panama': 'panama',
  'Costa Rica': 'costa_rica', 'Jamaica': 'jamaica', 'Haiti': 'haiti', 'New Zealand': 'new_zealand'
}

const FLAG_EMOJI = {
  'argentina': 'argentina', 'france': 'france', 'brazil': 'brazil', 'england': 'england',
  'spain': 'spain', 'germany': 'germany', 'netherlands': 'netherlands', 'portugal': 'portugal',
  'italy': 'italy', 'belgium': 'belgium', 'croatia': 'croatia', 'uruguay': 'uruguay',
  'colombia': 'colombia', 'japan': 'japan', 'morocco': 'morocco', 'us': 'us',
  'mexico': 'mexico', 'canada': 'canada', 'south_korea': 'kr', 'australia': 'au',
  'saudi_arabia': 'sa', 'qatar': 'qa', 'iran': 'ir', 'iraq': 'iq',
  'jordan': 'jo', 'uzbekistan': 'uz', 'egypt': 'eg', 'senegal': 'sn',
  'nigeria': 'ng', 'ghana': 'gh', 'algeria': 'dz', 'tunisia': 'tn',
  'cameroon': 'cm', 'ivory_coast': 'ci', 'south_africa': 'za', 'dr_congo': 'cd',
  'cape_verde': 'cv', 'bosnia': 'ba', 'serbia': 'rs', 'switzerland': 'ch',
  'austria': 'at', 'scotland': 'gb-sct', 'wales': 'gb-wls', 'norway': 'no',
  'sweden': 'se', 'denmark': 'dk', 'poland': 'pl', 'czechia': 'cz',
  'turkey': 'tr', 'ukraine': 'ua', 'hungary': 'hu', 'romania': 'ro',
  'paraguay': 'py', 'chile': 'cl', 'ecuador': 'ec', 'peru': 'pe',
  'venezuela': 've', 'panama': 'pa', 'costa_rica': 'cr', 'jamaica': 'jm',
  'haiti': 'ht', 'new_zealand': 'nz'
}

function getFlagEmoji(teamName) {
  const key = TEAM_FLAGS[teamName] || teamName.toLowerCase().replace(/\s+/g, '_')
  const code = FLAG_EMOJI[key] || 'tbd'
  return code
}

export default function TeamCard({ teamName, probability, isWinner, isEliminated }) {
  const flagCode = getFlagEmoji(teamName)
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ 
        opacity: isEliminated ? 0.4 : 1,
        y: 0,
        scale: isWinner ? 1.05 : 1,
        boxShadow: isWinner ? '0 0 40px rgba(255, 255, 255, 0.4)' : 'none'
      }}
      transition={{ duration: 0.5 }}
      className={`
        flex items-center gap-3 px-4 py-3 rounded-lg backdrop-blur-sm
        ${isWinner ? 'bg-white/10 border border-white/30' : 'bg-bg-secondary'}
        ${isEliminated ? 'grayscale' : ''}
      `}
    >
      <span className="text-2xl">
        {flagCode !== 'tbd' ? `https://flagcdn.com/w40/${flagCode}.png` : '?'}
      </span>
      <img 
        src={`https://flagcdn.com/w40/${flagCode}.png`} 
        alt={teamName}
        className="w-8 h-6 object-cover rounded"
        onError={(e) => { e.target.style.display = 'none' }}
      />
      <span className={`font-body font-semibold ${isWinner ? 'text-white' : 'text-text-primary'}`}>
        {teamName}
      </span>
      {probability !== undefined && (
        <span className={`
          ml-auto px-2 py-1 rounded text-sm font-body font-bold
          ${isWinner ? 'bg-white text-bg-primary' : 'bg-bg-primary text-text-muted'}
        `}>
          {probability}%
        </span>
      )}
    </motion.div>
  )
}
