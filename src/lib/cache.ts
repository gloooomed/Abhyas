/**
 * Simple in-memory cache utility for AI API responses.
 * Reduces redundant API calls within a session.
 */

interface CacheEntry<T> {
  data: T
  timestamp: number
  expiresAt: number
}

interface CacheOptions {
  /** Time-to-live in milliseconds (default: 5 minutes) */
  ttl?: number
}

const DEFAULT_TTL = 5 * 60 * 1000 // 5 minutes

class Cache {
  private store: Map<string, CacheEntry<unknown>> = new Map()
  private maxSize: number = 100

  createKey(prefix: string, params: Record<string, unknown>): string {
    const sortedParams = Object.keys(params)
      .sort()
      .map((key) => `${key}:${JSON.stringify(params[key])}`)
      .join('|')
    return `${prefix}:${sortedParams}`
  }

  get<T>(key: string): T | null {
    const entry = this.store.get(key) as CacheEntry<T> | undefined
    if (!entry) return null
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key)
      return null
    }
    return entry.data
  }

  set<T>(key: string, data: T, options: CacheOptions = {}): void {
    const { ttl = DEFAULT_TTL } = options
    if (this.store.size >= this.maxSize) {
      const oldestKey = this.store.keys().next().value
      if (oldestKey) this.store.delete(oldestKey)
    }
    this.store.set(key, { data, timestamp: Date.now(), expiresAt: Date.now() + ttl })
  }

  has(key: string): boolean {
    const entry = this.store.get(key)
    if (!entry) return false
    if (Date.now() > entry.expiresAt) { this.store.delete(key); return false }
    return true
  }

  delete(key: string): boolean { return this.store.delete(key) }
  clear(): void { this.store.clear() }

  get size(): number { return this.store.size }
}

const cache = new Cache()

export const CacheKeys = {
  SKILLS_ANALYSIS: 'skills-analysis',
  INTERVIEW_QUESTIONS: 'interview-questions',
  RESUME_OPTIMIZATION: 'resume-optimization',
  CAREER_PATH: 'career-path',
} as const

export const CacheTTL = {
  SHORT: 2 * 60 * 1000,
  MEDIUM: 5 * 60 * 1000,
  LONG: 15 * 60 * 1000,
  HOUR: 60 * 60 * 1000,
} as const

export { cache }
export default cache
