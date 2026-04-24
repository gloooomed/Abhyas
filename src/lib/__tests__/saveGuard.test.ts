/**
 * Tests for saveGuard.ts
 * Location: src/lib/__tests__/saveGuard.test.ts
 *
 * Supabase is mocked entirely — no real network calls are made.
 * Tests cover the deduplication logic and the happy-path insert.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import type { Mock } from 'vitest'

// ── Supabase mock ─────────────────────────────────────────────────────────────
// We intercept the module before importing saveGuard so the mock is in place.

const mockInsert = vi.fn()
const mockSingle = vi.fn()

// Build a chainable query builder mock
function makeQueryBuilder(singleResult: unknown) {
  mockSingle.mockResolvedValue(singleResult)
  return {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    single: mockSingle,
    insert: mockInsert,
  }
}

vi.mock('../supabase', () => {
  return {
    supabase: {
      from: vi.fn(),
    },
  }
})

// ── Import AFTER mock is registered ──────────────────────────────────────────
import { saveSkillsScan, saveResumeScore, saveInterviewSession } from '../saveGuard'
import { supabase } from '../supabase'

// Typed shorthand
const mockFrom = supabase.from as Mock

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Returns a timestamp that is `ageMs` milliseconds in the past */
function ageAgo(ageMs: number) {
  return new Date(Date.now() - ageMs).toISOString()
}

const WITHIN_WINDOW = 60_000       // 1 min — inside the 3-min dedup window
const OUTSIDE_WINDOW = 4 * 60_000  // 4 min — outside the 3-min dedup window

// ─────────────────────────────────────────────────────────────────────────────
//  saveSkillsScan
// ─────────────────────────────────────────────────────────────────────────────

