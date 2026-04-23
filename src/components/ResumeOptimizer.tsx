import { useState } from 'react'
import { UserButton, useAuth, useClerk } from '@clerk/clerk-react'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Upload, FileText, AlertCircle, Loader2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { optimizeResume } from '../lib/gemini'
import Navigation from './Navigation'
import Footer from './ui/Footer'

interface OptimizationResult {
  analysis: { atsScore: number; strengths: string[]; weaknesses: string[]; missingKeywords: string[]; formatIssues: string[] }
  optimizations: Array<{ section: string; current: string; improved: string; reasoning: string }>
  keywords: { missing: string[]; suggested: string[]; density: string }
  actionItems: Array<{ priority: 'High' | 'Medium' | 'Low'; action: string; impact: string }>
  score: { overall: number; atsCompatibility: number; relevance: number; formatting: number }
}

export default function ResumeOptimizer() {
  const { isSignedIn } = useAuth()
  const { redirectToSignIn } = useClerk()
  const [file, setFile] = useState<File | null>(null)
  const [jobDescription, setJobDescription] = useState('')
  const [targetRole, setTargetRole] = useState('')
  const [resumeText, setResumeText] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState<OptimizationResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [usingMockData, setUsingMockData] = useState(false)
  const [quotaExceeded, setQuotaExceeded] = useState(false)

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = event.target.files?.[0]
    if (uploadedFile) {
      const maxSize = 10 * 1024 * 1024
      if (uploadedFile.size > maxSize) { setError('File size must be less than 10MB'); setFile(null); event.target.value = ''; return }
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']
      const fileName = uploadedFile.name.toLowerCase()
      const hasValidExtension = fileName.endsWith('.pdf') || fileName.endsWith('.doc') || fileName.endsWith('.docx') || fileName.endsWith('.txt')
      if (allowedTypes.includes(uploadedFile.type) || hasValidExtension) {
        setFile(uploadedFile); setError(null)
        if (uploadedFile.type === 'text/plain' || fileName.endsWith('.txt')) {
          const reader = new FileReader()
          reader.onload = (e) => { const content = e.target?.result as string; if (content) setResumeText(content) }
          reader.onerror = () => setError('Failed to read the text file. Please try again.')
          reader.readAsText(uploadedFile)
        } else { if (!resumeText.trim()) setError('File uploaded! Please also paste your resume text below for analysis.') }
      } else { setError('Please upload a PDF, Word document, or text file (.pdf, .doc, .docx, .txt)'); setFile(null); event.target.value = '' }
    }
  }

  const analyzeResume = async () => {
    if (!resumeText.trim() && !file) { setError('Please upload a resume file or paste your resume text'); return }
    if (!targetRole.trim()) { setError('Please specify your target role'); return }
    if (!isSignedIn) { redirectToSignIn(); return }
    setIsAnalyzing(true); setError(null)
    try {
      const textToAnalyze = resumeText || 'Resume content from uploaded file'
      const optimization = await optimizeResume(textToAnalyze, targetRole, jobDescription)
      setResult(optimization)
      setUsingMockData(false)
      setQuotaExceeded(false)
    } catch (err) {
      const e = err as { message?: string; status?: number }
      const isQuota = e.status === 429 || Boolean(e.message?.includes("429")) || Boolean(e.message?.includes("quota"))
      setUsingMockData(true)
      setQuotaExceeded(isQuota)
      setError(null)
      setResult({
        analysis: { atsScore: 78, strengths: ['Strong technical skills', 'Clear work experience', 'Quantified achievements'], weaknesses: ['Missing keywords for target role', 'Could improve summary section'], missingKeywords: ['React', 'TypeScript', 'Agile', 'Cloud Computing'], formatIssues: ['Inconsistent bullet formatting'] },
        optimizations: [{ section: 'Professional Summary', current: 'Software developer with experience...', improved: 'Results-driven Software Engineer with 3+ years of experience developing scalable web applications using React and Node.js...', reasoning: 'More specific and quantified, includes key technologies' }],
        keywords: { missing: ['React', 'TypeScript', 'Agile', 'Cloud Computing'], suggested: ['Add "React" to skills section', 'Include "TypeScript" in project descriptions'], density: 'Current keyword density: 12%. Recommended: 18-22%' },
        actionItems: [{ priority: 'High', action: 'Add missing technical keywords to skills section', impact: 'Improve ATS compatibility by 15-20%' }, { priority: 'Medium', action: 'Quantify achievements with specific metrics', impact: 'Increase recruiter engagement by 25%' }],
        score: { overall: 78, atsCompatibility: 72, relevance: 85, formatting: 76 }
      })
    } finally { setIsAnalyzing(false) }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400'
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-red-600 dark:text-red-400'
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400'
      case 'Medium': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400'
      case 'Low': return 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400'
      default: return 'bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300'
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white flex flex-col transition-colors duration-300">
      <Navigation showUserButton={isSignedIn} userButtonComponent={<UserButton afterSignOutUrl="/" />} />

      <main className="flex-1 container mx-auto px-4 max-w-7xl pt-32 pb-16">
        <div className="mb-12">
          <Link to={isSignedIn ? "/dashboard" : "/"} className="inline-flex items-center text-sm text-slate-500 dark:text-zinc-500 hover:text-black dark:hover:text-white mb-6 transition-colors tracking-tight">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {isSignedIn ? "Back to Dashboard" : "Back to Home"}
          </Link>
          <div className="flex items-center space-x-4 mb-4">
            <div className="h-12 w-12 rounded-2xl bg-black dark:bg-white flex items-center justify-center flex-shrink-0">
              <FileText className="h-6 w-6 text-white dark:text-black" />
            </div>
            <div>
              <h1 className="text-4xl font-semibold tracking-tighter">Resume Optimizer</h1>
              <p className="text-slate-500 dark:text-zinc-400 tracking-tight">Get AI-powered optimization and ATS scoring for your resume.</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Left: Upload & Input */}
          <div className="space-y-6">
            <div className="sutera-card p-8">
              <h2 className="text-xl font-semibold tracking-tight mb-6">Upload Resume</h2>
              <div className="border-2 border-dashed border-slate-200 dark:border-zinc-700 rounded-2xl p-8 text-center hover:border-black dark:hover:border-white transition-colors group">
                <input type="file" accept=".pdf,.doc,.docx,.txt,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain" onChange={handleFileUpload} className="hidden" id="resume-upload" />
                <label htmlFor="resume-upload" className="cursor-pointer block">
                  <Upload className="h-10 w-10 text-slate-300 dark:text-zinc-600 mx-auto mb-4 group-hover:text-black dark:group-hover:text-white transition-colors" />
                  {file ? (
                    <div>
                      <p className="text-sm font-medium tracking-tight mb-1">{file.name}</p>
                      <p className="text-xs text-slate-500 dark:text-zinc-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm font-medium tracking-tight mb-1">Drop your resume here</p>
                      <p className="text-xs text-slate-500 dark:text-zinc-500">PDF, DOC, DOCX, TXT — Max 10MB</p>
                    </div>
                  )}
                </label>
              </div>
              {file && (
                <button onClick={() => { setFile(null); const fi = document.getElementById('resume-upload') as HTMLInputElement; if (fi) fi.value = ''; }} className="mt-3 text-xs text-red-500 hover:text-red-700 transition-colors tracking-tight w-full text-center">
                  Remove file
                </button>
              )}
              <div className="mt-6">
                <label className="block text-sm font-medium tracking-tight text-slate-700 dark:text-zinc-300 mb-2">Or paste resume text</label>
                <textarea rows={6} className="w-full sutera-input" placeholder="Paste your resume content here..." value={resumeText} onChange={(e) => setResumeText(e.target.value)} />
              </div>
            </div>

            <div className="sutera-card p-8">
              <h2 className="text-xl font-semibold tracking-tight mb-6">Target Role</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium tracking-tight text-slate-700 dark:text-zinc-300 mb-2">Target Role *</label>
                  <input type="text" className="w-full sutera-input" placeholder="e.g., Senior Software Engineer..." value={targetRole} onChange={(e) => setTargetRole(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium tracking-tight text-slate-700 dark:text-zinc-300 mb-2">
                    Job Description <span className="text-slate-400 dark:text-zinc-600 font-normal">(Optional)</span>
                  </label>
                  <textarea rows={5} className="w-full sutera-input" placeholder="Paste the job description for better keyword matching..." value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} />
                </div>
              </div>
            </div>

            {error && (
              <div className="sutera-card p-5 flex items-center space-x-3">
                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                <p className="text-sm text-red-600 dark:text-red-400 tracking-tight">{error}</p>
              </div>
            )}

            <Button onClick={analyzeResume} disabled={(!file && !resumeText.trim()) || !targetRole.trim() || isAnalyzing} className="w-full sutera-button py-3 h-auto disabled:opacity-40">
              {isAnalyzing ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Analyzing with AI...</> : "Optimize Resume"}
            </Button>
          </div>

          {/* Right: Results */}
          <div className="space-y-6">
            {/* Quota / Mock Data Banner */}
            {usingMockData && (
              <div className={`p-5 flex items-start gap-3 rounded-2xl border ${
                quotaExceeded
                  ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800'
                  : 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800'
              }`}>
                <AlertCircle className={`h-5 w-5 flex-shrink-0 mt-0.5 ${
                  quotaExceeded ? 'text-amber-500' : 'text-blue-500'
                }`} />
                <div>
                  <p className={`text-sm font-semibold tracking-tight ${
                    quotaExceeded ? 'text-amber-800 dark:text-amber-300' : 'text-blue-800 dark:text-blue-300'
                  }`}>
                    {quotaExceeded ? 'AI Quota Exceeded — Showing Sample Analysis' : 'Showing Sample Analysis'}
                  </p>
                  <p className={`text-xs tracking-tight mt-1 ${
                    quotaExceeded ? 'text-amber-700 dark:text-amber-400' : 'text-blue-700 dark:text-blue-400'
                  }`}>
                    {quotaExceeded
                      ? 'Your Gemini API key has hit its daily free-tier limit. The results below are sample data, not based on your actual resume. Update your API key in .env.local or wait until the quota resets.'
                      : 'The AI could not analyse your resume and returned sample data. Results may not reflect your actual resume.'}
                  </p>
                </div>
              </div>
            )}

            {result ? (
              <>
                <div className="sutera-card p-8">
                  <h3 className="text-lg font-semibold tracking-tight mb-6">Resume Score</h3>
                  <div className="text-center mb-8">
                    <div className={`text-6xl font-semibold tracking-tighter mb-2 ${getScoreColor(result.score.overall)}`}>{result.score.overall}</div>
                    <div className="text-sm text-slate-500 dark:text-zinc-500 tracking-tight">out of 100</div>
                    <div className="text-sm font-medium mt-2 tracking-tight">{result.score.overall >= 80 ? 'Excellent!' : result.score.overall >= 60 ? 'Good — can improve' : 'Needs improvement'}</div>
                  </div>
                  <div className="space-y-3">
                    {[{ label: 'ATS Compatibility', val: result.score.atsCompatibility }, { label: 'Relevance', val: result.score.relevance }, { label: 'Formatting', val: result.score.formatting }].map(({ label, val }) => (
                      <div key={label}>
                        <div className="flex justify-between text-xs tracking-tight mb-1">
                          <span className="text-slate-500 dark:text-zinc-500">{label}</span>
                          <span className="font-semibold">{val}/100</span>
                        </div>
                        <div className="h-1.5 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                          <div className="h-full bg-black dark:bg-white rounded-full transition-all duration-700" style={{ width: `${val}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="sutera-card p-8">
                  <h3 className="text-lg font-semibold tracking-tight mb-6">Action Items</h3>
                  <div className="space-y-4">
                    {result.actionItems.map((item, i) => (
                      <div key={i} className="border-b border-slate-100 dark:border-zinc-800 pb-4 last:border-0 last:pb-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-medium tracking-tight">{item.action}</p>
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ml-3 ${getPriorityColor(item.priority)}`}>{item.priority}</span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-zinc-500 tracking-tight">{item.impact}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="sutera-card p-8">
                  <h3 className="text-lg font-semibold tracking-tight mb-6">Keyword Analysis</h3>
                  <div className="space-y-6">
                    <div>
                      <p className="text-xs font-semibold tracking-widest uppercase text-slate-500 dark:text-zinc-500 mb-3">Missing Keywords</p>
                      <div className="flex flex-wrap gap-2">
                        {(result.keywords.missing?.length ? result.keywords.missing : ['None identified']).map((kw, i) => (
                          <span key={i} className="px-3 py-1 bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-400 text-xs rounded-full font-medium">{kw}</span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-semibold tracking-widest uppercase text-slate-500 dark:text-zinc-500 mb-3">Suggestions</p>
                      <div className="space-y-2">
                        {result.keywords.suggested?.map((s, i) => (
                          <p key={i} className="text-sm text-slate-600 dark:text-zinc-400 tracking-tight">→ {s}</p>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="sutera-card p-12 text-center">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-zinc-900 flex items-center justify-center mx-auto mb-6">
                  <FileText className="h-8 w-8 text-slate-400 dark:text-zinc-500" />
                </div>
                <p className="text-slate-500 dark:text-zinc-500 tracking-tight">Upload your resume and target role to get AI-powered optimization.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}