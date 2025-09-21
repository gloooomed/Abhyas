import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { SignedIn, SignedOut } from '@clerk/clerk-react'
import LandingPage from './components/LandingPage'
import Dashboard from './components/Dashboard'
import SkillsGapAnalysis from './components/SkillsGapAnalysis'
import MockInterview from './components/MockInterview'
import ResumeOptimizer from './components/ResumeOptimizer'

function App() {
  return (
    <Router>
      <div className="min-h-screen">
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
          <Route path="/skills-analysis" element={
            <SignedIn>
              <SkillsGapAnalysis />
            </SignedIn>
          } />
          <Route path="/mock-interview" element={
            <SignedIn>
              <MockInterview />
            </SignedIn>
          } />
          <Route path="/resume-optimizer" element={
            <SignedIn>
              <ResumeOptimizer />
            </SignedIn>
          } />
        </Routes>
      </div>
    </Router>
  )
}

export default App
