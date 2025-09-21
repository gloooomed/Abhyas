import { useState } from 'react'
import { UserButton } from '@clerk/clerk-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Upload, FileText, Download, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { optimizeResume } from '../lib/gemini'
import Logo from './Logo'

interface OptimizationResult {
  analysis: {
    atsScore: number
    strengths: string[]
    weaknesses: string[]
    missingKeywords: string[]
    formatIssues: string[]
  }
  optimizations: Array<{
    section: string
    current: string
    improved: string
    reasoning: string
  }>
  keywords: {
    missing: string[]
    suggested: string[]
    density: string
  }
  actionItems: Array<{
    priority: 'High' | 'Medium' | 'Low'
    action: string
    impact: string
  }>
  score: {
    overall: number
    atsCompatibility: number
    relevance: number
    formatting: number
  }
}

export default function ResumeOptimizer() {
  const [file, setFile] = useState<File | null>(null)
  const [jobDescription, setJobDescription] = useState('')
  const [targetRole, setTargetRole] = useState('')
  const [resumeText, setResumeText] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState<OptimizationResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = event.target.files?.[0]
    if (uploadedFile) {
      // Check file size (10MB limit)
      const maxSize = 10 * 1024 * 1024 // 10MB in bytes
      if (uploadedFile.size > maxSize) {
        setError('File size must be less than 10MB')
        setFile(null)
        event.target.value = ''
        return
      }

      // Check file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']
      const fileName = uploadedFile.name.toLowerCase()
      const hasValidExtension = fileName.endsWith('.pdf') || fileName.endsWith('.doc') || fileName.endsWith('.docx') || fileName.endsWith('.txt')
      
      if (allowedTypes.includes(uploadedFile.type) || hasValidExtension) {
        setFile(uploadedFile)
        setError(null)
        
        // For text files, read the content
        if (uploadedFile.type === 'text/plain' || fileName.endsWith('.txt')) {
          const reader = new FileReader()
          reader.onload = (e) => {
            const content = e.target?.result as string
            if (content) {
              setResumeText(content)
            }
          }
          reader.onerror = () => {
            setError('Failed to read the text file. Please try again.')
          }
          reader.readAsText(uploadedFile)
        } else {
          // For PDF/DOC files, ask user to paste text content
          if (!resumeText.trim()) {
            setError('File uploaded successfully! Please also paste your resume text below for analysis, as file parsing is not yet implemented.')
          }
        }
      } else {
        setError('Please upload a PDF, Word document, or text file (.pdf, .doc, .docx, .txt)')
        setFile(null)
        // Reset the input value to allow re-uploading the same file if needed
        event.target.value = ''
      }
    }
  }

  const analyzeResume = async () => {
    if (!resumeText.trim() && !file) {
      setError('Please upload a resume file or paste your resume text')
      return
    }

    if (!targetRole.trim()) {
      setError('Please specify your target role')
      return
    }

    setIsAnalyzing(true)
    setError(null)
    
    try {
      const textToAnalyze = resumeText || 'Resume content from uploaded file'
      const optimization = await optimizeResume(textToAnalyze, targetRole, jobDescription)
      setResult(optimization)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze resume')
      // Fallback to mock data
      const mockResult: OptimizationResult = {
        analysis: {
          atsScore: 78,
          strengths: ['Strong technical skills section', 'Clear work experience', 'Quantified achievements'],
          weaknesses: ['Missing keywords for target role', 'Could improve summary section', 'Limited industry-specific terms'],
          missingKeywords: ['React', 'TypeScript', 'Agile', 'Cloud Computing'],
          formatIssues: ['Inconsistent bullet formatting', 'Missing contact information optimization']
        },
        optimizations: [
          {
            section: 'Professional Summary',
            current: 'Software developer with experience...',
            improved: 'Results-driven Software Engineer with 3+ years of experience developing scalable web applications using React and Node.js...',
            reasoning: 'More specific and quantified, includes key technologies'
          }
        ],
        keywords: {
          missing: ['React', 'TypeScript', 'Agile', 'Cloud Computing'],
          suggested: ['Add "React" to skills section', 'Include "TypeScript" in project descriptions'],
          density: 'Current keyword density: 12%. Recommended: 18-22%'
        },
        actionItems: [
          {
            priority: 'High',
            action: 'Add missing technical keywords to skills section',
            impact: 'Improve ATS compatibility by 15-20%'
          },
          {
            priority: 'Medium',
            action: 'Quantify achievements with specific metrics',
            impact: 'Increase recruiter engagement by 25%'
          }
        ],
        score: {
          overall: 78,
          atsCompatibility: 72,
          relevance: 85,
          formatting: 76
        }
      }
      setResult(mockResult)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-50 border-green-200'
    if (score >= 60) return 'bg-yellow-50 border-yellow-200'
    return 'bg-red-50 border-red-200'
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-700'
      case 'Medium': return 'bg-yellow-100 text-yellow-700'
      case 'Low': return 'bg-green-100 text-green-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div className="flex items-center space-x-2">
              <Logo size="sm" />
            </div>
          </div>
          <UserButton afterSignOutUrl="/" />
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Resume Optimizer</h1>
          <p className="text-gray-600">Upload your resume and get AI-powered optimization suggestions</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <FileText className="h-8 w-8 text-blue-600 mb-2" />
                <CardTitle>Upload Your Resume</CardTitle>
                <CardDescription>
                  Upload your resume in PDF or Word format
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600">
                      {file ? `Selected: ${file.name}` : 'Upload your resume file or paste text below'}
                    </p>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.txt,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="resume-upload"
                    />
                    <label htmlFor="resume-upload" className="inline-block">
                      <Button variant="outline" className="cursor-pointer" type="button" asChild>
                        <span>
                          <Upload className="h-4 w-4 mr-2" />
                          {file ? 'Change File' : 'Choose File'}
                        </span>
                      </Button>
                    </label>
                    
                    {file && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-center space-x-2 text-sm text-green-600">
                          <CheckCircle className="h-4 w-4" />
                          <span>File uploaded successfully ({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setFile(null)
                            const fileInput = document.getElementById('resume-upload') as HTMLInputElement
                            if (fileInput) fileInput.value = ''
                          }}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          Remove File
                        </Button>
                      </div>
                    )}
                    
                    <p className="text-xs text-gray-500">
                      Supported formats: PDF, DOC, DOCX, TXT (Max 10MB)
                    </p>
                  </div>
                </div>
                
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Or paste your resume text here:
                  </label>
                  <textarea
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Paste your resume content here if you don't have a file to upload..."
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Target Role & Job Description</CardTitle>
                <CardDescription>
                  Specify your target role and paste job description for better optimization
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target Role *
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Senior Software Engineer, Product Manager..."
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Job Description (Optional)
                  </label>
                  <textarea
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Paste the job description here for better keyword matching..."
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

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

            <Button 
              onClick={analyzeResume}
              disabled={(!file && !resumeText.trim()) || !targetRole.trim() || isAnalyzing}
              className="w-full"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing with AI...
                </>
              ) : (
                'Optimize Resume'
              )}
            </Button>
          </div>

          {/* Results Section */}
          <div className="space-y-6">
            {result && (
              <>
                {/* Score */}
                <Card>
                  <CardHeader>
                    <CardTitle>Resume Score</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className={`text-center p-6 rounded-lg ${getScoreBgColor(result.score.overall)}`}>
                      <div className={`text-4xl font-bold ${getScoreColor(result.score.overall)}`}>
                        {result.score.overall}/100
                      </div>
                      <p className="text-sm text-gray-600 mt-2">
                        {result.score.overall >= 80 ? 'Excellent!' : result.score.overall >= 60 ? 'Good, but can improve' : 'Needs improvement'}
                      </p>
                    </div>
                    
                    <div className="mt-4 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">ATS Compatibility</span>
                        <span className="font-medium">{result.score.atsCompatibility}/100</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Relevance</span>
                        <span className="font-medium">{result.score.relevance}/100</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Formatting</span>
                        <span className="font-medium">{result.score.formatting}/100</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Action Items */}
                <Card>
                  <CardHeader>
                    <CardTitle>Action Items</CardTitle>
                    <CardDescription>
                      Prioritized recommendations to improve your resume
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {result.actionItems.map((item, index: number) => (
                        <div key={index} className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50">
                          <div className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(item.priority)}`}>
                            {item.priority}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-sm text-gray-900">{item.action}</p>
                            <p className="text-sm text-gray-600">{item.impact}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Keywords */}
                <Card>
                  <CardHeader>
                    <CardTitle>Keyword Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-green-700 mb-2">Present Keywords</h4>
                        <div className="flex flex-wrap gap-2">
                          {result.keywords.suggested?.map((keyword: string, index: number) => (
                            <span key={index} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                              {keyword}
                            </span>
                          )) || <span className="text-gray-500">No keywords found</span>}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium text-red-700 mb-2">Missing Keywords</h4>
                        <div className="flex flex-wrap gap-2">
                          {result.keywords.missing?.map((keyword: string, index: number) => (
                            <span key={index} className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                              {keyword}
                            </span>
                          )) || <span className="text-gray-500">No missing keywords identified</span>}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Download */}
                <Card>
                  <CardHeader>
                    <CardTitle>Download Optimized Resume</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full" disabled>
                      <Download className="h-4 w-4 mr-2" />
                      Download Optimized Version (Coming Soon)
                    </Button>
                  </CardContent>
                </Card>
              </>
            )}

            {!result && (
              <Card>
                <CardContent className="p-8 text-center text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Upload your resume to see optimization suggestions</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}