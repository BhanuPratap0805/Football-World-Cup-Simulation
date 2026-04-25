// src/data/teamLogos.js
export const TEAM_LOGOS = {
  'Spain': '/images/teams/spain.jpg',
  'Argentina': '/images/teams/argentina.jpg',
  'France': '/images/teams/france.webp',
  'Brazil': '/images/teams/brazil.webp',
  'England': '/images/teams/england.jpg',
  'Portugal': '/images/teams/portugal.jpg',
  'Netherlands': '/images/teams/netherlands.webp',
  'Germany': '/images/teams/germany.jpg'
}

export const getTeamLogo = (teamName) => {
  return TEAM_LOGOS[teamName] || null
}