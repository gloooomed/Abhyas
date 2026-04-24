/**
 * saveGuard.ts
 * Wraps Supabase inserts with duplicate detection.
 * Skips the insert if the last saved record for that user+module
 * is identical to the new result and was saved within DEDUP_WINDOW_MS.
 */
import { supabase } from './supabase'

const DEDUP_WINDOW_MS = 3 * 60 * 1000 // 3 minutes

function isRecent(created_at: string) {
  return Date.now() - new Date(created_at).getTime() < DEDUP_WINDOW_MS
}

// ── Skills Scan ──────────────────────────────────────────────────────────────
export async function saveSkillsScan(
  userId: string,
  payload: { target_role: string; match_percentage: number; skills_data: unknown }
): Promise<{ saved: boolean; reason?: string }> {
  const { data: last } = await supabase
    .from('skills_scans')
    .select('target_role, match_percentage, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (last && isRecent(last.created_at)
    && last.target_role?.toLowerCase().trim() === payload.target_role.toLowerCase().trim()
    && last.match_percentage === payload.match_percentage) {
    return { saved: false, reason: 'Duplicate result — same role and score saved recently.' }
  }

  const { error } = await supabase.from('skills_scans').insert({ user_id: userId, ...payload })
  if (error) throw error
  return { saved: true }
}

// ── Resume Score ─────────────────────────────────────────────────────────────
export async function saveResumeScore(
  userId: string,
  payload: { overall_score: number; result_data: unknown }
): Promise<{ saved: boolean; reason?: string }> {
  const { data: last } = await supabase
    .from('resume_scores')
    .select('overall_score, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (last && isRecent(last.created_at) && last.overall_score === payload.overall_score) {
    return { saved: false, reason: 'Duplicate result — same resume score saved recently.' }
  }

  const { error } = await supabase.from('resume_scores').insert({ user_id: userId, ...payload })
  if (error) throw error
  return { saved: true }
}

// ── Interview Session ────────────────────────────────────────────────────────
export async function saveInterviewSession(
  userId: string,
  payload: { role: string; score: number; questions_count: number }
): Promise<{ saved: boolean; reason?: string }> {
  const { data: last } = await supabase
    .from('interview_sessions')
    .select('role, score, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (last && isRecent(last.created_at)
    && last.role?.toLowerCase().trim() === payload.role.toLowerCase().trim()
    && last.score === payload.score) {
    return { saved: false, reason: 'Duplicate result — same interview score saved recently.' }
  }

  const { error } = await supabase.from('interview_sessions').insert({ user_id: userId, ...payload })
  if (error) throw error
  return { saved: true }
}
