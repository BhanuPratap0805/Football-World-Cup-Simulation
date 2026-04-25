/**
 * teamProfiles.js
 * ================
 * Static data layer for the Top 8 Teams Journey scroll section.
 * Using plain JS (not TS) to match the existing .jsx codebase.
 * Color values are used as CSS fallback gradients when images are unavailable.
 */

export const TOP_8_TEAMS = [
  {
    id: "spain",
    name: "Spain",
    shortName: "ESP",
    color: "#AA151B",
    imageUrl: "/images/teams/spain.jpg",
    worldCupWins: 1,
    bestFinish: "Champions (2010)",
    totalAppearances: 16,
    fifaRanking: 8,
    keyPlayer: "Pedri",
    coach: "Luis de la Fuente",
    form: "W-W-D-W-W",
    narrative: "Masters of possession and tactical evolution. After their 2010 triumph, Spain rebuilt around a new generation of technical midfielders, blending tiki-taka heritage with vertical explosiveness."
  },
  {
    id: "argentina",
    name: "Argentina",
    shortName: "ARG",
    color: "#75AADB",
    imageUrl: "/images/teams/argentina.jpg",
    worldCupWins: 3,
    bestFinish: "Champions (2022)",
    totalAppearances: 18,
    fifaRanking: 1,
    keyPlayer: "Lionel Messi",
    coach: "Lionel Scaloni",
    form: "W-W-W-D-W",
    narrative: "The defending champions carried a nation's dreams to glory in Qatar. With Messi's final dance and a rock-solid defensive core, Argentina enters 2026 as the team to beat."
  },
  {
    id: "france",
    name: "France",
    shortName: "FRA",
    color: "#002395",
    imageUrl: "/images/teams/france.webp",
    worldCupWins: 2,
    bestFinish: "Champions (1998, 2018)",
    totalAppearances: 16,
    fifaRanking: 2,
    keyPlayer: "Kylian Mbappé",
    coach: "Didier Deschamps",
    form: "W-L-W-W-D",
    narrative: "Unmatched squad depth and transitional speed. France consistently produces world-class talent across every position, making them the most complete tournament side in modern football."
  },
  {
    id: "brazil",
    name: "Brazil",
    shortName: "BRA",
    color: "#009739",
    imageUrl: "/images/teams/brazil.webp",
    worldCupWins: 5,
    bestFinish: "Champions (1958-2002)",
    totalAppearances: 22,
    fifaRanking: 5,
    keyPlayer: "Vinícius Júnior",
    coach: "Dorival Júnior",
    form: "W-W-D-L-W",
    narrative: "The five-time champions are rebuilding around flair and physicality. With a new attacking identity and renewed tactical discipline, Brazil aims to reclaim the throne in North America."
  },
  {
    id: "england",  // ← ADDED
    name: "England",
    shortName: "ENG",
    color: "#FFFFFF",
    imageUrl: "/images/teams/england.jpg",
    worldCupWins: 1,
    bestFinish: "Champions (1966)",
    totalAppearances: 16,
    fifaRanking: 4,
    keyPlayer: "Jude Bellingham",
    coach: "Gareth Southgate",
    form: "W-W-D-W-L",
    narrative: "A golden generation finally hitting its peak. England blends youthful dynamism with tournament experience, aiming to end 60 years of hurt with a squad built for knockout pressure."
  },
  {
    id: "portugal",  // ← ADDED
    name: "Portugal",
    shortName: "POR",
    color: "#FF0000",
    imageUrl: "/images/teams/portugal.jpg",
    worldCupWins: 0,
    bestFinish: "Semi-Finals (1966, 2006)",
    totalAppearances: 8,
    fifaRanking: 6,
    keyPlayer: "Bruno Fernandes",
    coach: "Roberto Martínez",
    form: "W-W-W-D-W",
    narrative: "Technical mastery meets tactical flexibility. Portugal's blend of creative midfielders, lethal forwards, and disciplined defense makes them a perennial dark horse with championship DNA."
  },
  {
    id: "netherlands",
    name: "Netherlands",
    shortName: "NED",
    color: "#AE1C28",
    imageUrl: "/images/teams/netherlands.webp",
    worldCupWins: 0,
    bestFinish: "Runners-up (1974, 1978, 2010)",
    totalAppearances: 11,
    fifaRanking: 7,
    keyPlayer: "Virgil van Dijk",
    coach: "Ronald Koeman",
    form: "W-W-W-D-W",
    narrative: "Total Football's modern heirs. The Netherlands blend defensive solidity with rapid wing play, consistently punching above their weight in knockout tournaments."
  },
  {
    id: "germany",
    name: "Germany",
    shortName: "GER",
    color: "#000000",
    imageUrl: "/images/teams/germany.jpg",
    worldCupWins: 4,
    bestFinish: "Champions (1954, 1974, 1990, 2014)",
    totalAppearances: 20,
    fifaRanking: 11,
    keyPlayer: "Florian Wirtz",
    coach: "Julian Nagelsmann",
    form: "W-W-W-W-D",
    narrative: "Rebuilding after a turbulent cycle. Germany's young core combines tactical intelligence with relentless pressing, aiming to restore Die Mannschaft's tournament dominance."
  }
];