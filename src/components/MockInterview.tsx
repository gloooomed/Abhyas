import { useState, useEffect, useRef, useCallback } from "react";
import { UserButton, useAuth, useClerk } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft, Mic, MicOff, MessageCircle, Send, Loader2,
  AlertCircle, Volume2, Users, Code2, Server, Handshake,
  Briefcase, Shuffle, ChevronRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  generateInterviewQuestions,
  evaluateInterviewAnswer,
  generateFinalReport,
  type InterviewType,
  type InterviewQuestion as IInterviewQuestion,
  type EvaluationResult,
  type PerQuestionResult,
  type FinalReport,
} from "../lib/gemini";
import { VoiceRecorder, VoiceSynthesis } from "../lib/speech";
import Navigation from "./Navigation";
import Footer from "./ui/Footer";
import InterviewScorecard from "./interview/InterviewScorecard";
import InterviewQuestionCard from "./interview/InterviewQuestionCard";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Message {
  id: string;
  type: "interviewer" | "candidate" | "guardrail" | "score";
  content: string;
  timestamp: Date;
  evaluation?: EvaluationResult;
  isFollowUp?: boolean;
}

interface InterviewConfig {
  role: string;
  experience: string;
  industry: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  mode: "text" | "voice";
  interviewType: InterviewType;
}

// ─── Interview Type Config ────────────────────────────────────────────────────

const INTERVIEW_TYPES: {
  value: InterviewType;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
    { value: "behavioral", label: "Behavioral", description: "STAR-based situational questions", icon: Users },
    { value: "technical", label: "Technical", description: "Domain & role-specific knowledge", icon: Code2 },
    { value: "system-design", label: "System Design", description: "Architecture & trade-offs", icon: Server },
    { value: "hr", label: "HR Round", description: "Culture fit & expectations", icon: Handshake },
    { value: "case-study", label: "Case Study", description: "Business problem solving", icon: Briefcase },
    { value: "mixed", label: "Mixed Round", description: "All-round comprehensive interview", icon: Shuffle },
  ];

// ─── Score Pill Component ─────────────────────────────────────────────────────

