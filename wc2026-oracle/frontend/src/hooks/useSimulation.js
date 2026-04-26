import { useState, useEffect } from 'react'
import apiClient from '../api/client'

export function useSimulation() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [awakening, setAwakening] = useState(false)
  const [progressMessage, setProgressMessage] = useState("Igniting the Monte Carlo Engine...")

  useEffect(() => {
    let isMounted = true
    const controller = new AbortController()

    const fetchSimulation = async () => {
      let retryCount = 0;

      const executeRequest = async () => {
        // Show "Oracle awakening" message after 5 seconds
        const awakeningTimer = setTimeout(() => {
          if (isMounted) setAwakening(true)
        }, 5000)

        const timer10 = setTimeout(() => {
          if (isMounted && retryCount === 0) setProgressMessage("Running 10,000 simulations...")
        }, 10000)
        
        const timer30 = setTimeout(() => {
          if (isMounted && retryCount === 0) setProgressMessage("Crunching the final bracket...")
        }, 30000)
        
        const timer60 = setTimeout(() => {
          if (isMounted && retryCount === 0) setProgressMessage("Almost there, this one's taking longer than usual...")
        }, 60000)

        try {
          // Add cache-busting parameters to force fresh simulation every time
          const timestamp = Date.now()
          const response = await apiClient.get(`/simulate?force_fresh=true&_t=${timestamp}`, {
            signal: controller.signal,
            timeout: 120000 // 120 seconds timeout
          })
          
          if (isMounted) {
            setData(response.data)
            setLoading(false)
            setError(null)
          }
        } catch (err) {
          if (err.name === 'CanceledError') return; // Ignore aborted requests
          
          const isTimeoutOr502 = err.code === 'ECONNABORTED' || (err.response && err.response.status === 502);

          if (isTimeoutOr502 && retryCount === 0 && isMounted) {
            retryCount++;
            setProgressMessage("Waking up the prediction engine, retrying...");
            // Wait 5 seconds before retrying
            await new Promise(resolve => setTimeout(resolve, 5000));
            if (isMounted) {
              await executeRequest();
            }
          } else if (isMounted) {
            setError(err.message || 'Error loading simulation')
            setLoading(false)
          }
        } finally {
          clearTimeout(awakeningTimer)
          clearTimeout(timer10)
          clearTimeout(timer30)
          clearTimeout(timer60)
        }
      }

      executeRequest()
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
    setProgressMessage("Igniting the Monte Carlo Engine...")
    try {
      const timestamp = Date.now()
      const response = await apiClient.get(`/simulate?force_fresh=true&_t=${timestamp}`, {
        timeout: 120000
      })
      setData(response.data)
      setError(null)
    } catch (err) {
      setError(err.message || 'Error loading simulation')
    } finally {
      setLoading(false)
    }
  }

  return { data, loading, error, awakening, progressMessage, refetch }
}

export default useSimulation