import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { SignedIn, SignedOut } from '@clerk/clerk-react'
import LandingPage from './components/LandingPage'
import Dashboard from './components/Dashboard'
import SkillsGapAnalysis from './components/SkillsGapAnalysis'
import MockInterview from './components/MockInterview'
import ResumeOptimizer from './components/ResumeOptimizer'
import AboutUs from './components/AboutUs'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-white">
        <Routes>
          <Route path="/" element={
            <>
              <SignedOut>
                <LandingPage />
              </SignedOut>
              <SignedIn>
                <Dashboard />
              </SignedIn>
            </>
          } />
          <Route path="/dashboard" element={
            <SignedIn>
              <Dashboard />
            </SignedIn>
          } />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/skills-analysis" element={<SkillsGapAnalysis />} />
          <Route path="/mock-interview" element={<MockInterview />} />
          <Route path="/resume-optimizer" element={<ResumeOptimizer />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
