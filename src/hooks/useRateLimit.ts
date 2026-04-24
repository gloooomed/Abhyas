import { useState, useEffect, useCallback, useRef } from 'react'

/**
 * Per-module rate limiter persisted in localStorage.
 * Returns isLimited (boolean), secondsLeft (number), and trigger() to start the cooldown.
 */
export function useRateLimit(key: string, cooldownMs: number) {
  const storageKey = `rl_${key}`
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const getRemaining = () => {
    const until = parseInt(localStorage.getItem(storageKey) ?? '0', 10)
    return Math.max(0, until - Date.now())
  }

  const [remaining, setRemaining] = useState(() => getRemaining())

  const startTimer = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = setInterval(() => {
      const r = getRemaining()
      setRemaining(r)
      if (r <= 0 && intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }, 500)
  }, [storageKey]) // eslint-disable-line react-hooks/exhaustive-deps

  // Re-hydrate on mount if there's still a cooldown running
  useEffect(() => {
    if (getRemaining() > 0) startTimer()
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const trigger = useCallback(() => {
    const until = Date.now() + cooldownMs
    localStorage.setItem(storageKey, until.toString())
    setRemaining(cooldownMs)
    startTimer()
  }, [storageKey, cooldownMs, startTimer])

  return {
    isLimited: remaining > 0,
    secondsLeft: Math.ceil(remaining / 1000),
    trigger,
  }
}
