import { describe, it, expect, beforeEach, vi } from 'vitest'
import { saveSkillsScan, saveResumeScore, saveInterviewSession } from '../saveGuard'
import { invokeFunction } from '../edgeFunctions'

vi.mock('../edgeFunctions', () => ({
  invokeFunction: vi.fn(),
}))

const mockInvokeFunction = vi.mocked(invokeFunction)

describe('saveGuard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockInvokeFunction.mockResolvedValue({ saved: true })
  })

  it('saves skills scans through the save-activity Edge Function', async () => {
    const payload = {
      target_role: 'Frontend Engineer',
      match_percentage: 72,
      skills_data: {},
    }

    const result = await saveSkillsScan('user-1', payload)

    expect(result.saved).toBe(true)
    expect(mockInvokeFunction).toHaveBeenCalledWith('save-activity', {
      type: 'skills_scan',
      payload,
    })
  })

  it('saves resume scores through the save-activity Edge Function', async () => {
    const payload = {
      overall_score: 78,
      result_data: {},
    }

    const result = await saveResumeScore('user-1', payload)

    expect(result.saved).toBe(true)
    expect(mockInvokeFunction).toHaveBeenCalledWith('save-activity', {
      type: 'resume_score',
      payload,
    })
  })

  it('saves interview sessions through the save-activity Edge Function', async () => {
    const payload = {
      role: 'Software Engineer',
      score: 85,
      questions_count: 5,
    }

    const result = await saveInterviewSession('user-1', payload)

    expect(result.saved).toBe(true)
    expect(mockInvokeFunction).toHaveBeenCalledWith('save-activity', {
      type: 'interview_session',
      payload,
    })
  })
})
