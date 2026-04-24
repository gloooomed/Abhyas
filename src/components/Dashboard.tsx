import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { BarChart3, Mic, FileText, ArrowRight, History, TrendingUp, Trophy, Target, Layers } from 'lucide-react'
import Navigation from './Navigation'
import Footer from './ui/Footer'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
}
const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 }
} as const

interface DashboardStats {
  totalSessions: number
  bestInterviewScore: number | null
  latestSkillsMatch: number | null
  latestResumeScore: number | null
  interviewScores: number[]
  recentActivity: RecentItem[]
}

interface RecentItem {
  id: string
  type: 'interview' | 'skills_scan' | 'resume_score'
  title: string
  score: number | null
  created_at: string
}

// ── Sparkline ────────────────────────────────────────────────────────────────
function Sparkline({ scores }: { scores: number[] }) {
  if (scores.length < 2) return null
  const w = 120, h = 36
  const pts = scores.map((s, i) => {
    const x = (i / (scores.length - 1)) * w
    const y = h - (s / 100) * h
    return `${x},${y}`
  })
  const fillPath = `M ${pts[0]} L ${pts.slice(1).join(' L ')} L ${w},${h} L 0,${h} Z`

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <defs>
        <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.25" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path d={fillPath} fill="url(#sg)" className="text-slate-800 dark:text-white" />
      <polyline points={pts.join(' ')} fill="none" stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round" className="text-slate-800 dark:text-white" />
    </svg>
  )
}

