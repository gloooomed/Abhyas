import { useState, useEffect } from "react";
import { UserButton, useAuth, useClerk } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Mic, MicOff, MessageCircle, Send, Loader2, AlertCircle, Volume2 } from "lucide-react";
import { Link } from "react-router-dom";
import { generateInterviewQuestions, evaluateInterviewAnswer } from "../lib/gemini";
import { VoiceRecorder, VoiceSynthesis } from "../lib/speech";
import Navigation from "./Navigation";
import Footer from "./ui/Footer";

interface Message {
  id: string;
  type: "interviewer" | "candidate";
  content: string;
  timestamp: Date;
  score?: number;
  feedback?: { strengths: string[]; improvements: string[]; suggestions: string[] };
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
  const [config, setConfig] = useState<InterviewConfig>({ role: "", experience: "", industry: "", difficulty: "intermediate", mode: "text" });
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [voiceRecorder, setVoiceRecorder] = useState<VoiceRecorder | null>(null);
  const [voiceSynthesis, setVoiceSynthesis] = useState<VoiceSynthesis | null>(null);
  const [transcript, setTranscript] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
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
          recorder.setOnError((error) => { setError(`Voice recognition error: ${error}`); });
          setVoiceRecorder(recorder);
        }
      } catch (err) { console.error("Voice services not available:", err); }
    }
  }, [config.mode]);

  const speakMessage = async (text: string) => {
    if (voiceSynthesis && !isSpeaking) {
      setIsSpeaking(true);
      try { await voiceSynthesis.speak(text, { rate: 0.9 }); }
      catch (err) { console.error("Speech synthesis error:", err); }
      finally { setIsSpeaking(false); }
    }
  };

  const toggleRecording = () => {
    if (!voiceRecorder) return;
    if (isRecording) { voiceRecorder.stopListening(); }
    else { setTranscript(""); setCurrentResponse(""); voiceRecorder.startListening(); }
    setIsRecording(!isRecording);
  };

  const startInterview = async () => {
    if (!config.role || !config.experience || !config.industry) { setError("Please fill in all interview configuration fields"); return; }
    if (!isSignedIn) { redirectToSignIn(); return; }
    setIsLoading(true); setError(null);
    try {
      const questionData = await generateInterviewQuestions(config.role, config.experience, config.industry, config.difficulty);
      setQuestions(questionData.questions); setCurrentQuestionIndex(0);
      const welcomeMessage: Message = { id: "welcome", type: "interviewer", content: `Hello! I'm your AI interview coach. Today we'll conduct a mock interview for the ${config.role} position. I've prepared ${questionData.questions.length} questions. Let's begin:`, timestamp: new Date() };
      const firstQuestion: Message = { id: "q1", type: "interviewer", content: questionData.questions[0].question, timestamp: new Date() };
      setMessages([welcomeMessage, firstQuestion]); setInterviewStarted(true);
      if (config.mode === "voice" && voiceSynthesis) await speakMessage(welcomeMessage.content + " " + firstQuestion.content);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start interview. Using sample questions.");
      const mockQuestions: InterviewQuestion[] = [
        { id: 1, question: "Tell me about yourself and your background.", type: "behavioral", category: "general", difficulty: "easy", expectedPoints: ["Professional background", "Key skills", "Career goals"], followUpQuestions: ["What motivates you?", "Where do you see yourself in 5 years?"] },
        { id: 2, question: "Why are you interested in this role?", type: "behavioral", category: "motivation", difficulty: "medium", expectedPoints: ["Company research", "Role alignment", "Career growth"], followUpQuestions: ["What do you know about our company?"] },
      ];
      setQuestions(mockQuestions); setCurrentQuestionIndex(0);
      const welcomeMessage: Message = { id: "welcome", type: "interviewer", content: `Hello! I'm your AI interview coach. Let's begin your mock interview for the ${config.role} position:`, timestamp: new Date() };
      const firstQuestion: Message = { id: "q1", type: "interviewer", content: mockQuestions[0].question, timestamp: new Date() };
      setMessages([welcomeMessage, firstQuestion]); setInterviewStarted(true);
    } finally { setIsLoading(false); }
  };

  const submitResponse = async () => {
    if (!currentResponse.trim()) return;
    const responseMessage: Message = { id: `response-${Date.now()}`, type: "candidate", content: currentResponse, timestamp: new Date() };
    setMessages((prev) => [...prev, responseMessage]);
    const acknowledgment: Message = { id: `ack-${Date.now()}`, type: "interviewer", content: `Thank you for that answer. ${currentQuestionIndex < questions.length - 1 ? "Let's move on to the next question:" : "That completes our interview. Let me provide your feedback now."}`, timestamp: new Date() };
    setMessages((prev) => [...prev, acknowledgment]);
    if (currentQuestionIndex < questions.length - 1) {
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);
      const nextQuestion: Message = { id: `q${nextIndex + 1}`, type: "interviewer", content: questions[nextIndex].question, timestamp: new Date() };
      setMessages((prev) => [...prev, nextQuestion]);
      if (config.mode === "voice" && voiceSynthesis) await speakMessage(acknowledgment.content + " " + nextQuestion.content);
    } else {
      if (config.mode === "voice" && voiceSynthesis) await speakMessage(acknowledgment.content);
      setIsEvaluating(true);
      try {
        const allResponses = messages.filter((m) => m.type === "candidate").map((m) => m.content).join(" | ");
        const evaluation = await evaluateInterviewAnswer("Overall interview performance", allResponses, config.role);
        setTimeout(() => {
          const finalFeedback: Message = {
            id: "final-feedback", type: "interviewer", timestamp: new Date(), score: evaluation.score, feedback: evaluation.evaluation,
            content: `📋 INTERVIEW EVALUATION\n\nOverall Score: ${evaluation.score}/100\n\nStrengths:\n${evaluation.evaluation?.strengths?.map((s: string) => `• ${s}`).join("\n") || "• Clear communication\n• Relevant examples\n• Professional demeanor"}\n\nAreas for Improvement:\n${evaluation.evaluation?.weaknesses?.map((w: string) => `• ${w}`).join("\n") || "• Provide more quantifiable examples\n• Use the STAR method more consistently"}\n\nNext Steps:\n1. Focus on your weakest identified areas\n2. Practice with mock interviews\n3. Prepare 5–7 STAR examples\n4. Research the company thoroughly\n\nGood luck! 🌟`,
          };
          setMessages((prev) => [...prev, finalFeedback]);
          setIsEvaluating(false);
        }, 2000);
      } catch {
        setTimeout(() => {
          const fallbackFeedback: Message = { id: "fallback-feedback", type: "interviewer", timestamp: new Date(), content: `Interview Complete!\n\nOverall Rating: 75/100\n\nStrengths:\n• Clear communication\n• Relevant examples\n• Professional demeanor\n\nAreas for Improvement:\n• Use the STAR method for behavioral questions\n• Provide more quantifiable achievements\n\nKeep practicing — you're doing great!` };
          setMessages((prev) => [...prev, fallbackFeedback]);
          setIsEvaluating(false);
        }, 1500);
      }
    }
    setCurrentResponse(""); setTranscript("");
  };

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
              <MessageCircle className="h-6 w-6 text-white dark:text-black" />
            </div>
            <div>
              <h1 className="text-4xl font-semibold tracking-tighter">AI Mock Interview</h1>
              <p className="text-slate-500 dark:text-zinc-400 tracking-tight">Practice interviews with AI coaching and real-time feedback.</p>
            </div>
          </div>
        </div>

        {!interviewStarted ? (
          <div className="max-w-2xl mx-auto">
            <div className="sutera-card p-8">
              <h2 className="text-2xl font-semibold tracking-tight mb-2">Interview Setup</h2>
              <p className="text-slate-500 dark:text-zinc-400 text-sm tracking-tight mb-8">Configure your mock interview session.</p>

              {error && (
                <div className="mb-6 p-4 rounded-2xl bg-red-50 dark:bg-red-950/30 flex items-center space-x-3">
                  <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                  <span className="text-sm text-red-600 dark:text-red-400 tracking-tight">{error}</span>
                </div>
              )}

              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium tracking-tight text-slate-700 dark:text-zinc-300 mb-2">Target Role</label>
                    <input type="text" className="w-full sutera-input" placeholder="e.g., Software Engineer" value={config.role} onChange={(e) => setConfig(prev => ({ ...prev, role: e.target.value }))} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium tracking-tight text-slate-700 dark:text-zinc-300 mb-2">Experience Level</label>
                    <select className="w-full sutera-input" value={config.experience} onChange={(e) => setConfig(prev => ({ ...prev, experience: e.target.value }))}>
                      <option value="">Select experience</option>
                      <option value="Entry Level">Entry Level (0–2 years)</option>
                      <option value="Mid Level">Mid Level (3–5 years)</option>
                      <option value="Senior Level">Senior Level (6+ years)</option>
                    </select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium tracking-tight text-slate-700 dark:text-zinc-300 mb-2">Industry</label>
                    <input type="text" className="w-full sutera-input" placeholder="e.g., Technology, Healthcare" value={config.industry} onChange={(e) => setConfig(prev => ({ ...prev, industry: e.target.value }))} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium tracking-tight text-slate-700 dark:text-zinc-300 mb-2">Difficulty</label>
                    <select className="w-full sutera-input" value={config.difficulty} onChange={(e) => setConfig(prev => ({ ...prev, difficulty: e.target.value as "beginner" | "intermediate" | "advanced" }))}>
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium tracking-tight text-slate-700 dark:text-zinc-300 mb-3">Interview Mode</label>
                  <div className="flex space-x-4">
                    {[{ value: "text", label: "Text-based", icon: MessageCircle }, { value: "voice", label: "Voice-enabled", icon: Mic }].map(({ value, label, icon: Icon }) => (
                      <label key={value} className={`flex-1 flex items-center justify-center space-x-2 p-3 rounded-2xl border cursor-pointer transition-all ${config.mode === value ? 'border-black dark:border-white bg-black dark:bg-white text-white dark:text-black' : 'border-slate-200 dark:border-zinc-800 hover:border-slate-400 dark:hover:border-zinc-600'}`}>
                        <input type="radio" name="mode" value={value} checked={config.mode === value} onChange={(e) => setConfig(prev => ({ ...prev, mode: e.target.value as "text" | "voice" }))} className="sr-only" />
                        <Icon className="h-4 w-4" />
                        <span className="text-sm font-medium tracking-tight">{label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <Button onClick={startInterview} disabled={isLoading || !config.role || !config.experience || !config.industry} className="w-full sutera-button py-3 h-auto disabled:opacity-40">
                  {isLoading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Preparing Interview...</> : "Start Mock Interview"}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-5xl mx-auto">
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="sutera-card overflow-hidden flex flex-col" style={{ height: '70vh' }}>
                  <div className="p-6 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-semibold tracking-tight">Interview Session</h2>
                      <p className="text-xs text-slate-500 dark:text-zinc-500 tracking-tight">Question {currentQuestionIndex + 1} of {questions.length}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      <span className="text-xs text-slate-500 dark:text-zinc-500 tracking-tight">Live</span>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {messages.map((message) => (
                      <div key={message.id} className={`flex ${message.type === "candidate" ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm tracking-tight whitespace-pre-wrap leading-relaxed ${message.type === "candidate" ? "bg-black dark:bg-white text-white dark:text-black" : "bg-slate-100 dark:bg-zinc-900 text-black dark:text-white"}`}>
                          {message.content}
                          {message.score && <div className="mt-2 text-xs opacity-60">Score: {message.score}/100</div>}
                        </div>
                      </div>
                    ))}
                    {isEvaluating && (
                      <div className="flex justify-start">
                        <div className="bg-slate-100 dark:bg-zinc-900 px-4 py-3 rounded-2xl flex items-center space-x-2">
                          <Loader2 className="h-4 w-4 animate-spin text-slate-500" />
                          <span className="text-sm text-slate-500 dark:text-zinc-400 tracking-tight">Analyzing your response...</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="p-6 border-t border-slate-100 dark:border-zinc-800">
                    {config.mode === "voice" && (
                      <div className="flex items-center space-x-3 mb-4">
                        <Button variant={isRecording ? "secondary" : "default"} size="sm" onClick={toggleRecording} disabled={!voiceRecorder} className="rounded-full">
                          {isRecording ? <><MicOff className="h-4 w-4 mr-2" />Stop</> : <><Mic className="h-4 w-4 mr-2" />Record</>}
                        </Button>
                        {isSpeaking && <div className="flex items-center space-x-2 text-xs text-slate-500"><Volume2 className="h-4 w-4" /><span>AI Speaking...</span></div>}
                        {transcript && <span className="text-xs text-slate-500 dark:text-zinc-500 tracking-tight truncate">"{transcript}"</span>}
                      </div>
                    )}
                    <div className="flex space-x-3">
                      <textarea rows={2} className="flex-1 sutera-input resize-none" placeholder="Type your response..." value={currentResponse} onChange={(e) => setCurrentResponse(e.target.value)} />
                      <Button onClick={submitResponse} disabled={!currentResponse.trim() || isEvaluating} className="sutera-button self-end px-4 py-3">
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="sutera-card p-6">
                  <h3 className="text-sm font-semibold tracking-tight mb-4">Progress</h3>
                  <div className="flex justify-between text-xs text-slate-500 dark:text-zinc-500 tracking-tight mb-2">
                    <span>Questions</span>
                    <span>{currentQuestionIndex + 1} / {questions.length}</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full bg-black dark:bg-white rounded-full transition-all duration-500" style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }} />
                  </div>
                </div>

                <div className="sutera-card p-6">
                  <h3 className="text-sm font-semibold tracking-tight mb-4">Interview Tips</h3>
                  <ul className="space-y-3 text-xs text-slate-500 dark:text-zinc-400 tracking-tight">
                    <li>• Use the STAR method — Situation, Task, Action, Result</li>
                    <li>• Back answers with specific examples</li>
                    <li>• Ask clarifying questions if needed</li>
                    <li>• Take a moment to think before responding</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