describe('saveSkillsScan', () => {

  beforeEach(() => {
    vi.clearAllMocks()
    mockInsert.mockResolvedValue({ error: null })
  })

  it('inserts when no previous record exists', async () => {
    // Simulate no existing record (Supabase single() returns null data)
    const qb = makeQueryBuilder({ data: null, error: { code: 'PGRST116' } })
    mockFrom.mockImplementation((table: string) => {
      if (table === 'skills_scans') return qb
      return { insert: mockInsert }
    })

    const result = await saveSkillsScan('user-1', {
      target_role: 'Frontend Engineer',
      match_percentage: 72,
      skills_data: {},
    })

    expect(result.saved).toBe(true)
    expect(mockInsert).toHaveBeenCalledOnce()
  })

  it('inserts when last record is outside the dedup window (old result)', async () => {
    const qb = makeQueryBuilder({
      data: { target_role: 'Frontend Engineer', match_percentage: 72, created_at: ageAgo(OUTSIDE_WINDOW) },
      error: null,
    })
    mockFrom.mockImplementation((table: string) => {
      if (table === 'skills_scans') return qb
      return { insert: mockInsert }
    })

    const result = await saveSkillsScan('user-1', {
      target_role: 'Frontend Engineer',
      match_percentage: 72,
      skills_data: {},
    })

    expect(result.saved).toBe(true)
    expect(mockInsert).toHaveBeenCalledOnce()
  })

  it('skips insert for exact duplicate within dedup window', async () => {
    const qb = makeQueryBuilder({
      data: { target_role: 'Frontend Engineer', match_percentage: 72, created_at: ageAgo(WITHIN_WINDOW) },
      error: null,
    })
    mockFrom.mockImplementation((table: string) => {
      if (table === 'skills_scans') return qb
      return { insert: mockInsert }
    })

    const result = await saveSkillsScan('user-1', {
      target_role: 'Frontend Engineer',
      match_percentage: 72,
      skills_data: {},
    })

    expect(result.saved).toBe(false)
    expect(result.reason).toMatch(/duplicate/i)
    expect(mockInsert).not.toHaveBeenCalled()
  })

  it('inserts when score differs even within dedup window', async () => {
    const qb = makeQueryBuilder({
      data: { target_role: 'Frontend Engineer', match_percentage: 55, created_at: ageAgo(WITHIN_WINDOW) },
      error: null,
    })
    mockFrom.mockImplementation((table: string) => {
      if (table === 'skills_scans') return qb
      return { insert: mockInsert }
    })

    const result = await saveSkillsScan('user-1', {
      target_role: 'Frontend Engineer',
      match_percentage: 80, // different score
      skills_data: {},
    })

    expect(result.saved).toBe(true)
    expect(mockInsert).toHaveBeenCalledOnce()
  })

  it('inserts when role differs even within dedup window', async () => {
    const qb = makeQueryBuilder({
      data: { target_role: 'Backend Engineer', match_percentage: 72, created_at: ageAgo(WITHIN_WINDOW) },
      error: null,
    })
    mockFrom.mockImplementation((table: string) => {
      if (table === 'skills_scans') return qb
      return { insert: mockInsert }
    })

    const result = await saveSkillsScan('user-1', {
      target_role: 'Frontend Engineer', // different role
      match_percentage: 72,
      skills_data: {},
    })

    expect(result.saved).toBe(true)
    expect(mockInsert).toHaveBeenCalledOnce()
  })

  it('is case-insensitive when comparing target_role', async () => {
    const qb = makeQueryBuilder({
      data: { target_role: 'FRONTEND ENGINEER', match_percentage: 72, created_at: ageAgo(WITHIN_WINDOW) },
      error: null,
    })
    mockFrom.mockImplementation((table: string) => {
      if (table === 'skills_scans') return qb
      return { insert: mockInsert }
    })

    const result = await saveSkillsScan('user-1', {
      target_role: 'frontend engineer', // lowercase — should still be detected as duplicate
      match_percentage: 72,
      skills_data: {},
    })

    expect(result.saved).toBe(false)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
//  saveResumeScore
// ─────────────────────────────────────────────────────────────────────────────

describe('saveResumeScore', () => {

  beforeEach(() => {
    vi.clearAllMocks()
    mockInsert.mockResolvedValue({ error: null })
  })

  it('inserts when no previous record exists', async () => {
    const qb = makeQueryBuilder({ data: null, error: { code: 'PGRST116' } })
    mockFrom.mockImplementation((table: string) => {
      if (table === 'resume_scores') return qb
      return { insert: mockInsert }
    })

    const result = await saveResumeScore('user-1', { overall_score: 78, result_data: {} })
    expect(result.saved).toBe(true)
    expect(mockInsert).toHaveBeenCalledOnce()
  })

  it('inserts when old record is outside the dedup window', async () => {
    const qb = makeQueryBuilder({
      data: { overall_score: 78, created_at: ageAgo(OUTSIDE_WINDOW) },
      error: null,
    })
    mockFrom.mockImplementation((table: string) => {
      if (table === 'resume_scores') return qb
      return { insert: mockInsert }
    })

    const result = await saveResumeScore('user-1', { overall_score: 78, result_data: {} })
    expect(result.saved).toBe(true)
    expect(mockInsert).toHaveBeenCalledOnce()
  })

  it('skips insert for identical score within dedup window', async () => {
    const qb = makeQueryBuilder({
      data: { overall_score: 78, created_at: ageAgo(WITHIN_WINDOW) },
      error: null,
    })
    mockFrom.mockImplementation((table: string) => {
      if (table === 'resume_scores') return qb
      return { insert: mockInsert }
    })

    const result = await saveResumeScore('user-1', { overall_score: 78, result_data: {} })
    expect(result.saved).toBe(false)
    expect(result.reason).toMatch(/duplicate/i)
    expect(mockInsert).not.toHaveBeenCalled()
  })

  it('inserts when score differs even within dedup window', async () => {
    const qb = makeQueryBuilder({
      data: { overall_score: 65, created_at: ageAgo(WITHIN_WINDOW) },
      error: null,
    })
    mockFrom.mockImplementation((table: string) => {
      if (table === 'resume_scores') return qb
      return { insert: mockInsert }
    })

    const result = await saveResumeScore('user-1', { overall_score: 82, result_data: {} })
    expect(result.saved).toBe(true)
    expect(mockInsert).toHaveBeenCalledOnce()
  })
})

// ─────────────────────────────────────────────────────────────────────────────
//  saveInterviewSession
// ─────────────────────────────────────────────────────────────────────────────

describe('saveInterviewSession', () => {

  beforeEach(() => {
    vi.clearAllMocks()
    mockInsert.mockResolvedValue({ error: null })
  })

  it('inserts when no previous record exists', async () => {
    const qb = makeQueryBuilder({ data: null, error: { code: 'PGRST116' } })
    mockFrom.mockImplementation((table: string) => {
      if (table === 'interview_sessions') return qb
      return { insert: mockInsert }
    })

    const result = await saveInterviewSession('user-1', { role: 'SWE', score: 85, questions_count: 5 })
    expect(result.saved).toBe(true)
    expect(mockInsert).toHaveBeenCalledOnce()
  })

  it('inserts when old record is outside the dedup window', async () => {
    const qb = makeQueryBuilder({
      data: { role: 'SWE', score: 85, created_at: ageAgo(OUTSIDE_WINDOW) },
      error: null,
    })
    mockFrom.mockImplementation((table: string) => {
      if (table === 'interview_sessions') return qb
      return { insert: mockInsert }
    })

    const result = await saveInterviewSession('user-1', { role: 'SWE', score: 85, questions_count: 5 })
    expect(result.saved).toBe(true)
    expect(mockInsert).toHaveBeenCalledOnce()
  })

  it('skips insert for identical role + score within dedup window', async () => {
    const qb = makeQueryBuilder({
      data: { role: 'SWE', score: 85, created_at: ageAgo(WITHIN_WINDOW) },
      error: null,
    })
    mockFrom.mockImplementation((table: string) => {
      if (table === 'interview_sessions') return qb
      return { insert: mockInsert }
    })

    const result = await saveInterviewSession('user-1', { role: 'SWE', score: 85, questions_count: 5 })
    expect(result.saved).toBe(false)
    expect(result.reason).toMatch(/duplicate/i)
    expect(mockInsert).not.toHaveBeenCalled()
  })

  it('inserts when score differs from last session', async () => {
    const qb = makeQueryBuilder({
      data: { role: 'SWE', score: 60, created_at: ageAgo(WITHIN_WINDOW) },
      error: null,
    })
    mockFrom.mockImplementation((table: string) => {
      if (table === 'interview_sessions') return qb
      return { insert: mockInsert }
    })

    const result = await saveInterviewSession('user-1', { role: 'SWE', score: 85, questions_count: 5 })
    expect(result.saved).toBe(true)
    expect(mockInsert).toHaveBeenCalledOnce()
  })

  it('inserts when role differs from last session', async () => {
    const qb = makeQueryBuilder({
      data: { role: 'Backend Engineer', score: 85, created_at: ageAgo(WITHIN_WINDOW) },
      error: null,
    })
    mockFrom.mockImplementation((table: string) => {
      if (table === 'interview_sessions') return qb
      return { insert: mockInsert }
    })

    const result = await saveInterviewSession('user-1', { role: 'Frontend Engineer', score: 85, questions_count: 5 })
    expect(result.saved).toBe(true)
    expect(mockInsert).toHaveBeenCalledOnce()
  })

  it('is case-insensitive when comparing role', async () => {
    const qb = makeQueryBuilder({
      data: { role: 'SOFTWARE ENGINEER', score: 85, created_at: ageAgo(WITHIN_WINDOW) },
      error: null,
    })
    mockFrom.mockImplementation((table: string) => {
      if (table === 'interview_sessions') return qb
      return { insert: mockInsert }
    })

    const result = await saveInterviewSession('user-1', {
      role: 'software engineer', // lowercase — still a duplicate
      score: 85,
      questions_count: 5,
    })
    expect(result.saved).toBe(false)
  })
})
