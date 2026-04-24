import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, Mic, FileText, BarChart3,
  ChevronDown, ChevronUp, Clock, Trophy, Target,
  BookOpen, TrendingUp, CheckCircle, XCircle, AlertCircle,
  Tag, Briefcase, Star
} from 'lucide-react'
import Navigation from './Navigation'
import Footer from './ui/Footer'
import { useAuth } from '../contexts/AuthContext'
import { supabase, type ActivityItem } from '../lib/supabase'

type FilterType = 'all' | 'interview' | 'skills_scan' | 'resume_score'

const TYPE_CONFIG = {
  interview: { label: 'Interview', icon: Mic, color: 'bg-purple-100 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400', border: 'border-purple-200 dark:border-purple-500/20', scoreLabel: 'Score' },
  skills_scan: { label: 'Skills Scan', icon: BarChart3, color: 'bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400', border: 'border-blue-200 dark:border-blue-500/20', scoreLabel: 'Match' },
  resume_score: { label: 'Resume', icon: FileText, color: 'bg-green-100 text-green-600 dark:bg-green-500/10 dark:text-green-400', border: 'border-green-200 dark:border-green-500/20', scoreLabel: 'Score' },
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

// ── Score bar ────────────────────────────────────────────────────────────────
function ScoreBar({ label, value, max = 100 }: { label: string; value: number; max?: number }) {
  const pct = Math.min((value / max) * 100, 100)
  const color = pct >= 75 ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-500' : 'bg-red-500'
  return (
    <div>
      <div className="flex justify-between text-xs tracking-tight mb-1.5">
        <span className="text-slate-500 dark:text-zinc-400">{label}</span>
        <span className="font-semibold">{value}<span className="text-slate-400 dark:text-zinc-600">/{max}</span></span>
      </div>
      <div className="h-1.5 bg-slate-200 dark:bg-zinc-800 rounded-full overflow-hidden">
        <motion.div className={`h-full rounded-full ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
        />
      </div>
    </div>
  )
}

// ── Skill tag ────────────────────────────────────────────────────────────────
function SkillTag({ label, variant }: { label: string; variant: 'missing' | 'improve' | 'strong' }) {
  const styles = {
    missing: 'bg-red-50 text-red-600 border-red-200 dark:bg-red-950/50 dark:text-red-400 dark:border-red-900/50',
    improve: 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-900/50',
    strong: 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-900/50',
  }
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg border text-xs font-medium tracking-tight ${styles[variant]}`}>
      {label}
    </span>
  )
}

// ── Priority badge ───────────────────────────────────────────────────────────
function PriorityBadge({ p }: { p: string }) {
  const s = p === 'High'
    ? 'bg-red-100 text-red-600 dark:bg-red-950/60 dark:text-red-400'
    : p === 'Medium'
      ? 'bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400'
      : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400'
  return <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${s}`}>{p}</span>
}

// ── Skills Scan detail ───────────────────────────────────────────────────────
function SkillsScanDetail({ data }: { data: Record<string, unknown> }) {
  const gap = data.gapAnalysis as { missingSkills: string[]; skillsToImprove: string[]; strongSkills: string[] } | undefined
  const career = data.careerPath as { nextSteps: string[]; timelineMonths: number; salaryProjection: string } | undefined
  const recs = data.recommendations as Array<{ skill: string; priority: string; timeToLearn: string }> | undefined

  return (
    <div className="space-y-5">
      {gap && (
        <div>
          <p className="text-xs font-semibold tracking-widest uppercase text-slate-400 dark:text-zinc-500 mb-3">Skills Breakdown</p>
          <div className="grid sm:grid-cols-3 gap-3">
            {[
              { title: 'Missing', skills: gap.missingSkills, variant: 'missing' as const, icon: XCircle, color: 'text-red-500 dark:text-red-400' },
              { title: 'To Improve', skills: gap.skillsToImprove, variant: 'improve' as const, icon: AlertCircle, color: 'text-amber-500 dark:text-amber-400' },
              { title: 'Strong', skills: gap.strongSkills, variant: 'strong' as const, icon: CheckCircle, color: 'text-emerald-500 dark:text-emerald-400' },
            ].map(({ title, skills, variant, icon: Icon, color }) => (
              <div key={title} className="bg-slate-50 dark:bg-zinc-900/60 rounded-xl p-4 border border-slate-200 dark:border-zinc-800">
                <div className={`flex items-center gap-2 mb-3 ${color}`}>
                  <Icon className="h-3.5 w-3.5" />
                  <span className="text-xs font-semibold tracking-tight">{title}</span>
                  <span className="ml-auto text-xs text-slate-400 dark:text-zinc-600">{skills?.length ?? 0}</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(skills ?? []).map((s, i) => <SkillTag key={i} label={s} variant={variant} />)}
                  {(!skills || skills.length === 0) && <span className="text-xs text-slate-400 dark:text-zinc-600">None</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {recs && recs.length > 0 && (
        <div>
          <p className="text-xs font-semibold tracking-widest uppercase text-slate-400 dark:text-zinc-500 mb-3">Top Recommendations</p>
          <div className="space-y-2">
            {recs.slice(0, 3).map((r, i) => (
              <div key={i} className="flex items-center justify-between bg-slate-50 dark:bg-zinc-900/60 rounded-xl px-4 py-3 border border-slate-200 dark:border-zinc-800">
                <div className="flex items-center gap-3">
                  <BookOpen className="h-3.5 w-3.5 text-slate-400 dark:text-zinc-500 flex-shrink-0" />
                  <span className="text-sm font-medium tracking-tight">{r.skill}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 dark:text-zinc-500">{r.timeToLearn}</span>
                  <PriorityBadge p={r.priority} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {career && (
        <div>
          <p className="text-xs font-semibold tracking-widest uppercase text-slate-400 dark:text-zinc-500 mb-3">Career Roadmap</p>
          <div className="bg-slate-50 dark:bg-zinc-900/60 rounded-xl p-4 border border-slate-200 dark:border-zinc-800">
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="text-center">
                <div className="text-2xl font-semibold tracking-tighter">{career.timelineMonths}<span className="text-sm text-slate-400 dark:text-zinc-500 ml-1">mo</span></div>
                <div className="text-xs text-slate-400 dark:text-zinc-500 tracking-tight">Timeline</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-semibold tracking-tight">{career.salaryProjection}</div>
                <div className="text-xs text-slate-400 dark:text-zinc-500 tracking-tight">Salary Projection</div>
              </div>
            </div>
            <div className="space-y-2">
              {career.nextSteps.map((step, i) => (
                <div key={i} className="flex items-start gap-3 text-sm tracking-tight text-slate-600 dark:text-zinc-300">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-slate-200 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 text-xs flex items-center justify-center font-semibold mt-0.5">{i + 1}</span>
                  {step}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Resume detail ────────────────────────────────────────────────────────────
function ResumeDetail({ data }: { data: Record<string, unknown> }) {
  const score = data.score as { overall: number; atsCompatibility: number; relevance: number; formatting: number } | undefined
  const analysis = data.analysis as { strengths: string[]; weaknesses: string[]; missingKeywords: string[] } | undefined
  const actions = data.actionItems as Array<{ priority: string; action: string; impact: string }> | undefined
  const keywords = data.keywords as { missing: string[] } | undefined

  return (
    <div className="space-y-5">
      {score && (
        <div>
          <p className="text-xs font-semibold tracking-widest uppercase text-slate-400 dark:text-zinc-500 mb-3">Score Breakdown</p>
          <div className="bg-slate-50 dark:bg-zinc-900/60 rounded-xl p-4 border border-slate-200 dark:border-zinc-800 space-y-3">
            <ScoreBar label="ATS Compatibility" value={score.atsCompatibility} />
            <ScoreBar label="Relevance" value={score.relevance} />
            <ScoreBar label="Formatting" value={score.formatting} />
          </div>
        </div>
      )}

      {analysis && (
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="bg-slate-50 dark:bg-zinc-900/60 rounded-xl p-4 border border-slate-200 dark:border-zinc-800">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 mb-3">
              <CheckCircle className="h-3.5 w-3.5" />
              <span className="text-xs font-semibold tracking-tight">Strengths</span>
            </div>
            <ul className="space-y-1.5">
              {(analysis.strengths ?? []).map((s, i) => (
                <li key={i} className="text-xs text-slate-600 dark:text-zinc-300 tracking-tight flex items-start gap-2">
                  <Star className="h-3 w-3 text-emerald-500 flex-shrink-0 mt-0.5" />{s}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-slate-50 dark:bg-zinc-900/60 rounded-xl p-4 border border-slate-200 dark:border-zinc-800">
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400 mb-3">
              <XCircle className="h-3.5 w-3.5" />
              <span className="text-xs font-semibold tracking-tight">Weaknesses</span>
            </div>
            <ul className="space-y-1.5">
              {(analysis.weaknesses ?? []).map((s, i) => (
                <li key={i} className="text-xs text-slate-600 dark:text-zinc-300 tracking-tight flex items-start gap-2">
                  <AlertCircle className="h-3 w-3 text-red-500 flex-shrink-0 mt-0.5" />{s}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {actions && actions.length > 0 && (
        <div>
          <p className="text-xs font-semibold tracking-widest uppercase text-slate-400 dark:text-zinc-500 mb-3">Action Items</p>
          <div className="space-y-2">
            {actions.slice(0, 4).map((a, i) => (
              <div key={i} className="bg-slate-50 dark:bg-zinc-900/60 rounded-xl px-4 py-3 border border-slate-200 dark:border-zinc-800">
                <div className="flex items-start justify-between gap-3 mb-1">
                  <p className="text-sm font-medium tracking-tight">{a.action}</p>
                  <PriorityBadge p={a.priority} />
                </div>
                <p className="text-xs text-slate-400 dark:text-zinc-500 tracking-tight">{a.impact}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {keywords?.missing && keywords.missing.length > 0 && (
        <div>
          <p className="text-xs font-semibold tracking-widest uppercase text-slate-400 dark:text-zinc-500 mb-3">Missing Keywords</p>
          <div className="flex flex-wrap gap-2">
            {keywords.missing.map((k, i) => (
              <span key={i} className="flex items-center gap-1.5 px-3 py-1 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/40 text-red-600 dark:text-red-400 text-xs rounded-full font-medium">
                <Tag className="h-3 w-3" />{k}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Interview detail ─────────────────────────────────────────────────────────
function InterviewDetail({ item }: { item: ActivityItem }) {
  const count = (item.data as { questions_count?: number } | null)?.questions_count ?? 0
  const score = item.score ?? 0
  const grade = score >= 85
    ? { label: 'Excellent', color: 'text-emerald-600 dark:text-emerald-400' }
    : score >= 70
      ? { label: 'Good', color: 'text-blue-600 dark:text-blue-400' }
      : score >= 55
        ? { label: 'Average', color: 'text-amber-600 dark:text-amber-400' }
        : { label: 'Needs Work', color: 'text-red-600 dark:text-red-400' }

  return (
    <div className="grid sm:grid-cols-3 gap-4">
      {[
        { label: 'Overall Score', value: `${score}/100`, icon: Trophy, color: 'text-purple-600 dark:text-purple-400' },
        { label: 'Questions', value: count > 0 ? `${count}` : '—', icon: Briefcase, color: 'text-blue-600 dark:text-blue-400' },
        { label: 'Performance', value: grade.label, icon: TrendingUp, color: grade.color },
      ].map(({ label, value, icon: Icon, color }) => (
        <div key={label} className="bg-slate-50 dark:bg-zinc-900/60 rounded-xl p-4 border border-slate-200 dark:border-zinc-800 flex flex-col gap-2">
          <Icon className={`h-4 w-4 ${color}`} />
          <div className={`text-xl font-semibold tracking-tight ${color}`}>{value}</div>
          <div className="text-xs text-slate-400 dark:text-zinc-500 tracking-tight">{label}</div>
        </div>
      ))}
    </div>
  )
}

// ── Main component ───────────────────────────────────────────────────────────
export default function HistoryPage() {
  const { session, loading } = useAuth()
  const [items, setItems] = useState<ActivityItem[]>([])
  const [fetching, setFetching] = useState(true)
  const [filter, setFilter] = useState<FilterType>('all')
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    if (!session?.user) { setFetching(false); return }
    const uid = session.user.id
    const fetchAll = async () => {
      const [interviews, scans, resumes] = await Promise.all([
        supabase.from('interview_sessions').select('*').eq('user_id', uid).order('created_at', { ascending: false }),
        supabase.from('skills_scans').select('*').eq('user_id', uid).order('created_at', { ascending: false }),
        supabase.from('resume_scores').select('*').eq('user_id', uid).order('created_at', { ascending: false }),
      ])
      const all: ActivityItem[] = [
        ...(interviews.data ?? []).map(r => ({ id: r.id, type: 'interview' as const, title: r.role ?? 'Mock Interview', score: r.score, created_at: r.created_at, data: { questions_count: r.questions_count } })),
        ...(scans.data ?? []).map(r => ({ id: r.id, type: 'skills_scan' as const, title: r.target_role ?? 'Skills Scan', score: r.match_percentage, created_at: r.created_at, data: r.skills_data })),
        ...(resumes.data ?? []).map(r => ({ id: r.id, type: 'resume_score' as const, title: 'Resume Optimization', score: r.overall_score, created_at: r.created_at, data: r.result_data })),
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      setItems(all)
      setFetching(false)
    }
    fetchAll()
  }, [session])

  if (loading) return null

  const filtered = filter === 'all' ? items : items.filter(i => i.type === filter)

  const bestInterview = items.filter(i => i.type === 'interview' && i.score).reduce((m, i) => Math.max(m, i.score ?? 0), 0) || null

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-white flex flex-col transition-colors duration-300">
      <Navigation />

      <main className="flex-1 container mx-auto px-4 max-w-4xl pt-32 pb-16">
        {/* Header */}
        <div className="mb-10">
          <Link to="/dashboard" className="inline-flex items-center text-sm text-slate-500 dark:text-zinc-500 hover:text-black dark:hover:text-white mb-6 transition-colors tracking-tight">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
          </Link>
          <h1 className="text-4xl font-semibold tracking-tighter mb-2">Activity History</h1>
          <p className="text-slate-500 dark:text-zinc-400 tracking-tight text-sm">All your sessions, scans, and optimizations.</p>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Total Sessions', value: items.length, icon: Clock },
            { label: 'Best Interview', value: bestInterview !== null ? `${bestInterview}/100` : '—', icon: Trophy },
            { label: 'Scans & Scores', value: items.filter(i => i.type !== 'interview').length, icon: Target },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="sutera-card p-5 flex flex-col gap-3">
              <Icon className="h-4 w-4 text-slate-400 dark:text-zinc-600" />
              <div className="text-2xl font-semibold tracking-tighter">{value}</div>
              <div className="text-xs text-slate-400 dark:text-zinc-500 tracking-tight">{label}</div>
            </div>
          ))}
        </div>

        {/* Filter pills */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {(['all', 'interview', 'skills_scan', 'resume_score'] as FilterType[]).map(key => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium tracking-tight transition-all ${
                filter === key
                  ? 'bg-black dark:bg-white text-white dark:text-black'
                  : 'bg-slate-200 dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 hover:bg-slate-300 dark:hover:bg-zinc-800'
              }`}
            >
              {key === 'all' ? 'All' : key === 'interview' ? 'Interviews' : key === 'skills_scan' ? 'Skills Scans' : 'Resume'}
            </button>
          ))}
        </div>

        {/* Timeline */}
        {fetching ? (
          <div className="flex items-center justify-center py-20 text-slate-400 dark:text-zinc-600 text-sm">Loading history...</div>
        ) : filtered.length === 0 ? (
          <div className="sutera-card p-12 text-center">
            <p className="text-slate-400 dark:text-zinc-500 text-sm tracking-tight">
              {filter === 'all' ? 'No sessions yet. Complete a session to see it here.' : 'No sessions of this type yet.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(item => {
              const cfg = TYPE_CONFIG[item.type]
              const Icon = cfg.icon
              const isOpen = expanded === item.id

              return (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`sutera-card overflow-hidden ${isOpen ? `ring-1 ${cfg.border}` : ''}`}
                >
                  <button
                    type="button"
                    className="w-full flex items-center gap-4 p-5 text-left hover:bg-slate-100 dark:hover:bg-zinc-900/40 transition-colors"
                    onClick={() => setExpanded(isOpen ? null : item.id)}
                  >
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold tracking-tight truncate">{item.title}</p>
                      <p className="text-xs text-slate-400 dark:text-zinc-500 tracking-tight mt-0.5">
                        {cfg.label} · {formatDate(item.created_at)}
                      </p>
                    </div>
                    {item.score !== null && (
                      <div className="text-right flex-shrink-0 mr-2">
                        <span className="text-xl font-semibold tracking-tighter">{item.score}</span>
                        <span className="text-xs text-slate-400 dark:text-zinc-600">/100</span>
                        <p className="text-xs text-slate-400 dark:text-zinc-600 tracking-tight">{cfg.scoreLabel}</p>
                      </div>
                    )}
                    {isOpen
                      ? <ChevronUp className="h-4 w-4 text-slate-400 dark:text-zinc-500 flex-shrink-0" />
                      : <ChevronDown className="h-4 w-4 text-slate-400 dark:text-zinc-500 flex-shrink-0" />
                    }
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                        className="border-t border-slate-200 dark:border-zinc-800"
                      >
                        <div className="p-5">
                          {item.type === 'skills_scan' && item.data && (
                            <SkillsScanDetail data={item.data as Record<string, unknown>} />
                          )}
                          {item.type === 'resume_score' && item.data && (
                            <ResumeDetail data={item.data as Record<string, unknown>} />
                          )}
                          {item.type === 'interview' && (
                            <InterviewDetail item={item} />
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )
            })}
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
