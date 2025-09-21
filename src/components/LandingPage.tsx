import { SignInButton, SignUpButton } from '@clerk/clerk-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Target, FileText, Mic, ArrowRight, Star, CheckCircle } from 'lucide-react'
import Logo from './Logo'

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Modern Header */}
      <header className="navbar">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <Logo size="md" />
          <div className="flex items-center space-x-4">
            <SignInButton>
              <Button variant="ghost" className="text-slate-700 hover:text-blue-600 font-medium">Sign In</Button>
            </SignInButton>
            <SignUpButton>
              <Button className="btn-primary">Get Started Free</Button>
            </SignUpButton>
          </div>
        </div>
      </header>

      {/* Modern Hero Section */}
      <section className="section-hero relative">
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-4xl mx-auto">
            <div className="badge badge-primary mb-8 animate-fade-in-down">
              <Star className="h-4 w-4 mr-2" />
              <span>Powered by Advanced AI Technology</span>
            </div>
            
            <h1 className="text-6xl md:text-7xl font-extrabold text-gray-900 mb-6 tracking-tight leading-tight animate-fade-in-up">
              Transform Your Career with
              <span className="block gradient-text mt-2">
                AI-Powered Excellence
              </span>
            </h1>
            
            <p className="text-xl text-slate-600 mb-12 max-w-3xl mx-auto leading-relaxed animate-fade-in-up">
              Advance your professional growth with AI-powered coaching, skills analysis, 
              and interview preparation tools designed for modern careers.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16 animate-fade-in-up">
              <SignUpButton>
                <Button size="lg" className="btn-primary btn-xl hover-lift">
                  Start Your Transformation
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </SignUpButton>
              <div className="flex items-center text-sm text-slate-600">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                Free forever • No credit card required • Get started in 2 minutes
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Modern Features Section */}
      <section className="section section-alt">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="badge badge-primary mb-6">CORE FEATURES</div>
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Advanced AI Tools for Professional Excellence
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Leverage artificial intelligence to advance your career growth 
              and achieve professional success.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="card hover-lift border-0 bg-white">
              <CardHeader className="text-center pb-4">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500/20 to-blue-600/30 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-blue-200">
                  <Target className="h-10 w-10 text-blue-600" />
                </div>
                <CardTitle className="text-2xl font-bold text-gray-900 mb-2">Skills Gap Analysis</CardTitle>
                <CardDescription className="text-slate-600 leading-relaxed text-base">
                  AI-powered analysis identifies skill gaps and provides personalized learning roadmaps for your target role
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <ul className="space-y-4 mb-6">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-1 flex-shrink-0" />
                    <span className="text-slate-700">Comprehensive skill mapping and assessment</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-1 flex-shrink-0" />
                    <span className="text-slate-700">Personalized learning recommendations</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-1 flex-shrink-0" />
                    <span className="text-slate-700">Progress tracking and milestone planning</span>
                  </li>
                </ul>
                <Button className="btn-outline w-full">
                  Explore Analysis Tool
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>

            <Card className="card hover-lift border-0 bg-white">
              <CardHeader className="text-center pb-4">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500/20 to-indigo-600/30 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-purple-200">
                  <Mic className="h-10 w-10 text-purple-600" />
                </div>
                <CardTitle className="text-2xl font-bold text-gray-900 mb-2">AI Mock Interview</CardTitle>
                <CardDescription className="text-slate-600 leading-relaxed text-base">
                  Practice with realistic interview scenarios and receive detailed AI feedback to perfect your performance
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <ul className="space-y-4 mb-6">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-1 flex-shrink-0" />
                    <span className="text-slate-700">Voice and text-based interview practice</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-1 flex-shrink-0" />
                    <span className="text-slate-700">Industry-specific question databases</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-1 flex-shrink-0" />
                    <span className="text-slate-700">Detailed performance analytics</span>
                  </li>
                </ul>
                <Button className="btn-outline w-full">
                  Start Mock Interview
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>

            <Card className="card hover-lift border-0 bg-white">
              <CardHeader className="text-center pb-4">
                <div className="w-20 h-20 bg-gradient-to-br from-emerald-500/20 to-green-600/30 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-emerald-200">
                  <FileText className="h-10 w-10 text-emerald-600" />
                </div>
                <CardTitle className="text-2xl font-bold text-gray-900 mb-2">Resume Optimizer</CardTitle>
                <CardDescription className="text-slate-600 leading-relaxed text-base">
                  Transform your resume with AI optimization and keyword analysis for maximum impact
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <ul className="space-y-4 mb-6">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-1 flex-shrink-0" />
                    <span className="text-slate-700">Multi-format document support</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-1 flex-shrink-0" />
                    <span className="text-slate-700">ATS-optimized formatting suggestions</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-1 flex-shrink-0" />
                    <span className="text-slate-700">Job-specific tailoring recommendations</span>
                  </li>
                </ul>
                <Button className="btn-outline w-full">
                  Optimize Resume
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Modern CTA Section */}
      <section className="section-dark">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <div className="badge badge-success mb-8 glass">
              <Star className="h-4 w-4 mr-2" />
              START YOUR TRANSFORMATION
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
              Ready to Advance Your Professional Growth?
            </h2>
            <p className="text-xl mb-12 text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Take control of your career with our AI-powered platform. 
              Start your journey to professional excellence today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <SignUpButton>
                <Button size="lg" className="btn-primary btn-xl hover-lift">
                  Get Started for Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </SignUpButton>
              <div className="flex items-center text-sm text-gray-300">
                <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                No commitment • Cancel anytime • Full feature access
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Modern Footer */}
      <footer className="section bg-gray-900 text-gray-300">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <Logo size="md" variant="white" />
            </div>
            <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
              Advanced AI technology for career development and professional excellence. 
              Transform your career with intelligent analysis and personalized guidance.
            </p>
            <div className="border-t border-gray-800 pt-6">
              <p className="text-gray-500">&copy; 2025 Abhyas. All rights reserved. Built with ❤️ for career growth.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}