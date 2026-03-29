import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ArrowRight, BarChart3, Mic, FileText, CheckCircle, Send, MessageCircle } from 'lucide-react'
import Navigation from './Navigation'
import Footer from './ui/Footer'
import { motion } from 'framer-motion'
import { useAuth } from '@clerk/clerk-react'

// Stagger variants for the heroic text reveal
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    }
  }
}

const itemVariants = {
  hidden: { y: 40, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { stiffness: 100, damping: 20 }
  }
}

function MockInterviewSnapshot() {
  const messages = [
    { id: 1, type: 'interviewer', content: "Hello! I'm your AI interview coach. Let's begin your mock interview for the Software Engineer position:" },
    { id: 2, type: 'interviewer', content: "Tell me about a time you had to debug a particularly tricky production issue. Walk me through your process." },
    { id: 3, type: 'candidate', content: "Sure! At my last role we had a memory leak in our Node.js service causing pods to OOM-crash every few hours. I started by checking our APM dashboards, then narrowed it down using heap snapshots..." },
    { id: 4, type: 'interviewer', content: "Great use of tooling. Can you quantify the impact of the fix? Interviewers love measurable outcomes." },
  ]

  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-3 select-none pointer-events-none">
      {/* Main chat panel */}
      <div className="md:col-span-2 sutera-card overflow-hidden flex flex-col" style={{ height: 380 }}>
        {/* Panel header */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold tracking-tight">Interview Session</p>
            <p className="text-xs text-slate-500 dark:text-zinc-500 tracking-tight">Question 2 of 5</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs text-slate-500 dark:text-zinc-500 tracking-tight">Live</span>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-hidden p-5 space-y-3">
          {messages.map((m) => (
            <div key={m.id} className={`flex ${m.type === 'candidate' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-xs tracking-tight leading-relaxed
                ${m.type === 'candidate'
                  ? 'bg-black dark:bg-white text-white dark:text-black'
                  : 'bg-slate-100 dark:bg-zinc-900 text-black dark:text-white'}`}>
                {m.content}
              </div>
            </div>
          ))}
        </div>

        {/* Input bar */}
        <div className="px-5 py-4 border-t border-slate-100 dark:border-zinc-800">
          <div className="flex gap-3">
            <div className="flex-1 sutera-input text-xs text-slate-400 dark:text-zinc-500 flex items-center px-3 py-2.5 rounded-2xl">
              Type your response…
            </div>
            <div className="sutera-button px-4 py-2.5 rounded-full flex items-center justify-center">
              <Send className="h-4 w-4" />
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar — hidden on mobile */}
      <div className="hidden md:flex flex-col space-y-3">
        {/* Progress */}
        <div className="sutera-card p-5">
          <p className="text-xs font-semibold tracking-tight mb-3">Progress</p>
          <div className="flex justify-between text-xs text-slate-500 dark:text-zinc-500 tracking-tight mb-2">
            <span>Questions</span><span>2 / 5</span>
          </div>
          <div className="w-full h-1.5 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
            <div className="h-full bg-black dark:bg-white rounded-full" style={{ width: '40%' }} />
          </div>
        </div>

        {/* Tips */}
        <div className="sutera-card p-5 flex-1">
          <p className="text-xs font-semibold tracking-tight mb-3">Interview Tips</p>
          <ul className="space-y-2 text-xs text-slate-500 dark:text-zinc-400 tracking-tight">
            <li>• Use the STAR method</li>
            <li>• Back answers with examples</li>
            <li>• Ask clarifying questions</li>
            <li>• Quantify your impact</li>
          </ul>
        </div>

        {/* Mode badge */}
        <div className="sutera-card p-4 flex items-center gap-3">
          <div className="h-8 w-8 rounded-xl bg-black dark:bg-white flex items-center justify-center flex-shrink-0">
            <MessageCircle className="h-4 w-4 text-white dark:text-black" />
          </div>
          <div>
            <p className="text-xs font-semibold tracking-tight">Text Mode</p>
            <p className="text-xs text-slate-500 dark:text-zinc-500 tracking-tight">Intermediate</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function LandingPage() {
  const { isSignedIn } = useAuth()

  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black">
      <Navigation />

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center pt-24 pb-16 px-4 overflow-hidden">
        {/* Extreme minimal glow effect behind header */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-slate-100 dark:bg-white/[0.02] rounded-full blur-[120px] pointer-events-none" />

        {/* Dot grid — fades to center horizontally & to bottom vertically */}
        <div className="absolute inset-0 pointer-events-none hero-dot-grid" />

        <div className="container mx-auto max-w-7xl relative z-10">
          <motion.div
            className="text-center max-w-4xl mx-auto"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={itemVariants} className="mb-4 inline-flex items-center space-x-2 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 px-4 py-1.5 rounded-full">
              <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_6px_2px_rgba(34,197,94,0.6)]" />
              <span className="text-sm font-medium tracking-tight">Your AI Career Advisor</span>
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="text-6xl md:text-8xl font-semibold tracking-tighter mb-8 leading-[1.05]"
            >
              Career <br className="hidden md:block" /> By Design.
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="text-xl md:text-2xl text-slate-500 dark:text-zinc-400 mb-12 max-w-2xl mx-auto font-medium tracking-tight leading-relaxed"
            >
              Land the job you actually want. Abhyas helps you close skill gaps, ace interviews, and make your resume stand out - all in one place.
            </motion.p>

            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-center items-center gap-4">
              <Link to={isSignedIn ? "/dashboard" : "/sign-up"}>
                <Button className="sutera-button px-8 py-6 text-lg h-auto flex items-center gap-2">
                  Get Started Free
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>


      {/* Strict Grid Features Section */}
      <section className="py-32 px-4 bg-slate-50 dark:bg-zinc-950/50 border-t border-slate-200 dark:border-white/5">
        <div className="container mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center mb-24"
          >
            <h2 className="text-4xl md:text-5xl font-semibold tracking-tighter mb-4">Everything you need to get hired.</h2>
            <p className="text-xl text-slate-500 dark:text-zinc-400 max-w-2xl mx-auto">Three powerful tools, one focused goal - helping you show up prepared and land the role you're after.</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              whileHover={{ y: -5 }}
              className="sutera-card p-10 flex flex-col items-start text-left"
            >
              <div className="h-14 w-14 rounded-2xl bg-black dark:bg-white flex items-center justify-center mb-8">
                <BarChart3 className="h-7 w-7 text-white dark:text-black" />
              </div>
              <h3 className="text-2xl font-semibold tracking-tight mb-4">Skills Gap Analysis</h3>
              <p className="text-slate-500 dark:text-zinc-400 leading-relaxed mb-8 flex-grow">
                Tell us where you are and where you want to be. We'll map out exactly what skills you're missing and what to learn first.
              </p>
            </motion.div>

            <motion.div
              whileHover={{ y: -5 }}
              className="sutera-card p-10 flex flex-col items-start text-left"
            >
              <div className="h-14 w-14 rounded-2xl bg-black dark:bg-white flex items-center justify-center mb-8">
                <Mic className="h-7 w-7 text-white dark:text-black" />
              </div>
              <h3 className="text-2xl font-semibold tracking-tight mb-4">AI Mock Interviews</h3>
              <p className="text-slate-500 dark:text-zinc-400 leading-relaxed mb-8 flex-grow">
                Practice with an AI that pushes back. Get real feedback on your answers, pacing, and structure - just like the real thing.
              </p>
            </motion.div>

            <motion.div
              whileHover={{ y: -5 }}
              className="sutera-card p-10 flex flex-col items-start text-left"
            >
              <div className="h-14 w-14 rounded-2xl bg-black dark:bg-white flex items-center justify-center mb-8">
                <FileText className="h-7 w-7 text-white dark:text-black" />
              </div>
              <h3 className="text-2xl font-semibold tracking-tight mb-4">Resume Optimizer</h3>
              <p className="text-slate-500 dark:text-zinc-400 leading-relaxed mb-8 flex-grow">
                Upload your resume and a job description. We'll rewrite the weak parts, add the right keywords, and make sure it actually gets through ATS filters.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section className="py-32 px-4 border-t border-slate-200 dark:border-white/5">
        <div className="container mx-auto max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl md:text-6xl font-semibold tracking-tighter mb-8 leading-tight">
                Built for people who <br />take careers seriously.
              </h2>
              <ul className="space-y-6">
                {[
                  "Know exactly which skills to learn for your target role.",
                  "Practice interviews until you're genuinely confident.",
                  "Submit a resume that actually gets callbacks.",
                ].map((text, i) => (
                  <li key={i} className="flex items-center space-x-4 text-lg text-slate-600 dark:text-zinc-300 tracking-tight">
                    <CheckCircle className="h-6 w-6 text-black dark:text-white flex-shrink-0" />
                    <span>{text}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              className="relative flex items-center justify-center"
            >
              {/* Ambient glow behind the card */}
              <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,rgba(88,166,255,0.12)_0%,transparent_70%)] blur-2xl" />
              <MockInterviewSnapshot />
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}