function ScorePill({ evaluation }: { evaluation: EvaluationResult }) {
  if (evaluation.status !== "evaluated" || !evaluation.score) return null;
  const score = evaluation.score;
  const color = score >= 85 ? "#10b981" : score >= 70 ? "#3b82f6" : score >= 55 ? "#f59e0b" : "#ef4444";
  const dims = evaluation.dimensions;

  return (
    <div className="mt-2 flex items-center gap-3 flex-wrap">
      <span
        className="text-xs font-semibold px-2.5 py-1 rounded-full"
        style={{ color, backgroundColor: `${color}18` }}
      >
        Score: {score}/100
      </span>
      {dims && (
        <div className="flex items-center gap-1.5">
          {[
            { label: "R", val: dims.relevance, max: 25, title: "Relevance" },
            { label: "S", val: dims.specificity, max: 25, title: "Specificity" },
            { label: "D", val: dims.depth, max: 25, title: "Depth" },
            { label: "C", val: dims.communication, max: 25, title: "Communication" },
          ].map(({ label, val, max, title }) => (
            <div key={label} className="group relative flex items-center gap-1">
              <span className="text-xs text-slate-400 dark:text-zinc-500 font-medium" title={title}>{label}</span>
              <div className="w-8 h-1.5 bg-slate-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${(val / max) * 100}%`, backgroundColor: color }}
                />
              </div>
              <span className="text-xs text-slate-400 dark:text-zinc-500">{val}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function MockInterview() {
  const { isSignedIn } = useAuth();
  const { redirectToSignIn } = useClerk();

  // Config state
  const [config, setConfig] = useState<InterviewConfig>({
    role: "", experience: "", industry: "",
    difficulty: "intermediate", mode: "text", interviewType: "mixed",
  });

  // Interview session state
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [interviewComplete, setInterviewComplete] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [questions, setQuestions] = useState<IInterviewQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentResponse, setCurrentResponse] = useState("");
  const [perQuestionResults, setPerQuestionResults] = useState<PerQuestionResult[]>([]);
  const [finalReport, setFinalReport] = useState<FinalReport | null>(null);

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usingMockData, setUsingMockData] = useState(false);
  const [quotaExceeded, setQuotaExceeded] = useState(false);

  // Guardrail state
  const [clarifyAttempts, setClarifyAttempts] = useState(0);
  const [awaitingClarification, setAwaitingClarification] = useState(false);

  // Voice state
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [voiceRecorder, setVoiceRecorder] = useState<VoiceRecorder | null>(null);
  const [voiceSynthesis, setVoiceSynthesis] = useState<VoiceSynthesis | null>(null);

  // Refs
  const chatEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Word count of current response
  const wordCount = currentResponse.trim().split(/\s+/).filter(Boolean).length;

  // ── Voice setup ──────────────────────────────────────────────────────────

  useEffect(() => {
    if (typeof window === "undefined") return;
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
        recorder.setOnError((err) => setError(`Voice recognition error: ${err}`));
        setVoiceRecorder(recorder);
      }
    } catch (err) {
      console.error("Voice services not available:", err);
    }
  }, [config.mode]);

  // ── Auto-scroll chat ─────────────────────────────────────────────────────

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isEvaluating]);

  // ── Speech helper ────────────────────────────────────────────────────────

  const speakMessage = useCallback(async (text: string) => {
    if (voiceSynthesis && !isSpeaking) {
      setIsSpeaking(true);
      try { await voiceSynthesis.speak(text, { rate: 0.9 }); }
      catch (err) { console.error("Speech synthesis error:", err); }
      finally { setIsSpeaking(false); }
    }
  }, [voiceSynthesis, isSpeaking]);

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

  // ── Add message helper ───────────────────────────────────────────────────

  const addMessage = (msg: Omit<Message, "id" | "timestamp">) => {
    setMessages((prev) => [
      ...prev,
      { ...msg, id: `${msg.type}-${Date.now()}`, timestamp: new Date() },
    ]);
  };

  // ── Start interview ──────────────────────────────────────────────────────

  const startInterview = async () => {
    if (!config.role || !config.experience || !config.industry) {
      setError("Please fill in all required fields");
      return;
    }
    if (!config.interviewType) {
      setError("Please select an interview type");
      return;
    }
    if (!isSignedIn) { redirectToSignIn(); return; }

    setIsLoading(true);
    setError(null);

    try {
      const questionData = await generateInterviewQuestions(
        config.role, config.experience, config.industry,
        config.difficulty, config.interviewType,
      );

      // Detect if we fell back to mock data
      const qd = questionData as typeof questionData & { isDemoData?: boolean; isQuotaExceeded?: boolean };
      if (qd.isDemoData) {
        setUsingMockData(true);
        if (qd.isQuotaExceeded) setQuotaExceeded(true);
      }

      const qs: IInterviewQuestion[] = questionData.questions ?? [];
      setQuestions(qs);
      setCurrentQuestionIndex(0);
      setClarifyAttempts(0);
      setAwaitingClarification(false);
      setPerQuestionResults([]);

      const welcome = `Hello! I'm your AI interviewer. Today we're running a ${config.interviewType.replace("-", " ")} interview for the ${config.role} position. I've prepared ${qs.length} questions tailored to your role. Let's get started.`;
      addMessage({ type: "interviewer", content: welcome });
      addMessage({ type: "interviewer", content: qs[0]?.question ?? "Tell me about yourself." });
      setInterviewStarted(true);

      if (config.mode === "voice" && voiceSynthesis) {
        await speakMessage(welcome + " " + (qs[0]?.question ?? ""));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to prepare interview. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // ── Submit response ──────────────────────────────────────────────────────

  const submitResponse = async () => {
    if (!currentResponse.trim() || isEvaluating) return;

    const responseText = currentResponse.trim();
    addMessage({ type: "candidate", content: responseText });
    setCurrentResponse("");
    setTranscript("");
    setIsEvaluating(true);

    const currentQ = questions[currentQuestionIndex];

    try {
      const evaluation = await evaluateInterviewAnswer(
        currentQ?.question ?? "",
        responseText,
        config.role,
        currentQ?.scoringRubric,
        currentQ?.minWordCount ?? 40,
      );

      // Detect quota fallback on evaluation
      const ev = evaluation as typeof evaluation & { isDemoData?: boolean; isQuotaExceeded?: boolean };
      if (ev.isDemoData) {
        setUsingMockData(true);
        if (ev.isQuotaExceeded) setQuotaExceeded(true);
      }

      if (evaluation.status === "needs_clarification" && clarifyAttempts < 2) {
        // ── Guardrail: ask for more detail ────────────────────────────────
        setClarifyAttempts((prev) => prev + 1);
        setAwaitingClarification(true);
        addMessage({
          type: "guardrail",
          content: evaluation.clarifyingPrompt ??
            "Could you elaborate with a specific example from your experience?",
          isFollowUp: true,
        });
        if (config.mode === "voice" && voiceSynthesis) {
          await speakMessage(evaluation.clarifyingPrompt ?? "");
        }
        setIsEvaluating(false);
        textareaRef.current?.focus();
        return;
      }

      // ── Evaluated: store result & advance ─────────────────────────────
      setAwaitingClarification(false);
      setClarifyAttempts(0);

      const pqResult: PerQuestionResult = {
        questionIndex: currentQuestionIndex,
        question: currentQ?.question ?? "",
        answer: responseText,
        score: evaluation.score ?? 60,
        dimensions: evaluation.dimensions ?? { relevance: 15, specificity: 15, depth: 15, communication: 15 },
        keyFeedback: evaluation.improvements?.[0] ?? evaluation.strengths?.[0] ?? "Good effort.",
      };
      setPerQuestionResults((prev) => [...prev, pqResult]);

      // Add interviewer ack with score pill
      addMessage({
        type: "score",
        content: evaluation.interviewerResponse,
        evaluation,
      });

      const isLastQuestion = currentQuestionIndex >= questions.length - 1;

      if (!isLastQuestion) {
        const nextIdx = currentQuestionIndex + 1;
        setCurrentQuestionIndex(nextIdx);
        setTimeout(() => {
          addMessage({ type: "interviewer", content: questions[nextIdx].question });
          if (config.mode === "voice" && voiceSynthesis) {
            speakMessage(questions[nextIdx].question);
          }
        }, 600);
      } else {
        // ── All questions answered — generate final report ────────────────
        setInterviewComplete(true);
        addMessage({
          type: "interviewer",
          content: "That completes the interview. Excellent effort! Generating your detailed report now...",
        });
        setIsGeneratingReport(true);
        try {
          const allResults = [...perQuestionResults, pqResult];
          const report = await generateFinalReport(config.role, config.interviewType, allResults);
          setFinalReport(report);
        } catch {
          // Use partial data already in state
        } finally {
          setIsGeneratingReport(false);
        }
      }
    } catch (err) {
      console.error("Evaluation error:", err);
      addMessage({
        type: "interviewer",
        content: "Thank you for your answer. Let's move on.",
      });
      const nextIdx = currentQuestionIndex + 1;
      if (nextIdx < questions.length) {
        setCurrentQuestionIndex(nextIdx);
        setTimeout(() => {
          addMessage({ type: "interviewer", content: questions[nextIdx].question });
        }, 400);
      }
    } finally {
      setIsEvaluating(false);
    }
  };

  // ── Handle Enter key ─────────────────────────────────────────────────────

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submitResponse();
    }
  };

  // ── Reset interview ───────────────────────────────────────────────────────

  const resetInterview = () => {
    setInterviewStarted(false);
    setInterviewComplete(false);
    setMessages([]);
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setCurrentResponse("");
    setPerQuestionResults([]);
    setFinalReport(null);
    setError(null);
    setClarifyAttempts(0);
    setAwaitingClarification(false);
    setUsingMockData(false);
    setQuotaExceeded(false);
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white flex flex-col transition-colors duration-300">
      <Navigation showUserButton={isSignedIn} userButtonComponent={<UserButton afterSignOutUrl="/" />} />

      <main className="flex-1 container mx-auto px-4 max-w-7xl pt-32 pb-16">
        {/* Page header */}
        <div className="mb-10">
          <Link
            to={isSignedIn ? "/dashboard" : "/"}
            className="inline-flex items-center text-sm text-slate-500 dark:text-zinc-500 hover:text-black dark:hover:text-white mb-6 transition-colors tracking-tight"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {isSignedIn ? "Back to Dashboard" : "Back to Home"}
          </Link>
          <div className="flex items-center space-x-4 mb-2">
            <div className="h-12 w-12 rounded-2xl bg-black dark:bg-white flex items-center justify-center flex-shrink-0">
              <MessageCircle className="h-6 w-6 text-white dark:text-black" />
            </div>
            <div>
              <h1 className="text-4xl font-semibold tracking-tighter">AI Mock Interview</h1>
              <p className="text-slate-500 dark:text-zinc-400 tracking-tight text-sm">
                Role-specific interview questions · Per-answer grading · Full scorecard
              </p>
            </div>
          </div>
        </div>

        {/* ── SETUP SCREEN ─────────────────────────────────────────────── */}
        {!interviewStarted ? (
          <div className="max-w-2xl mx-auto">
            <div className="sutera-card p-8">
              <h2 className="text-2xl font-semibold tracking-tight mb-1">Interview Setup</h2>
              <p className="text-slate-500 dark:text-zinc-400 text-sm tracking-tight mb-8">
                Configure your session and select your interview style.
              </p>

              {error && (
                <div className="mb-6 p-4 rounded-2xl bg-red-50 dark:bg-red-950/30 flex items-center space-x-3">
                  <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                  <span className="text-sm text-red-600 dark:text-red-400 tracking-tight">{error}</span>
                </div>
              )}

              <div className="space-y-6">
                {/* Role + Experience */}
                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium tracking-tight text-slate-700 dark:text-zinc-300 mb-2">
                      Target Role *
                    </label>
                    <input
                      type="text"
                      className="w-full sutera-input"
                      placeholder="e.g., Product Manager, Data Scientist"
                      value={config.role}
                      onChange={(e) => setConfig((p) => ({ ...p, role: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium tracking-tight text-slate-700 dark:text-zinc-300 mb-2">
                      Experience Level *
                    </label>
                    <select
                      className="w-full sutera-input"
                      value={config.experience}
                      onChange={(e) => setConfig((p) => ({ ...p, experience: e.target.value }))}
                    >
                      <option value="">Select experience</option>
                      <option value="Entry Level">Entry Level (0–2 years)</option>
                      <option value="Mid Level">Mid Level (3–5 years)</option>
                      <option value="Senior Level">Senior Level (6+ years)</option>
                    </select>
                  </div>
                </div>

                {/* Industry + Difficulty */}
                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium tracking-tight text-slate-700 dark:text-zinc-300 mb-2">
                      Industry *
                    </label>
                    <input
                      type="text"
                      className="w-full sutera-input"
                      placeholder="e.g., Technology, Finance, Healthcare"
                      value={config.industry}
                      onChange={(e) => setConfig((p) => ({ ...p, industry: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium tracking-tight text-slate-700 dark:text-zinc-300 mb-2">
                      Difficulty
                    </label>
                    <select
                      className="w-full sutera-input"
                      value={config.difficulty}
                      onChange={(e) =>
                        setConfig((p) => ({ ...p, difficulty: e.target.value as InterviewConfig["difficulty"] }))
                      }
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>
                </div>

                {/* Interview Type Selector */}
                <div>
                  <label className="block text-sm font-medium tracking-tight text-slate-700 dark:text-zinc-300 mb-3">
                    Interview Type *
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {INTERVIEW_TYPES.map(({ value, label, description, icon: Icon }) => {
                      const selected = config.interviewType === value;
                      return (
                        <button
                          key={value}
                          type="button"
                          onClick={() => setConfig((p) => ({ ...p, interviewType: value }))}
                          className={`relative flex flex-col items-start gap-1.5 p-3.5 rounded-2xl border text-left transition-all duration-200 ${selected
                              ? "border-black dark:border-white bg-black dark:bg-white text-white dark:text-black shadow-md"
                              : "border-slate-200 dark:border-zinc-800 hover:border-slate-400 dark:hover:border-zinc-600 text-slate-700 dark:text-zinc-300"
                            }`}
                        >
                          <Icon className={`h-4 w-4 ${selected ? "opacity-100" : "opacity-60"}`} />
                          <span className="text-xs font-semibold tracking-tight">{label}</span>
                          <span className={`text-xs tracking-tight leading-tight ${selected ? "opacity-75" : "text-slate-500 dark:text-zinc-500"}`}>
                            {description}
                          </span>
                          {selected && (
                            <div className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-white dark:bg-black" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Interview Mode */}
                <div>
                  <label className="block text-sm font-medium tracking-tight text-slate-700 dark:text-zinc-300 mb-3">
                    Interview Mode
                  </label>
                  <div className="flex gap-3">
                    {[
                      { value: "text", label: "Text-based", icon: MessageCircle },
                      { value: "voice", label: "Voice-enabled", icon: Mic },
                    ].map(({ value, label, icon: Icon }) => (
                      <label
                        key={value}
                        className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-2xl border cursor-pointer transition-all ${config.mode === value
                            ? "border-black dark:border-white bg-black dark:bg-white text-white dark:text-black"
                            : "border-slate-200 dark:border-zinc-800 hover:border-slate-400 dark:hover:border-zinc-600"
                          }`}
                      >
                        <input
                          type="radio" name="mode" value={value} className="sr-only"
                          checked={config.mode === value}
                          onChange={(e) => setConfig((p) => ({ ...p, mode: e.target.value as "text" | "voice" }))}
                        />
                        <Icon className="h-4 w-4" />
                        <span className="text-sm font-medium tracking-tight">{label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={startInterview}
                  disabled={isLoading || !config.role || !config.experience || !config.industry}
                  className="w-full sutera-button py-3 h-auto disabled:opacity-40"
                >
                  {isLoading ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Preparing Interview...</>
                  ) : (
                    <span className="flex items-center gap-2">
                      Start Mock Interview <ChevronRight className="h-4 w-4" />
                    </span>
                  )}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          /* ── INTERVIEW SESSION ─────────────────────────────────────────── */
          <div className="max-w-6xl mx-auto">

            {/* ── Quota / Mock Data Banner ─────────────────────────────── */}
            {usingMockData && (
              <div className={`mb-5 flex items-start gap-3 px-5 py-4 rounded-2xl border ${
                quotaExceeded
                  ? "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800"
                  : "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800"
              }`}>
                <AlertCircle className={`h-5 w-5 flex-shrink-0 mt-0.5 ${
                  quotaExceeded ? "text-amber-500" : "text-blue-500"
                }`} />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold tracking-tight ${
                    quotaExceeded ? "text-amber-800 dark:text-amber-300" : "text-blue-800 dark:text-blue-300"
                  }`}>
                    {quotaExceeded ? "AI Quota Exceeded — Using Sample Data" : "Using Sample Data"}
                  </p>
                  <p className={`text-xs tracking-tight mt-0.5 ${
                    quotaExceeded ? "text-amber-700 dark:text-amber-400" : "text-blue-700 dark:text-blue-400"
                  }`}>
                    {quotaExceeded
                      ? "Your Gemini API key has hit its daily free-tier limit. Questions and scores shown are pre-set samples, not AI-generated. Update your API key in .env.local or wait until tomorrow for the quota to reset."
                      : "The AI couldn't generate a response and fell back to sample data. Scores and questions may not reflect your actual performance."}
                  </p>
                </div>
                <button
                  onClick={() => setUsingMockData(false)}
                  className={`text-xs font-medium flex-shrink-0 hover:opacity-70 transition-opacity ${
                    quotaExceeded ? "text-amber-600 dark:text-amber-400" : "text-blue-600 dark:text-blue-400"
                  }`}
                >
                  Dismiss
                </button>
              </div>
            )}

            <div className="grid lg:grid-cols-3 gap-6">

              {/* ── Chat Panel ─────────────────────────────────────────── */}
              <div className="lg:col-span-2">
                <div
                  className="sutera-card !overflow-hidden flex flex-col"
                  style={{ height: "72vh" }}
                >
                  {/* Chat header */}
                  <div className="px-6 py-4 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between flex-shrink-0">
                    <div>
                      <h2 className="text-base font-semibold tracking-tight">Interview Session</h2>
                      <p className="text-xs text-slate-500 dark:text-zinc-500 tracking-tight">
                        {interviewComplete
                          ? "Interview complete"
                          : `Question ${currentQuestionIndex + 1} of ${questions.length}`}
                        {" · "}
                        <span className="capitalize">{config.interviewType.replace("-", " ")} round</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {!interviewComplete && (
                        <>
                          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                          <span className="text-xs text-slate-500 dark:text-zinc-500 tracking-tight">Live</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Progress bar */}
                  {!interviewComplete && questions.length > 0 && (
                    <div className="h-0.5 bg-slate-100 dark:bg-zinc-800 flex-shrink-0">
                      <div
                        className="h-full bg-black dark:bg-white transition-all duration-700"
                        style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                      />
                    </div>
                  )}

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
                    {messages.map((msg) => {
                      // ── Guardrail bubble ──────────────────────────────
                      if (msg.type === "guardrail") {
                        return (
                          <div key={msg.id} className="flex justify-start">
                            <div className="max-w-[82%] px-4 py-3 rounded-2xl text-sm tracking-tight leading-relaxed bg-amber-50 dark:bg-amber-950/30 border-l-4 border-amber-400 text-amber-800 dark:text-amber-200">
                              <div className="text-xs font-semibold text-amber-600 dark:text-amber-400 mb-1">
                                Follow-up needed
                              </div>
                              {msg.content}
                            </div>
                          </div>
                        );
                      }

                      // ── Score bubble (interviewer ack + score pill) ────
                      if (msg.type === "score") {
                        return (
                          <div key={msg.id} className="flex justify-start">
                            <div className="max-w-[82%]">
                              <div className="px-4 py-3 rounded-2xl text-sm tracking-tight leading-relaxed bg-slate-100 dark:bg-zinc-900 text-black dark:text-white">
                                {msg.content}
                              </div>
                              {msg.evaluation && (
                                <ScorePill evaluation={msg.evaluation} />
                              )}
                            </div>
                          </div>
                        );
                      }

                      // ── Standard interviewer / candidate bubbles ───────
                      const isCandidate = msg.type === "candidate";
                      return (
                        <div key={msg.id} className={`flex ${isCandidate ? "justify-end" : "justify-start"}`}>
                          <div
                            className={`max-w-[82%] px-4 py-3 rounded-2xl text-sm tracking-tight whitespace-pre-wrap leading-relaxed ${isCandidate
                                ? "bg-black dark:bg-white text-white dark:text-black"
                                : "bg-slate-100 dark:bg-zinc-900 text-black dark:text-white"
                              }`}
                          >
                            {msg.content}
                          </div>
                        </div>
                      );
                    })}

                    {/* Evaluating indicator */}
                    {isEvaluating && (
                      <div className="flex justify-start">
                        <div className="bg-slate-100 dark:bg-zinc-900 px-4 py-3 rounded-2xl flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                          <span className="text-sm text-slate-500 dark:text-zinc-400 tracking-tight">
                            Evaluating your answer...
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Generating report indicator */}
                    {isGeneratingReport && (
                      <div className="flex justify-start">
                        <div className="bg-slate-100 dark:bg-zinc-900 px-4 py-3 rounded-2xl flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                          <span className="text-sm text-slate-500 dark:text-zinc-400 tracking-tight">
                            Generating your full scorecard...
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Final Scorecard */}
                    {finalReport && !isGeneratingReport && (
                      <div className="mt-2">
                        <InterviewScorecard
                          report={finalReport}
                          role={config.role}
                          interviewType={config.interviewType}
                          onStartNew={resetInterview}
                        />
                      </div>
                    )}

                    <div ref={chatEndRef} />
                  </div>

                  {/* Input area — hidden when complete */}
                  {!interviewComplete && (
                    <div className="px-6 py-4 border-t border-slate-100 dark:border-zinc-800 flex-shrink-0 space-y-3">
                      {/* Voice controls */}
                      {config.mode === "voice" && (
                        <div className="flex items-center gap-3">
                          <Button
                            variant={isRecording ? "secondary" : "default"}
                            size="sm"
                            onClick={toggleRecording}
                            disabled={!voiceRecorder}
                            className="rounded-full"
                          >
                            {isRecording
                              ? <><MicOff className="h-4 w-4 mr-2" />Stop</>
                              : <><Mic className="h-4 w-4 mr-2" />Record</>
                            }
                          </Button>
                          {isSpeaking && (
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                              <Volume2 className="h-4 w-4" />
                              <span>AI Speaking...</span>
                            </div>
                          )}
                          {transcript && (
                            <span className="text-xs text-slate-500 dark:text-zinc-500 tracking-tight truncate">
                              "{transcript}"
                            </span>
                          )}
                        </div>
                      )}

                      {/* Guardrail hint */}
                      {awaitingClarification && (
                        <div className="text-xs text-amber-600 dark:text-amber-400 tracking-tight flex items-center gap-1.5">
                          <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                          Your previous answer needs more detail. Try including a specific example.
                          {clarifyAttempts >= 2 && " (Last attempt — submitting will advance.)"}
                        </div>
                      )}

                      {/* Text input */}
                      <div className="flex gap-3">
                        <textarea
                          ref={textareaRef}
                          rows={2}
                          className="flex-1 sutera-input resize-none leading-relaxed"
                          placeholder={
                            awaitingClarification
                              ? "Elaborate with a specific example..."
                              : "Type your answer here... (Shift+Enter for new line)"
                          }
                          value={currentResponse}
                          onChange={(e) => setCurrentResponse(e.target.value)}
                          onKeyDown={handleKeyDown}
                          disabled={isEvaluating}
                        />
                        <Button
                          onClick={submitResponse}
                          disabled={!currentResponse.trim() || isEvaluating}
                          className="sutera-button self-end px-4 py-3"
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* ── Sidebar ────────────────────────────────────────────── */}
              <div className="space-y-5">
                {/* Question context card */}
                <InterviewQuestionCard
                  question={questions[currentQuestionIndex] ?? null}
                  questionNumber={currentQuestionIndex + 1}
                  totalQuestions={questions.length}
                  interviewType={config.interviewType}
                  answerWordCount={wordCount}
                />

                {/* Running scores */}
                {perQuestionResults.length > 0 && (
                  <div className="sutera-card p-5">
                    <h3 className="text-sm font-semibold tracking-tight mb-3">Running Scores</h3>
                    <div className="space-y-2">
                      {perQuestionResults.map((r, i) => {
                        const color =
                          r.score >= 85 ? "#10b981"
                            : r.score >= 70 ? "#3b82f6"
                              : r.score >= 55 ? "#f59e0b"
                                : "#ef4444";
                        return (
                          <div key={i} className="flex items-center gap-2">
                            <span className="text-xs text-slate-500 dark:text-zinc-400 w-6 tracking-tight flex-shrink-0">
                              Q{i + 1}
                            </span>
                            <div className="flex-1 h-1.5 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full"
                                style={{ width: `${r.score}%`, backgroundColor: color }}
                              />
                            </div>
                            <span className="text-xs font-semibold w-8 text-right" style={{ color }}>
                              {r.score}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                    {perQuestionResults.length > 1 && (
                      <div className="mt-3 pt-3 border-t border-slate-100 dark:border-zinc-800 flex justify-between text-xs tracking-tight">
                        <span className="text-slate-500 dark:text-zinc-400">Average</span>
                        <span className="font-semibold text-slate-700 dark:text-zinc-300">
                          {Math.round(perQuestionResults.reduce((a, r) => a + r.score, 0) / perQuestionResults.length)}/100
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
