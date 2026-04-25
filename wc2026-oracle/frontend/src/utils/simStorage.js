/**
 * Simulation Storage Utilities
 * ============================
 * Persists simulation results in sessionStorage with short URL-safe IDs.
 * This allows results to survive page refreshes and be shared via URL.
 */

const STORAGE_PREFIX = 'wc2026_sim_'

/**
 * Save simulation data to sessionStorage.
 * @param {object} data - The simulation result payload from the API.
 * @returns {string} A short 8-character ID used as the URL query parameter.
 */
export function saveSimulation(data) {
  const id = crypto.randomUUID().slice(0, 8)
  try {
    sessionStorage.setItem(`${STORAGE_PREFIX}${id}`, JSON.stringify(data))
  } catch (e) {
    console.warn('[simStorage] Failed to save simulation:', e)
  }
  return id
}

/**
 * Load simulation data from sessionStorage by ID.
 * @param {string} id - The 8-character simulation ID.
 * @returns {object|null} Parsed simulation data, or null if not found / expired.
 */
export function loadSimulation(id) {
  try {
    const raw = sessionStorage.getItem(`${STORAGE_PREFIX}${id}`)
    return raw ? JSON.parse(raw) : null
  } catch (e) {
    console.warn('[simStorage] Failed to load simulation:', e)
    return null
  }
}

/**
 * Remove a simulation from sessionStorage.
 * @param {string} id - The 8-character simulation ID.
 */
export function clearSimulation(id) {
  try {
    sessionStorage.removeItem(`${STORAGE_PREFIX}${id}`)
  } catch (e) {
    console.warn('[simStorage] Failed to clear simulation:', e)
  }
}
