import { useState, useEffect } from "react";
import { UserButton, useAuth, useClerk } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ArrowLeft,
  Mic,
  MicOff,
  MessageCircle,
  Send,
  Loader2,
  AlertCircle,
  Volume2,
  Settings,
  Github,
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  generateInterviewQuestions,
  evaluateInterviewAnswer,
} from "../lib/gemini";
import { VoiceRecorder, VoiceSynthesis } from "../lib/speech";
import Navigation from "./Navigation";

interface Message {
  id: string;
  type: "interviewer" | "candidate";
  content: string;
  timestamp: Date;
  score?: number;
  feedback?: {
    strengths: string[];
    improvements: string[];
    suggestions: string[];
  };
}

interface InterviewQuestion {
  id: number;
  question: string;
  type: string;
  category: string;
  difficulty: string;
  expectedPoints: string[];
  followUpQuestions: string[];
}

interface InterviewConfig {
  role: string;
  experience: string;
  industry: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  mode: "text" | "voice";
}

export default function MockInterview() {
  const { isSignedIn } = useAuth();
  const { redirectToSignIn } = useClerk();
  const [isRecording, setIsRecording] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentResponse, setCurrentResponse] = useState("");
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [config, setConfig] = useState<InterviewConfig>({
    role: "",
    experience: "",
    industry: "",
    difficulty: "intermediate",
    mode: "text",
  });
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [voiceRecorder, setVoiceRecorder] = useState<VoiceRecorder | null>(
    null,
  );
  const [voiceSynthesis, setVoiceSynthesis] = useState<VoiceSynthesis | null>(
    null,
  );
  const [transcript, setTranscript] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    // Initialize voice services
    if (typeof window !== "undefined") {
      try {
        const synthesis = new VoiceSynthesis();
        setVoiceSynthesis(synthesis);

        if (config.mode === "voice") {
          const recorder = new VoiceRecorder();
          recorder.setOnResult((result) => {
            if (result.isFinal) {
              setTranscript((prev) => prev + " " + result.transcript);
              setCurrentResponse((prev) => prev + " " + result.transcript);
            }
          });
          recorder.setOnError((error) => {
            setError(`Voice recognition error: ${error}`);
          });
          setVoiceRecorder(recorder);
        }
      } catch (err) {
        console.error("Voice services not available:", err);
      }
    }
  }, [config.mode]);

  const startInterview = async () => {
    if (!config.role || !config.experience || !config.industry) {
      setError("Please fill in all interview configuration fields");
      return;
    }

    // Check if user is signed in before proceeding
    if (!isSignedIn) {
      redirectToSignIn();
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const questionData = await generateInterviewQuestions(
        config.role,
        config.experience,
        config.industry,
        config.difficulty,
      );

      setQuestions(questionData.questions);
      setCurrentQuestionIndex(0);

      const welcomeMessage: Message = {
        id: "welcome",
        type: "interviewer",
        content: `Hello! I'm your AI interview coach. Today we'll be conducting a mock interview for the ${config.role} position. I've prepared ${questionData.questions.length} questions for you. Let's begin with the first question:`,
        timestamp: new Date(),
      };

      const firstQuestion: Message = {
        id: "q1",
        type: "interviewer",
        content: questionData.questions[0].question,
        timestamp: new Date(),
      };

      setMessages([welcomeMessage, firstQuestion]);
      setInterviewStarted(true);

      // Speak the welcome message and first question if voice mode
      if (config.mode === "voice" && voiceSynthesis) {
        await speakMessage(
          welcomeMessage.content + " " + firstQuestion.content,
        );
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to start interview. Using mock questions.",
      );
      // Fallback to mock questions
      const mockQuestions: InterviewQuestion[] = [
        {
          id: 1,
          question: "Tell me about yourself and your background.",
          type: "behavioral",
          category: "general",
          difficulty: "easy",
          expectedPoints: [
            "Professional background",
            "Key skills",
            "Career goals",
          ],
          followUpQuestions: [
            "What motivates you?",
            "Where do you see yourself in 5 years?",
          ],
        },
        {
          id: 2,
          question: "Why are you interested in this role?",
          type: "behavioral",
          category: "motivation",
          difficulty: "medium",
          expectedPoints: [
            "Company research",
            "Role alignment",
            "Career growth",
          ],
          followUpQuestions: ["What do you know about our company?"],
        },
      ];

      setQuestions(mockQuestions);
      setCurrentQuestionIndex(0);

      const welcomeMessage: Message = {
        id: "welcome",
        type: "interviewer",
        content: `Hello! I'm your AI interview coach. Today we'll be conducting a mock interview for the ${config.role} position. Let's begin with the first question:`,
        timestamp: new Date(),
      };

      const firstQuestion: Message = {
        id: "q1",
        type: "interviewer",
        content: mockQuestions[0].question,
        timestamp: new Date(),
      };

      setMessages([welcomeMessage, firstQuestion]);
      setInterviewStarted(true);
    } finally {
      setIsLoading(false);
    }
  };

  const speakMessage = async (text: string) => {
    if (voiceSynthesis && !isSpeaking) {
      setIsSpeaking(true);
      try {
        await voiceSynthesis.speak(text, { rate: 0.9 });
      } catch (err) {
        console.error("Speech synthesis error:", err);
      } finally {
        setIsSpeaking(false);
      }
    }
  };

  const toggleRecording = () => {
    if (!voiceRecorder) return;

    if (isRecording) {
      voiceRecorder.stopListening();
    } else {
      setTranscript("");
      setCurrentResponse("");
      voiceRecorder.startListening();
    }
    setIsRecording(!isRecording);
  };

  const submitResponse = async () => {
    if (!currentResponse.trim()) return;

    const responseMessage: Message = {
      id: `response-${Date.now()}`,
      type: "candidate",
      content: currentResponse,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, responseMessage]);

    // Provide brief acknowledgment and move to next question
    const acknowledgment: Message = {
      id: `ack-${Date.now()}`,
      type: "interviewer",
      content: `Thank you for that answer. ${
        currentQuestionIndex < questions.length - 1
          ? "Let's move on to the next question:"
          : "That completes our interview questions. Let me provide your feedback now."
      }`,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, acknowledgment]);

    // Move to next question or provide final evaluation
    if (currentQuestionIndex < questions.length - 1) {
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);

      const nextQuestion: Message = {
        id: `q${nextIndex + 1}`,
        type: "interviewer",
        content: questions[nextIndex].question,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, nextQuestion]);

      if (config.mode === "voice" && voiceSynthesis) {
        await speakMessage(acknowledgment.content + " " + nextQuestion.content);
      }
    } else {
      // Interview complete - provide comprehensive feedback
      if (config.mode === "voice" && voiceSynthesis) {
        await speakMessage(acknowledgment.content);
      }

      setIsEvaluating(true);

      // Get AI evaluation for comprehensive final feedback
      try {
        const allResponses = messages
          .filter((m) => m.type === "candidate")
          .map((m) => m.content)
          .join(" | ");

        const evaluation = await evaluateInterviewAnswer(
          "Overall interview performance",
          allResponses,
          config.role,
        );

        setTimeout(() => {
          const finalFeedback: Message = {
            id: "final-feedback",
            type: "interviewer",
            content: `# 📋 COMPREHENSIVE INTERVIEW EVALUATION

## Overall Performance Score: ${evaluation.score}/100

### 🎯 PERFORMANCE BREAKDOWN
• **Communication Clarity:** ${evaluation.detailedAnalysis?.communicationClarity || 8}/10
• **Content Relevance:** ${evaluation.detailedAnalysis?.contentRelevance || 7}/10
• **Example Specificity:** ${evaluation.detailedAnalysis?.specificityOfExamples || 6}/10
• **Professional Maturity:** ${evaluation.detailedAnalysis?.professionalMaturity || 8}/10
• **Technical Accuracy:** ${evaluation.detailedAnalysis?.technicalAccuracy || 7}/10

---

### ✅ STRENGTHS DEMONSTRATED
${evaluation.evaluation?.strengths?.map((s: string) => `• ${s}`).join("\n") || "• Clear communication throughout the interview\n• Relevant examples provided\n• Professional demeanor maintained"}

### ⚠️ AREAS NEEDING IMPROVEMENT
${evaluation.evaluation?.weaknesses?.map((w: string) => `• ${w}`).join("\n") || "• Could provide more quantifiable examples\n• Practice structuring answers with STAR method\n• Develop stronger technical examples"}

### 🎯 MISSING ELEMENTS
${evaluation.evaluation?.missingElements?.map((m: string) => `• ${m}`).join("\n") || "• Quantifiable results and metrics\n• Leadership examples\n• Industry-specific insights"}

---

### 🚀 ACTION PLAN FOR IMPROVEMENT
${evaluation.evaluation?.improvements?.map((imp: string, idx: number) => `${idx + 1}. ${imp}`).join("\n") || "1. Practice STAR method responses\n2. Prepare quantified examples\n3. Research industry trends"}

### 📚 COACHING RECOMMENDATIONS
${evaluation.coachingNotes?.map((note: string, idx: number) => `${idx + 1}. ${note}`).join("\n") || "1. Develop 3-5 strong STAR examples\n2. Practice technical explanations\n3. Prepare thoughtful questions"}

---

### 📈 PERFORMANCE RATING
${
  evaluation.score >= 85
    ? "🟢 **STRONG CANDIDATE** - Ready for most interviews with minor refinements"
    : evaluation.score >= 70
      ? "🟡 **GOOD POTENTIAL** - Solid foundation, needs focused practice on key areas"
      : evaluation.score >= 55
        ? "🟠 **NEEDS DEVELOPMENT** - Requires significant preparation before interviews"
        : "🔴 **REQUIRES MAJOR IMPROVEMENT** - Extensive practice needed across multiple areas"
}

### 🎯 NEXT STEPS
1. **Focus on your weakest areas** identified above
2. **Practice with mock interviews** using different question types
3. **Prepare 5-7 STAR examples** covering various competencies
4. **Research the company and role** thoroughly before real interviews
5. **Practice explaining technical concepts** simply and clearly

Good luck with your future interviews! Remember, interview skills improve with practice. 🌟`,
            timestamp: new Date(),
            score: evaluation.score,
            feedback: evaluation.evaluation,
          };

          setMessages((prev) => [...prev, finalFeedback]);
          setIsEvaluating(false);

          if (config.mode === "voice" && voiceSynthesis) {
            speakMessage(
              `Interview complete! Your overall score is ${evaluation.score} out of 100. I've provided comprehensive feedback above with specific areas for improvement and next steps.`,
            );
          }
        }, 2000);
      } catch {
        setTimeout(() => {
          const fallbackFeedback: Message = {
            id: "fallback-feedback",
            type: "interviewer",
            content: `## Interview Feedback Summary

Thank you for completing the mock interview! Here's your feedback:

**Overall Performance**: You showed good preparation and professionalism throughout the interview.

**Key Strengths**:
• Clear and confident communication
• Relevant examples from your experience
• Good understanding of the role
• Professional demeanor

**Areas for Improvement**:
• Use the STAR method for behavioral questions
• Provide more quantifiable achievements
• Prepare strategic questions about the company
• Practice technical concepts if applicable

**Overall Rating**: 75/100 - Good performance with room for growth

**Next Steps**:
1. Research common interview questions for ${config.role} roles
2. Prepare 5-7 thoughtful questions about the company
3. Practice describing achievements with specific metrics
4. Review industry trends and challenges

Keep practicing and you'll do great in real interviews!`,
            timestamp: new Date(),
          };

          setMessages((prev) => [...prev, fallbackFeedback]);
          setIsEvaluating(false);
        }, 1500);
      }
    }

    setCurrentResponse("");
    setTranscript("");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <Navigation
        showUserButton={isSignedIn}
        userButtonComponent={<UserButton afterSignOutUrl="/" />}
      />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-16">
          <Link
            to={isSignedIn ? "/dashboard" : "/"}
            className="inline-flex items-center text-slate-600 hover:text-blue-600 mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {isSignedIn ? "Back to Dashboard" : "Back to Home"}
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            AI Mock Interview
          </h1>
          <p className="text-gray-600">
            Practice interviews with AI coaching and real-time feedback
          </p>
        </div>

        {!interviewStarted ? (
          /* Configuration Panel */
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader>
                <Settings className="h-8 w-8 text-blue-600 mb-2" />
                <CardTitle>Interview Setup</CardTitle>
                <CardDescription>
                  Configure your mock interview session
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 interview-setup-form">
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center text-red-700">
                      <AlertCircle className="h-5 w-5 mr-2" />
                      <span className="text-sm">{error}</span>
                    </div>
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Target Role
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Software Engineer, Product Manager"
                      value={config.role}
                      onChange={(e) =>
                        setConfig((prev) => ({ ...prev, role: e.target.value }))
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Experience Level
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={config.experience}
                      onChange={(e) =>
                        setConfig((prev) => ({
                          ...prev,
                          experience: e.target.value,
                        }))
                      }
                    >
                      <option value="">Select experience</option>
                      <option value="Entry Level">
                        Entry Level (0-2 years)
                      </option>
                      <option value="Mid Level">Mid Level (3-5 years)</option>
                      <option value="Senior Level">
                        Senior Level (6+ years)
                      </option>
                    </select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Industry
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Technology, Healthcare, Finance"
                      value={config.industry}
                      onChange={(e) =>
                        setConfig((prev) => ({
                          ...prev,
                          industry: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Difficulty
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={config.difficulty}
                      onChange={(e) =>
                        setConfig((prev) => ({
                          ...prev,
                          difficulty: e.target.value as
                            | "beginner"
                            | "intermediate"
                            | "advanced",
                        }))
                      }
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Interview Mode
                  </label>
                  <div className="flex space-x-4">
                    <label className="interview-mode-option">
                      <input
                        type="radio"
                        name="mode"
                        value="text"
                        checked={config.mode === "text"}
                        onChange={(e) =>
                          setConfig((prev) => ({
                            ...prev,
                            mode: e.target.value as "text" | "voice",
                          }))
                        }
                      />
                      <MessageCircle className="h-4 w-4" />
                      <span>Text-based</span>
                    </label>
                    <label className="interview-mode-option">
                      <input
                        type="radio"
                        name="mode"
                        value="voice"
                        checked={config.mode === "voice"}
                        onChange={(e) =>
                          setConfig((prev) => ({
                            ...prev,
                            mode: e.target.value as "text" | "voice",
                          }))
                        }
                      />
                      <Mic className="h-4 w-4" />
                      <span>Voice-enabled</span>
                    </label>
                  </div>
                </div>

                <Button
                  onClick={startInterview}
                  disabled={
                    isLoading ||
                    !config.role ||
                    !config.experience ||
                    !config.industry
                  }
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Preparing Interview...</span>
                    </>
                  ) : (
                    <span>Start Mock Interview</span>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          /* Interview Interface */
          <div className="max-w-4xl mx-auto">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Chat Interface */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <MessageCircle className="h-5 w-5 mr-2" />
                      Interview Session
                    </CardTitle>
                    <CardDescription>
                      Question {currentQuestionIndex + 1} of {questions.length}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {/* Messages */}
                    <div className="h-96 overflow-y-auto mb-4 p-4 bg-gray-50 rounded-lg space-y-4">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.type === "candidate" ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                              message.type === "candidate"
                                ? "bg-blue-600 text-white"
                                : "bg-white border text-gray-900"
                            }`}
                          >
                            <p className="text-sm whitespace-pre-wrap">
                              {message.content}
                            </p>
                            {message.score && (
                              <div className="mt-2 text-xs opacity-75">
                                Score: {message.score}/100
                              </div>
                            )}
                          </div>
                        </div>
                      ))}

                      {isEvaluating && (
                        <div className="flex justify-start">
                          <div className="bg-white border text-gray-900 px-4 py-2 rounded-lg">
                            <div className="flex items-center">
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              <span className="text-sm">
                                Analyzing your response...
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Response Input */}
                    <div className="space-y-4">
                      {config.mode === "voice" && (
                        <div className="voice-input-section">
                          <div className="voice-input-header">
                            <span className="voice-input-label">
                              Voice Input
                            </span>
                            {isSpeaking && (
                              <div className="ai-speaking-indicator">
                                <Volume2 className="h-4 w-4" />
                                <span>AI Speaking...</span>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant={isRecording ? "secondary" : "default"}
                              size="sm"
                              onClick={toggleRecording}
                              disabled={!voiceRecorder}
                              className="voice-recording-btn"
                            >
                              {isRecording ? (
                                <>
                                  <MicOff className="h-4 w-4" />
                                  <span>Stop Recording</span>
                                </>
                              ) : (
                                <>
                                  <Mic className="h-4 w-4" />
                                  <span>Start Recording</span>
                                </>
                              )}
                            </Button>
                            {transcript && (
                              <span className="text-sm text-gray-600">
                                Transcript: "{transcript}"
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="flex space-x-2">
                        <textarea
                          rows={3}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Type your response or use voice input above..."
                          value={currentResponse}
                          onChange={(e) => setCurrentResponse(e.target.value)}
                        />
                        <Button
                          onClick={submitResponse}
                          disabled={!currentResponse.trim() || isEvaluating}
                          className="self-end btn-icon-only"
                          title="Send Response"
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Interview Progress */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">
                      Interview Progress
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Questions</span>
                        <span>
                          {currentQuestionIndex + 1}/{questions.length}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{
                            width: `${((currentQuestionIndex + 1) / questions.length) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Interview Tips</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-gray-600 space-y-2">
                    <p>
                      • Use the STAR method (Situation, Task, Action, Result)
                    </p>
                    <p>• Provide specific examples from your experience</p>
                    <p>• Ask clarifying questions if needed</p>
                    <p>• Take your time to think before responding</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Minimal Footer */}
      <footer className="border-t border-gray-200 py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-3">
            <div className="flex items-center">
              <span className="text-slate-600 text-sm">
                &copy; 2025 Abhyas. All rights reserved.
              </span>
            </div>
            <div className="flex items-center">
              <a
                href="https://github.com/gloooomed/Abhyas"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-600 hover:text-blue-600 transition-colors"
              >
                <Github className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
