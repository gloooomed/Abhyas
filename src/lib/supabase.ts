import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env.local file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Profile {
  id: string
  email: string | null
  full_name: string | null
  avatar_url: string | null
  created_at: string
}

export interface InterviewSession {
  id: string
  user_id: string
  role: string | null
  score: number | null
  questions_count: number | null
  created_at: string
}

export interface SkillsScan {
  id: string
  user_id: string
  target_role: string | null
  match_percentage: number | null
  skills_data: Record<string, unknown> | null
  created_at: string
}

export interface ResumeScore {
  id: string
  user_id: string
  overall_score: number | null
  result_data: Record<string, unknown> | null
  created_at: string
}

export type ActivityType = 'interview' | 'skills_scan' | 'resume_score'

export interface ActivityItem {
  id: string
  type: ActivityType
  title: string
  score: number | null
  created_at: string
  data: Record<string, unknown> | null
}
