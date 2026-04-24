/**
 * Tests for useRateLimit hook
 * Location: src/hooks/__tests__/useRateLimit.test.ts
 *
 * Uses Vitest's fake timers to control time without real delays.
 * localStorage is reset between each test.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useRateLimit } from '../useRateLimit'

const KEY = 'test-module'
const COOLDOWN = 5000 // 5 seconds

beforeEach(() => {
  localStorage.clear()
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('useRateLimit', () => {

  // ── Initial state ──────────────────────────────────────────────────────────

  it('starts with no rate limit active', () => {
    const { result } = renderHook(() => useRateLimit(KEY, COOLDOWN))
    expect(result.current.isLimited).toBe(false)
    expect(result.current.secondsLeft).toBe(0)
  })

  // ── Triggering ────────────────────────────────────────────────────────────

  it('becomes limited immediately after trigger()', () => {
    const { result } = renderHook(() => useRateLimit(KEY, COOLDOWN))
    act(() => result.current.trigger())
    expect(result.current.isLimited).toBe(true)
    expect(result.current.secondsLeft).toBeGreaterThan(0)
  })

  it('stores the cooldown end-time in localStorage on trigger', () => {
    const before = Date.now()
    const { result } = renderHook(() => useRateLimit(KEY, COOLDOWN))
    act(() => result.current.trigger())
    const stored = parseInt(localStorage.getItem(`rl_${KEY}`) ?? '0', 10)
    expect(stored).toBeGreaterThanOrEqual(before + COOLDOWN - 50)
    expect(stored).toBeLessThanOrEqual(before + COOLDOWN + 50)
  })

  // ── Countdown ────────────────────────────────────────────────────────────

  it('decrements secondsLeft over time', () => {
    const { result } = renderHook(() => useRateLimit(KEY, COOLDOWN))
    act(() => result.current.trigger())

    const initialSeconds = result.current.secondsLeft

    // Advance 2 seconds
    act(() => vi.advanceTimersByTime(2000))

    expect(result.current.secondsLeft).toBeLessThan(initialSeconds)
    expect(result.current.isLimited).toBe(true)
  })

  it('clears the limit after the full cooldown elapses', () => {
    const { result } = renderHook(() => useRateLimit(KEY, COOLDOWN))
    act(() => result.current.trigger())

    // Advance past the full cooldown
    act(() => vi.advanceTimersByTime(COOLDOWN + 600))

    expect(result.current.isLimited).toBe(false)
    expect(result.current.secondsLeft).toBe(0)
  })

  // ── Persistence (re-hydration) ────────────────────────────────────────────

  it('re-hydrates from localStorage on mount if cooldown is still active', () => {
    // Simulate a previously stored cooldown ending in the future
    const future = Date.now() + 3000
    localStorage.setItem(`rl_${KEY}`, future.toString())

    const { result } = renderHook(() => useRateLimit(KEY, COOLDOWN))
    expect(result.current.isLimited).toBe(true)
    expect(result.current.secondsLeft).toBeGreaterThan(0)
  })

  it('does NOT re-hydrate if the stored cooldown has already expired', () => {
    // Simulate an expired cooldown
    const past = Date.now() - 1000
    localStorage.setItem(`rl_${KEY}`, past.toString())

    const { result } = renderHook(() => useRateLimit(KEY, COOLDOWN))
    expect(result.current.isLimited).toBe(false)
    expect(result.current.secondsLeft).toBe(0)
  })

  // ── Multiple keys ─────────────────────────────────────────────────────────

  it('isolates rate limits by key — different keys do not interfere', () => {
    const { result: r1 } = renderHook(() => useRateLimit('module-a', COOLDOWN))
    const { result: r2 } = renderHook(() => useRateLimit('module-b', COOLDOWN))

    act(() => r1.current.trigger())

    expect(r1.current.isLimited).toBe(true)
    expect(r2.current.isLimited).toBe(false)
  })

  // ── Re-trigger resets cooldown ─────────────────────────────────────────────

  it('re-triggering while limited resets the countdown to full duration', () => {
    const { result } = renderHook(() => useRateLimit(KEY, COOLDOWN))
    act(() => result.current.trigger())

    // Advance halfway
    act(() => vi.advanceTimersByTime(COOLDOWN / 2))

    const halfwaySeconds = result.current.secondsLeft

    // Trigger again (should reset to full)
    act(() => result.current.trigger())

    expect(result.current.secondsLeft).toBeGreaterThan(halfwaySeconds)
  })
})
