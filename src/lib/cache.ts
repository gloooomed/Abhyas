/**
 * Simple in-memory cache utility for API responses.
 * Helps reduce redundant API calls and improves performance.
 */

interface CacheEntry<T> {
  data: T
  timestamp: number
  expiresAt: number
}

interface CacheOptions {
  /** Time-to-live in milliseconds (default: 5 minutes) */
  ttl?: number
  /** Whether to return stale data while revalidating (default: false) */
  staleWhileRevalidate?: boolean
}

const DEFAULT_TTL = 5 * 60 * 1000 // 5 minutes

class Cache {
  private store: Map<string, CacheEntry<unknown>> = new Map()
  private maxSize: number = 100 // Maximum number of entries

  /**
   * Generate a cache key from an object of parameters
   */
  createKey(prefix: string, params: Record<string, unknown>): string {
    const sortedParams = Object.keys(params)
      .sort()
      .map((key) => `${key}:${JSON.stringify(params[key])}`)
      .join('|')
    return `${prefix}:${sortedParams}`
  }

  /**
   * Get a value from the cache
   */
  get<T>(key: string): T | null {
    const entry = this.store.get(key) as CacheEntry<T> | undefined

    if (!entry) {
      return null
    }

    // Check if entry has expired
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key)
      return null
    }

    return entry.data
  }

  /**
   * Set a value in the cache
   */
  set<T>(key: string, data: T, options: CacheOptions = {}): void {
    const { ttl = DEFAULT_TTL } = options

    // Enforce max size by removing oldest entries
    if (this.store.size >= this.maxSize) {
      const oldestKey = this.store.keys().next().value
      if (oldestKey) {
        this.store.delete(oldestKey)
      }
    }

    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + ttl,
    }

    this.store.set(key, entry)
  }

  /**
   * Check if a key exists and is not expired
   */
  has(key: string): boolean {
    const entry = this.store.get(key)
    if (!entry) return false
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key)
      return false
    }
    return true
  }

  /**
   * Remove a specific key from the cache
   */
  delete(key: string): boolean {
    return this.store.delete(key)
  }

  /**
   * Clear all entries from the cache
   */
  clear(): void {
    this.store.clear()
  }

  /**
   * Clear expired entries from the cache
   */
  clearExpired(): number {
    let cleared = 0
    const now = Date.now()

    for (const [key, entry] of this.store.entries()) {
      if (now > entry.expiresAt) {
        this.store.delete(key)
        cleared++
      }
    }

    return cleared
  }

  /**
   * Get the number of entries in the cache
   */
  get size(): number {
    return this.store.size
  }
}

// Create singleton instance
const cache = new Cache()

/**
 * Higher-order function to wrap async functions with caching
 *
 * @example
 * const cachedFetch = withCache(
 *   async (userId: string) => fetchUserData(userId),
 *   (userId) => `user:${userId}`,
 *   { ttl: 10 * 60 * 1000 } // 10 minutes
 * )
 *
 * const userData = await cachedFetch('123')
 */
export function withCache<TArgs extends unknown[], TResult>(
  fn: (...args: TArgs) => Promise<TResult>,
  keyGenerator: (...args: TArgs) => string,
  options: CacheOptions = {}
): (...args: TArgs) => Promise<TResult> {
  return async (...args: TArgs): Promise<TResult> => {
    const key = keyGenerator(...args)

    // Check cache first
    const cached = cache.get<TResult>(key)
    if (cached !== null) {
      return cached
    }

    // Execute function and cache result
    const result = await fn(...args)
    cache.set(key, result, options)
    return result
  }
}

/**
 * Cache keys for different API endpoints
 */
export const CacheKeys = {
  SKILLS_ANALYSIS: 'skills-analysis',
  INTERVIEW_QUESTIONS: 'interview-questions',
  RESUME_OPTIMIZATION: 'resume-optimization',
  CAREER_PATH: 'career-path',
} as const

/**
 * TTL values for different types of data
 */
export const CacheTTL = {
  SHORT: 2 * 60 * 1000, // 2 minutes
  MEDIUM: 5 * 60 * 1000, // 5 minutes
  LONG: 15 * 60 * 1000, // 15 minutes
  HOUR: 60 * 60 * 1000, // 1 hour
} as const

export { cache }
export default cache
