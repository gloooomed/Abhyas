import { UserButton } from '@clerk/clerk-react'
import { Target, FileText, Mic, ArrowRight, Zap, TrendingUp, Award, Clock, Github, Twitter, Linkedin } from 'lucide-react'
import { Link } from 'react-router-dom'
import Logo from './Logo'

const features = [
  {
    icon: Target,
    title: "Skills Gap Analysis",
    description: "AI-powered analysis identifies your skill gaps and provides personalized learning roadmaps to reach your career goals.",
    href: "/skills-analysis",
    cta: "Start Analysis",
    gradient: "from-blue-500/20 to-blue-600/30",
    iconColor: "text-blue-600",
    borderColor: "border-blue-200"
  },
  {
    icon: Mic,
    title: "AI Mock Interview",
    description: "Practice with realistic interview scenarios and receive detailed feedback to perfect your interview performance.",
    href: "/mock-interview", 
    cta: "Start Interview",
    gradient: "from-purple-500/20 to-indigo-600/30",
    iconColor: "text-purple-600",
    borderColor: "border-purple-200"
  },
  {
    icon: FileText,
    title: "Resume Optimizer",
    description: "Transform your resume with AI optimization to increase your chances of landing interviews.",
    href: "/resume-optimizer",
    cta: "Optimize Resume",
    gradient: "from-emerald-500/20 to-green-600/30",
    iconColor: "text-emerald-600",
    borderColor: "border-emerald-200"
  }
]

const stats = [
  { value: "AI", label: "Powered", icon: Award },
  { value: "Smart", label: "Analysis", icon: TrendingUp },
  { value: "Career", label: "Growth", icon: Target },
  { value: "24/7", label: "Available", icon: Clock }
]

export default function Dashboard() {
  return (
    <div className="min-h-screen">
      {/* Modern Header */}
      <header className="navbar">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Logo size="sm" />
            <div className="badge badge-primary ml-4">AI-Powered</div>
          </div>
          <div className="flex items-center gap-4">
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </header>

      {/* Modern Hero Section */}
      <section className="section-hero">
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-4xl mx-auto">
            <div className="badge badge-primary mb-8 animate-fade-in-down">
              🚀 Welcome to Advanced AI Career Intelligence
            </div>
            
            <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-6 tracking-tight leading-tight animate-fade-in-up">
              THE FUTURE OF
              <span className="block gradient-text mt-2">
                CAREER GROWTH IS HERE
              </span>
            </h1>
            
            <p className="text-xl text-slate-600 mb-12 max-w-3xl mx-auto leading-relaxed animate-fade-in-up">
              Discover your potential with cutting-edge AI technology. 
              Master interviews, optimize resumes, and bridge skill gaps with precision.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up">
              <Link to="/skills-analysis" className="btn btn-primary btn-lg hover-lift">
                Start Your Journey
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link to="/mock-interview" className="btn btn-outline btn-lg hover-lift dashboard-btn">
                Explore Features
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Modern Features */}
      <section className="section section-alt">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="badge badge-primary mb-6">CORE FEATURES</div>
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Powered by Advanced AI Technology
            </h2>
            <p className="text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Everything you need to accelerate your career growth and achieve professional excellence.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="card hover-lift border-0 bg-white"
              >
                <div className="p-8">
                  <div className={`w-20 h-20 rounded-xl bg-gradient-to-br ${feature.gradient} ${feature.borderColor} border flex items-center justify-center mb-6`}>
                    <feature.icon className={`h-10 w-10 ${feature.iconColor}`} />
                  </div>
                  <h3 className="text-xl font-semibold mb-4 text-gray-900">
                    {feature.title}
                  </h3>
                  <p className="text-slate-600 mb-6 leading-relaxed">
                    {feature.description}
                  </p>
                  <Link 
                    to={feature.href}
                    className="btn btn-outline w-full dashboard-btn"
                  >
                    {feature.cta}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Modern Stats */}
      <section className="section">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">What Makes Abhyas Special</h2>
            <p className="text-slate-600 text-lg">Advanced AI technology designed for your career success</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="text-center group"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl border border-blue-200 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <stat.icon className="h-8 w-8 text-blue-600" />
                </div>
                <div className="text-3xl font-bold gradient-text mb-2">
                  {stat.value}
                </div>
                <div className="text-slate-600 font-medium uppercase tracking-wider text-sm">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Activity Section */}
      <section className="section section-alt">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Your Career Progress</h2>
            <p className="text-slate-600 text-lg">Track your journey to professional excellence</p>
          </div>
          
          <div className="card text-center hover-lift border-0 bg-white max-w-2xl mx-auto">
            <div className="p-8">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-200 flex items-center justify-center mx-auto mb-6">
                <Zap className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-900">Ready to Begin Your Journey?</h3>
              <p className="text-slate-600 mb-8 max-w-md mx-auto leading-relaxed">
                Start using our AI-powered tools to see your progress and achievements here.
              </p>
              <Link to="/skills-analysis" className="btn btn-primary btn-lg hover-lift">
                Start Your First Analysis
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Minimal Footer */}
      <footer className="border-t border-gray-200 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Logo size="sm" />
              <span className="text-slate-600 text-sm">&copy; 2025 Abhyas. All rights reserved.</span>
            </div>
            <div className="flex items-center gap-4">
              <a href="#" className="text-slate-600 hover:text-blue-600 transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="#" className="text-slate-600 hover:text-blue-600 transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-slate-600 hover:text-blue-600 transition-colors">
                <Github className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}