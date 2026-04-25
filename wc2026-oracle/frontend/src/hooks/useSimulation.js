import { useState, useEffect } from 'react'
import apiClient from '../api/client'

export function useSimulation() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [awakening, setAwakening] = useState(false)

  useEffect(() => {
    let isMounted = true
    const controller = new AbortController()

    const fetchSimulation = async () => {
      // Show "Oracle awakening" message after 5 seconds
      const awakeningTimer = setTimeout(() => {
        if (isMounted) {
          setAwakening(true)
        }
      }, 5000)

      try {
        // Add cache-busting parameters to force fresh simulation every time
        const timestamp = Date.now()
        const response = await apiClient.get(`/simulate?force_fresh=true&_t=${timestamp}`, {
          signal: controller.signal
        })
        
        clearTimeout(awakeningTimer)
        
        if (isMounted) {
          setData(response.data)
          setLoading(false)
          setError(null)
        }
      } catch (err) {
        if (err.name === 'CanceledError') return; // Ignore aborted requests
        clearTimeout(awakeningTimer)
        
        if (isMounted) {
          setError(err.message || 'Failed to run simulation')
          setLoading(false)
        }
      }
    }

    fetchSimulation()

    return () => {
      isMounted = false
      controller.abort() // Cancel in-flight API calls on unmount
    }
  }, [])

  // Optional: Add a manual refetch function for "Restart" button
  const refetch = async () => {
    setLoading(true)
    try {
      const timestamp = Date.now()
      const response = await apiClient.get(`/simulate?force_fresh=true&_t=${timestamp}`)
      setData(response.data)
      setError(null)
    } catch (err) {
      setError(err.message || 'Failed to refresh simulation')
    } finally {
      setLoading(false)
    }
  }

  return { data, loading, error, awakening, refetch }
}

export default useSimulation