import { invokeFunction } from './edgeFunctions'

type SaveResult = { saved: boolean; reason?: string }

function saveActivity(type: string, payload: unknown): Promise<SaveResult> {
  return invokeFunction<SaveResult>('save-activity', { type, payload })
}

export async function saveSkillsScan(
  _userId: string,
  payload: { target_role: string; match_percentage: number; skills_data: unknown }
): Promise<SaveResult> {
  return saveActivity('skills_scan', payload)
}

export async function saveResumeScore(
  _userId: string,
  payload: { overall_score: number; result_data: unknown }
): Promise<SaveResult> {
  return saveActivity('resume_score', payload)
}

export async function saveInterviewSession(
  _userId: string,
  payload: { role: string; score: number; questions_count: number }
): Promise<SaveResult> {
  return saveActivity('interview_session', payload)
}
