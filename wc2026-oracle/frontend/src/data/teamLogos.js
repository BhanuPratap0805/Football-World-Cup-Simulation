// src/data/teamLogos.js

const ISO_CODES = {
  'Argentina': 'ar', 'France': 'fr', 'Spain': 'es', 'England': 'gb-eng',
  'Brazil': 'br', 'Netherlands': 'nl', 'Portugal': 'pt', 'Germany': 'de',
  'Italy': 'it', 'Belgium': 'be', 'Colombia': 'co', 'Uruguay': 'uy',
  'Croatia': 'hr', 'Japan': 'jp', 'Morocco': 'ma', 'USA': 'us',
  'Mexico': 'mx', 'South Korea': 'kr', 'Australia': 'au', 'Switzerland': 'ch',
  'Senegal': 'sn', 'Egypt': 'eg', 'Iran': 'ir', 'Ecuador': 'ec',
  'Canada': 'ca', 'Denmark': 'dk', 'Serbia': 'rs', 'Poland': 'pl',
  'Austria': 'at', 'Algeria': 'dz', 'Tunisia': 'tn', 'Nigeria': 'ng',
  'Cameroon': 'cm', 'Ghana': 'gh', 'Saudi Arabia': 'sa', 'Qatar': 'qa',
  'Iraq': 'iq', 'Uzbekistan': 'uz', 'Jordan': 'jo', 'Paraguay': 'py',
  'Chile': 'cl', 'Wales': 'gb-wls', 'Scotland': 'gb-sct', 'Czech Republic': 'cz',
  'Turkey': 'tr', 'Ukraine': 'ua', 'Costa Rica': 'cr', 'Panama': 'pa',
  'Jamaica': 'jm', 'Honduras': 'hn', 'El Salvador': 'sv', 'New Zealand': 'nz',
  'Peru': 'pe', 'Venezuela': 've'
}

export const getTeamLogo = (teamName) => {
  const code = ISO_CODES[teamName]
  if (code) {
    // Return high quality flag from flagcdn
    return `https://flagcdn.com/w160/${code}.png`
  }
  return null
}