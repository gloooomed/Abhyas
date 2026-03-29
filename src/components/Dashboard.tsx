import { useUser } from '@clerk/clerk-react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { BarChart3, Mic, FileText, ArrowRight, TrendingUp } from 'lucide-react'
import Navigation from './Navigation'
import Footer from './ui/Footer'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
}

const scaleVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { stiffness: 100, damping: 20 }
  }
}

export default function Dashboard() {
  const { user, isLoaded } = useUser()

  if (!isLoaded) return null

  const features = [
    {
      title: 'Skills Gap Analysis',
      description: 'Find out exactly which skills you need for your target role and get a clear learning plan.',
      icon: BarChart3,
      path: '/skills-analysis',
      color: 'bg-blue-500/10 text-blue-500 dark:bg-blue-500/20 dark:text-blue-400',
    },
    {
      title: 'AI Mock Interview',
      description: 'Practice with an AI interviewer and get honest feedback on your answers and delivery.',
      icon: Mic,
      path: '/mock-interview',
      color: 'bg-purple-500/10 text-purple-500 dark:bg-purple-500/20 dark:text-purple-400',
    },
    {
      title: 'Resume Optimizer',
      description: 'Make your resume impossible to ignore - stronger phrasing, better keywords, ATS-ready.',
      icon: FileText,
      path: '/resume-optimizer',
      color: 'bg-green-500/10 text-green-500 dark:bg-green-500/20 dark:text-green-400',
    },
  ]

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black text-black dark:text-white flex flex-col">
      <Navigation showUserButton={true} />

      <main className="flex-1 container mx-auto px-4 py-24 max-w-7xl pt-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mb-16"
        >
          <h1 className="text-5xl md:text-6xl font-semibold tracking-tighter mb-4">
            Hey, {user?.firstName}.
          </h1>
          <p className="text-xl text-slate-500 dark:text-zinc-400 max-w-lg tracking-tight">
            Ready to make progress today? Pick up where you left off or try something new.
          </p>
        </motion.div>

        {/* Dashboard Grid Map */}
        <motion.div
          className="grid lg:grid-cols-3 gap-6 mb-16"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={scaleVariants} className="lg:col-span-2">
            <div className="sutera-card h-full p-8 relative flex flex-col">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-semibold tracking-tight">Your Progress</h2>
                <TrendingUp className="h-5 w-5 text-slate-400 dark:text-zinc-500" />
              </div>
              <div className="grid sm:grid-cols-2 gap-4 flex-grow">
                <div className="bg-slate-50 dark:bg-zinc-900/50 border border-slate-100 dark:border-zinc-800 rounded-2xl p-6 flex flex-col justify-center">
                  <span className="text-sm text-slate-500 tracking-tight font-medium mb-2">Sessions completed</span>
                  <span className="text-4xl font-semibold tracking-tighter">0</span>
                </div>
                <div className="bg-slate-50 dark:bg-zinc-900/50 border border-slate-100 dark:border-zinc-800 rounded-2xl p-6 flex flex-col justify-center">
                  <span className="text-sm text-slate-500 tracking-tight font-medium mb-2">Best interview score</span>
                  <span className="text-4xl font-semibold tracking-tighter">--/100</span>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div variants={scaleVariants} className="sutera-card p-8">
            <h2 className="text-2xl font-semibold tracking-tight mb-4">Recent Activity</h2>
            <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
              <span className="text-slate-400 dark:text-zinc-500 text-sm tracking-tight mb-4">Nothing yet - start a session to see your history here.</span>
              <div className="h-px w-12 bg-slate-200 dark:bg-zinc-700" />
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          className="grid md:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {features.map((feature, idx) => (
            <motion.div key={idx} variants={scaleVariants}>
              <Link to={feature.path} className="block h-full group">
                <div className="sutera-card h-full p-8 flex flex-col transition-all duration-500 hover:border-black dark:hover:border-white">
                  <div className={`h-12 w-12 rounded-xl flex items-center justify-center mb-6 ${feature.color}`}>
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-semibold tracking-tight mb-3 group-hover:underline decoration-1 underline-offset-4">{feature.title}</h3>
                  <p className="text-sm text-slate-500 dark:text-zinc-400 leading-relaxed mb-6 flex-grow">{feature.description}</p>
                  <div className="mt-auto flex items-center text-sm font-medium tracking-tight text-slate-400 dark:text-zinc-500 group-hover:text-black dark:group-hover:text-white transition-colors">
                    Open <ArrowRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </main>

      <Footer />
    </div>
  )
}
