import { useState } from 'react'
import { UserButton } from '@clerk/clerk-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Target, BookOpen, CheckCircle, Loader2, AlertCircle, TrendingUp, Clock } from 'lucide-react'
import { Link } from 'react-router-dom'
import { analyzeSkillsGap } from '../lib/gemini'
import QuotaHelper from './QuotaHelper'
import Logo from './Logo'

interface SkillGapResult {
  gapAnalysis: {
    missingSkills: string[];
    skillsToImprove: string[];
    strongSkills: string[];
  };
  recommendations: Array<{
    skill: string;
    priority: 'High' | 'Medium' | 'Low';
    timeToLearn: string;
    resources: Array<{
      title: string;
      type: string;
      provider: string;
      url: string;
      duration: string;
      difficulty: string;
    }>;
  }>;
  careerPath: {
    nextSteps: string[];
    timelineMonths: number;
    salaryProjection: string;
  };
}

export default function SkillsGapAnalysis() {
  const [currentSkills, setCurrentSkills] = useState('')
  const [targetRole, setTargetRole] = useState('')
  const [experience, setExperience] = useState('')
  const [industry, setIndustry] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState<SkillGapResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showQuotaHelper, setShowQuotaHelper] = useState(false)

  const handleAnalysis = async () => {
    if (!currentSkills.trim() || !targetRole.trim()) return

    setIsAnalyzing(true)
    setError(null)
    setShowQuotaHelper(false)
    
    try {
      console.log('Starting skills gap analysis...')
      const skillsArray = currentSkills.split(',').map(skill => skill.trim()).filter(skill => skill.length > 0)
      
      console.log('Calling analyzeSkillsGap with:', {
        skillsArray,
        targetRole,
        experience: experience || 'Entry Level',
        industry: industry || 'Technology'
      })
      
      const analysisResult = await analyzeSkillsGap(
        skillsArray, 
        targetRole, 
        experience || 'Entry Level', 
        industry || 'Technology'
      )
      
      console.log('Analysis result:', analysisResult)
      
      if (analysisResult && typeof analysisResult === 'object') {
        setResult(analysisResult)
        
        // Check if this is demo data due to quota limits
        if ((analysisResult as any).isDemoData) {
          setShowQuotaHelper(true)
        }
      } else {
        throw new Error('Invalid response format from AI analysis')
      }
    } catch (err: any) {
      console.error('Skills gap analysis error:', err)
      
      // Check if it's a quota error
      if (err.message?.includes('quota') || err.message?.includes('429')) {
        setShowQuotaHelper(true)
        setError(null) // Don't show error message, show quota helper instead
      } else {
        setError(`Analysis failed: ${err instanceof Error ? err.message : 'Unknown error'}. Please try again.`)
      }
      
      // Fallback to mock data if API fails
      const mockResult: SkillGapResult = {
        gapAnalysis: {
          missingSkills: ['React.js', 'TypeScript', 'Node.js', 'AWS Cloud Services', 'Docker'],
          skillsToImprove: ['JavaScript ES6+', 'Database Design', 'API Development', 'Testing Frameworks'],
          strongSkills: ['HTML', 'CSS', 'Basic JavaScript']
        },
        recommendations: [
          {
            skill: 'React.js',
            priority: 'High',
            timeToLearn: '2-3 months',
            resources: [
              {
                title: 'React Official Documentation',
                type: 'Documentation',
                provider: 'React Team',
                url: 'https://react.dev/',
                duration: 'Self-paced',
                difficulty: 'Intermediate'
              }
            ]
          }
        ],
        careerPath: {
          nextSteps: ['Master React.js', 'Learn TypeScript', 'Build portfolio projects'],
          timelineMonths: 6,
          salaryProjection: '$60,000 - $80,000'
        }
      }
      setResult(mockResult)
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="min-h-screen">
      {/* Modern Header */}
      <header className="navbar">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/dashboard">
              <Button variant="ghost" size="sm" className="text-slate-600 hover:text-blue-600">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div className="flex items-center space-x-2">
              <Logo size="sm" showText={false} />
              <span className="text-2xl font-bold gradient-text">Abhyas</span>
            </div>
          </div>
          <UserButton afterSignOutUrl="/" />
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Skills Gap Analysis</h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">Discover what skills you need to reach your target role with AI-powered analysis</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input Form */}
          <Card>
            <CardHeader>
              <Target className="h-8 w-8 text-blue-600 mb-2" />
              <CardTitle>Analyze Your Skills</CardTitle>
              <CardDescription>
                Enter your current skills and target role to get personalized recommendations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label htmlFor="current-skills" className="block text-sm font-medium text-gray-700 mb-2">
                  Current Skills
                </label>
                <textarea
                  id="current-skills"
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., HTML, CSS, JavaScript, Python, Project Management..."
                  value={currentSkills}
                  onChange={(e) => setCurrentSkills(e.target.value)}
                />
              </div>
              
              <div>
                <label htmlFor="target-role" className="block text-sm font-medium text-gray-700 mb-2">
                  Target Role
                </label>
                <input
                  id="target-role"
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Senior Frontend Developer, Product Manager..."
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                />
              </div>

              <Button 
                onClick={handleAnalysis}
                disabled={!currentSkills.trim() || !targetRole.trim() || isAnalyzing}
                className="w-full"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing with AI...
                  </>
                ) : (
                  'Analyze Skills Gap'
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Results */}
          <div className="space-y-6">
            {error && (
              <Card className="border-red-200 bg-red-50">
                <CardContent className="pt-6">
                  <div className="flex items-center text-red-700">
                    <AlertCircle className="h-5 w-5 mr-2" />
                    <span className="text-sm">{error}</span>
                  </div>
                </CardContent>
              </Card>
            )}

            {showQuotaHelper && (
              <QuotaHelper onTryAgain={handleAnalysis} />
            )}

            {result && (
              <>
                {/* Demo Data Banner */}
                {(result as any).isDemoData && (
                  <Card className="border-blue-200 bg-blue-50">
                    <CardContent className="pt-4">
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-blue-800">
                            Demo Analysis Results
                          </h3>
                          <div className="mt-1 text-sm text-blue-700">
                            <p>
                              You're seeing demo results due to AI service limits. The analysis below shows what our AI typically provides.
                            </p>
                            <p className="mt-2">
                              <strong>Solutions:</strong>
                            </p>
                            <ul className="mt-1 list-disc list-inside space-y-1">
                              <li>Wait a few minutes and try again (free tier resets)</li>
                              <li>The demo analysis below is still valuable for planning</li>
                              <li>Contact support if you need immediate personalized analysis</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
                
                {/* Error Banner */}
                {(result as any).isError && (
                  <Card className="border-orange-200 bg-orange-50">
                    <CardContent className="pt-4">
                      <div className="flex items-center">
                        <AlertCircle className="h-5 w-5 text-orange-600 mr-3" />
                        <div>
                          <h3 className="text-sm font-medium text-orange-800">
                            Using Backup Analysis
                          </h3>
                          <p className="text-sm text-orange-700 mt-1">
                            AI service temporarily unavailable. Showing general analysis for your role.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
                {/* Missing Skills */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-red-600 flex items-center">
                      <Target className="h-5 w-5 mr-2" />
                      Missing Skills
                    </CardTitle>
                    <CardDescription>
                      Critical skills you need to develop for your target role
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {result.gapAnalysis.missingSkills.map((skill: string, index: number) => (
                        <li key={index} className="flex items-center text-sm p-2 bg-red-50 rounded-lg">
                          <div className="w-2 h-2 bg-red-500 rounded-full mr-3 flex-shrink-0" />
                          <span className="font-medium">{skill}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                {/* Skills to Improve */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-yellow-600 flex items-center">
                      <TrendingUp className="h-5 w-5 mr-2" />
                      Skills to Improve
                    </CardTitle>
                    <CardDescription>
                      Skills you have but could strengthen
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {result.gapAnalysis.skillsToImprove.map((skill: string, index: number) => (
                        <li key={index} className="flex items-center text-sm p-2 bg-yellow-50 rounded-lg">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3 flex-shrink-0" />
                          <span className="font-medium">{skill}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                {/* Strong Skills */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-green-600 flex items-center">
                      <CheckCircle className="h-5 w-5 mr-2" />
                      Strong Skills
                    </CardTitle>
                    <CardDescription>
                      Skills you already have that are valuable for this role
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {result.gapAnalysis.strongSkills.map((skill: string, index: number) => (
                        <li key={index} className="flex items-center text-sm p-2 bg-green-50 rounded-lg">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                          <span className="font-medium">{skill}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                {/* Learning Recommendations */}
                <Card>
                  <CardHeader>
                    <BookOpen className="h-6 w-6 text-blue-600 mb-2" />
                    <CardTitle className="text-blue-600">Learning Recommendations</CardTitle>
                    <CardDescription>
                      Personalized learning path with resources
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {result.recommendations.slice(0, 3).map((rec, index: number) => (
                        <div key={index} className="border rounded-lg p-4 bg-blue-50">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-gray-900">{rec.skill}</h4>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              rec.priority === 'High' ? 'bg-red-100 text-red-700' :
                              rec.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-green-100 text-green-700'
                            }`}>
                              {rec.priority} Priority
                            </span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600 mb-3">
                            <Clock className="h-4 w-4 mr-1" />
                            <span>Estimated time: {rec.timeToLearn}</span>
                          </div>
                          {rec.resources.length > 0 && (
                            <div className="space-y-2">
                              <h5 className="text-sm font-medium text-gray-700">Recommended Resource:</h5>
                              <div className="bg-white rounded p-3 border">
                                <a 
                                  href={rec.resources[0].url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800 font-medium"
                                >
                                  {rec.resources[0].title}
                                </a>
                                <p className="text-xs text-gray-500 mt-1">
                                  {rec.resources[0].type} • {rec.resources[0].provider} • {rec.resources[0].difficulty}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Career Path */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-purple-600">Career Roadmap</CardTitle>
                    <CardDescription>
                      Your personalized path to success
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Next Steps:</h4>
                        <ol className="space-y-2">
                          {result.careerPath.nextSteps.map((step: string, index: number) => (
                            <li key={index} className="flex items-start text-sm">
                              <span className="bg-purple-100 text-purple-700 rounded-full w-6 h-6 flex items-center justify-center text-xs font-medium mr-3 mt-0.5 flex-shrink-0">
                                {index + 1}
                              </span>
                              {step}
                            </li>
                          ))}
                        </ol>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <h5 className="text-sm font-medium text-gray-700">Timeline</h5>
                            <p className="text-lg font-semibold text-purple-600">{result.careerPath.timelineMonths} months</p>
                          </div>
                          <div>
                            <h5 className="text-sm font-medium text-gray-700">Salary Projection</h5>
                            <p className="text-lg font-semibold text-purple-600">{result.careerPath.salaryProjection}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {!result && (
              <Card>
                <CardContent className="p-8 text-center text-gray-500">
                  <Target className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Enter your skills and target role to see your personalized analysis</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}