// ── Score ring ───────────────────────────────────────────────────────────────
function ScoreRing({ score, size = 64 }: { score: number | null; size?: number }) {
  const r = (size - 8) / 2
  const circ = 2 * Math.PI * r
  const pct = score !== null ? score / 100 : 0
  const color = score === null ? undefined : score >= 75 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444'

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor"
        strokeWidth="4" className="text-slate-200 dark:text-zinc-800" />
      {score !== null && color && (
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="4"
          strokeDasharray={`${circ * pct} ${circ}`} strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`} />
      )}
      <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle"
        fontSize="11" fontWeight="600" fill={score !== null ? 'currentColor' : '#a1a1aa'} className="text-slate-800 dark:text-white">
        {score !== null ? score : '—'}
      </text>
    </svg>
  )
}

// ── Activity type config ─────────────────────────────────────────────────────
const TYPE_COLORS: Record<string, string> = {
  interview: 'bg-purple-100 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400',
  skills_scan: 'bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400',
  resume_score: 'bg-green-100 text-green-600 dark:bg-green-500/10 dark:text-green-400',
}
const TYPE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  interview: Mic, skills_scan: BarChart3, resume_score: FileText,
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

// ── Main component ───────────────────────────────────────────────────────────
export default function Dashboard() {
  const { session, profile, loading } = useAuth()
  const [stats, setStats] = useState<DashboardStats>({
    totalSessions: 0, bestInterviewScore: null, latestSkillsMatch: null,
    latestResumeScore: null, interviewScores: [], recentActivity: [],
  })
  const [statsLoading, setStatsLoading] = useState(true)

  const firstName = profile?.full_name?.split(' ')[0] ?? session?.user?.email?.split('@')[0] ?? 'there'

  useEffect(() => {
    if (!session?.user) { setStatsLoading(false); return }
    const uid = session.user.id
    const fetch = async () => {
      const [interviews, scans, resumes] = await Promise.all([
        supabase.from('interview_sessions').select('id,role,score,created_at').eq('user_id', uid).order('created_at', { ascending: false }),
        supabase.from('skills_scans').select('id,target_role,match_percentage,created_at').eq('user_id', uid).order('created_at', { ascending: false }),
        supabase.from('resume_scores').select('id,overall_score,created_at').eq('user_id', uid).order('created_at', { ascending: false }),
      ])
      const intData = interviews.data ?? []
      const scanData = scans.data ?? []
      const resData = resumes.data ?? []
      const scores = intData.map(r => r.score).filter(Boolean) as number[]

      const recent: RecentItem[] = [
        ...intData.slice(0, 4).map(r => ({ id: r.id, type: 'interview' as const, title: r.role ?? 'Mock Interview', score: r.score, created_at: r.created_at })),
        ...scanData.slice(0, 4).map(r => ({ id: r.id, type: 'skills_scan' as const, title: r.target_role ?? 'Skills Scan', score: r.match_percentage, created_at: r.created_at })),
        ...resData.slice(0, 4).map(r => ({ id: r.id, type: 'resume_score' as const, title: 'Resume Optimization', score: r.overall_score, created_at: r.created_at })),
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 5)

      setStats({
        totalSessions: intData.length + scanData.length + resData.length,
        bestInterviewScore: scores.length ? Math.max(...scores) : null,
        latestSkillsMatch: scanData[0]?.match_percentage ?? null,
        latestResumeScore: resData[0]?.overall_score ?? null,
        interviewScores: scores.slice(0, 6).reverse(),
        recentActivity: recent,
      })
      setStatsLoading(false)
    }
    fetch()
  }, [session])

  if (loading) return null

  const features = [
    { title: 'Skills Gap Analysis', description: 'Find out exactly which skills you need for your target role.', icon: BarChart3, path: '/skills-analysis', accent: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-500/10 border-blue-100 dark:border-blue-500/20' },
    { title: 'AI Mock Interview', description: 'Practice with an AI interviewer and get honest, scored feedback.', icon: Mic, path: '/mock-interview', accent: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-500/10 border-purple-100 dark:border-purple-500/20' },
    { title: 'Resume Optimizer', description: 'ATS-ready resume with better keywords and stronger phrasing.', icon: FileText, path: '/resume-optimizer', accent: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-500/10 border-green-100 dark:border-green-500/20' },
  ]

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-white flex flex-col transition-colors duration-300">
      <Navigation />

      <main className="flex-1 container mx-auto px-4 max-w-7xl pt-32 pb-16">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mb-12">
          <h1 className="text-5xl md:text-6xl font-semibold tracking-tighter mb-3">Hey, {firstName}.</h1>
          <p className="text-lg text-slate-500 dark:text-zinc-400 tracking-tight">Here's your career prep overview.</p>
        </motion.div>

        <motion.div className="space-y-6" variants={containerVariants} initial="hidden" animate="visible">

          {/* ── Row 1: Stats + Activity ─────────────────────────────────── */}
          <div className="grid lg:grid-cols-3 gap-6">

            {/* Stats panel */}
            <motion.div variants={itemVariants} className="lg:col-span-2 sutera-card p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold tracking-tight">Your Progress</h2>
                <TrendingUp className="h-4 w-4 text-slate-400 dark:text-zinc-600" />
              </div>

              {/* 4 stat tiles */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                {[
                  { label: 'Total Sessions', value: statsLoading ? '—' : stats.totalSessions, icon: Layers, sub: 'all modules' },
                  { label: 'Best Interview', value: statsLoading ? '—' : stats.bestInterviewScore !== null ? `${stats.bestInterviewScore}` : '—', icon: Trophy, sub: '/100 score' },
                  { label: 'Skills Match', value: statsLoading ? '—' : stats.latestSkillsMatch !== null ? `${stats.latestSkillsMatch}%` : '—', icon: Target, sub: 'last scan' },
                  { label: 'Resume Score', value: statsLoading ? '—' : stats.latestResumeScore !== null ? `${stats.latestResumeScore}` : '—', icon: FileText, sub: '/100' },
                ].map(({ label, value, icon: Icon, sub }) => (
                  <div key={label} className="bg-slate-100 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 flex flex-col gap-2">
                    <Icon className="h-4 w-4 text-slate-400 dark:text-zinc-500" />
                    <div>
                      <div className="text-2xl font-semibold tracking-tighter">{value}</div>
                      <div className="text-xs text-slate-500 dark:text-zinc-500 tracking-tight">{sub}</div>
                    </div>
                    <div className="text-xs text-slate-400 dark:text-zinc-600 tracking-tight mt-auto">{label}</div>
                  </div>
                ))}
              </div>

              {/* Module score rings */}
              <div className="border-t border-slate-200 dark:border-zinc-800 pt-5">
                <p className="text-xs font-semibold tracking-widest uppercase text-slate-400 dark:text-zinc-500 mb-4">Module Scores</p>
                <div className="flex items-center justify-around">
                  {[
                    { label: 'Interview', score: stats.bestInterviewScore, sub: 'Best score' },
                    { label: 'Skills', score: stats.latestSkillsMatch, sub: 'Last match' },
                    { label: 'Resume', score: stats.latestResumeScore, sub: 'Last score' },
                  ].map(({ label, score, sub }) => (
                    <div key={label} className="flex flex-col items-center gap-2">
                      <ScoreRing score={statsLoading ? null : score} size={64} />
                      <div className="text-center">
                        <div className="text-xs font-semibold tracking-tight">{label}</div>
                        <div className="text-xs text-slate-400 dark:text-zinc-600">{sub}</div>
                      </div>
                    </div>
                  ))}

                  {stats.interviewScores.length >= 2 && (
                    <div className="flex flex-col items-center gap-2">
                      <Sparkline scores={stats.interviewScores} />
                      <div className="text-center">
                        <div className="text-xs font-semibold tracking-tight">Trend</div>
                        <div className="text-xs text-slate-400 dark:text-zinc-600">{stats.interviewScores.length} sessions</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Recent activity panel */}
            <motion.div variants={itemVariants} className="sutera-card p-6 flex flex-col">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-semibold tracking-tight">Recent Activity</h2>
                <Link to="/history" className="text-xs text-slate-400 dark:text-zinc-500 hover:text-black dark:hover:text-white transition-colors flex items-center gap-1 tracking-tight">
                  <History className="h-3.5 w-3.5" /> All
                </Link>
              </div>

              {statsLoading ? (
                <div className="flex-1 flex items-center justify-center text-slate-400 dark:text-zinc-600 text-sm">Loading...</div>
              ) : stats.recentActivity.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center py-4">
                  <p className="text-slate-400 dark:text-zinc-600 text-sm tracking-tight">No sessions yet.</p>
                  <p className="text-slate-300 dark:text-zinc-700 text-xs mt-1">Complete any module to see it here.</p>
                </div>
              ) : (
                <div className="space-y-2 flex-1">
                  {stats.recentActivity.map((item) => {
                    const Icon = TYPE_ICONS[item.type]
                    return (
                      <div key={item.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-100 dark:bg-zinc-900/50 hover:bg-slate-200 dark:hover:bg-zinc-900 transition-colors">
                        <div className={`h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0 ${TYPE_COLORS[item.type]}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold tracking-tight truncate">{item.title}</p>
                          <p className="text-xs text-slate-400 dark:text-zinc-600">{timeAgo(item.created_at)}</p>
                        </div>
                        {item.score !== null && (
                          <span className="text-xs font-semibold flex-shrink-0">
                            {item.score}<span className="text-slate-400 dark:text-zinc-600 font-normal">/100</span>
                          </span>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}

              {stats.recentActivity.length > 0 && (
                <Link to="/history" className="mt-4 w-full py-2.5 text-xs font-medium tracking-tight text-center rounded-xl border border-slate-200 dark:border-zinc-800 hover:border-slate-400 dark:hover:border-zinc-600 transition-colors text-slate-500 dark:text-zinc-400 hover:text-black dark:hover:text-white flex items-center justify-center gap-2">
                  <History className="h-3.5 w-3.5" /> View full history
                </Link>
              )}
            </motion.div>
          </div>

          {/* ── Row 2: Modules ──────────────────────────────────────────── */}
          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature, idx) => (
              <motion.div key={idx} variants={itemVariants}>
                <Link to={feature.path} className="block h-full group">
                  <div className="sutera-card h-full p-8 flex flex-col transition-all duration-300 hover:shadow-md">
                    <div className={`h-10 w-10 rounded-xl border flex items-center justify-center mb-6 transition-colors ${feature.bg} ${feature.accent}`}>
                      <feature.icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-base font-semibold tracking-tight mb-2 group-hover:underline decoration-1 underline-offset-4">{feature.title}</h3>
                    <p className="text-sm text-slate-500 dark:text-zinc-500 leading-relaxed mb-6 flex-grow">{feature.description}</p>
                    <div className="mt-auto flex items-center text-xs font-medium tracking-tight text-slate-400 dark:text-zinc-600 group-hover:text-black dark:group-hover:text-white transition-colors">
                      Open <ArrowRight className="h-3.5 w-3.5 ml-1 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

        </motion.div>
      </main>
      <Footer />
    </div>
  )
}
