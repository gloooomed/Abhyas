import { useState } from "react";
import { UserButton, useAuth, useClerk } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BarChart3, BookOpen, Loader2, AlertCircle, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { analyzeSkillsGap } from "../lib/ai";
import Navigation from "./Navigation";
import Footer from "./ui/Footer";

interface SkillGapResult {
  gapAnalysis: {
    missingSkills: string[];
    skillsToImprove: string[];
    strongSkills: string[];
  };
  recommendations: Array<{
    skill: string;
    priority: "High" | "Medium" | "Low";
    timeToLearn: string;
    resources: Array<{ title: string; type: string; provider: string; url: string; duration: string; difficulty: string }>;
  }>;
  careerPath: { nextSteps: string[]; timelineMonths: number; salaryProjection: string };
  isDemoData?: boolean;
  isError?: boolean;
  note?: string;
}

export default function SkillsGapAnalysis() {
  const { isSignedIn } = useAuth();
  const { redirectToSignIn } = useClerk();
  const [currentSkills, setCurrentSkills] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [experience] = useState("");
  const [industry] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<SkillGapResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [usingMockData, setUsingMockData] = useState(false);
  const [quotaExceeded, setQuotaExceeded] = useState(false);

  const handleAnalysis = async () => {
    if (!currentSkills.trim() || !targetRole.trim()) return;
    if (!isSignedIn) { redirectToSignIn(); return; }
    setIsAnalyzing(true);
    setError(null);
    setUsingMockData(false);
    setQuotaExceeded(false);

    try {
      const skillsArray = currentSkills.split(",").map(s => s.trim()).filter(s => s.length > 0);
      const analysisResult = await analyzeSkillsGap(skillsArray, targetRole, experience || "Entry Level", industry || "Technology");
      if (analysisResult && typeof analysisResult === "object") {
        setResult(analysisResult);
        // analyzeSkillsGap already catches quota errors internally and sets isDemoData
        if ((analysisResult as SkillGapResult).isDemoData) {
          setUsingMockData(true);
          // Check if the note mentions quota
          const note = (analysisResult as SkillGapResult).note ?? "";
          if (note.includes("quota") || note.includes("429")) setQuotaExceeded(true);
        }
      } else throw new Error("Invalid response format from AI analysis");
    } catch (err: unknown) {
      const e = err as { message?: string; status?: number };
      const isQuota = e.status === 429 || Boolean(e.message?.includes("quota")) || Boolean(e.message?.includes("429"));
      setUsingMockData(true);
      setQuotaExceeded(isQuota);
      if (!isQuota) {
        setError(`Analysis failed: ${err instanceof Error ? err.message : "Unknown error"}. Showing sample data.`);
      }
      setResult({
        gapAnalysis: {
          missingSkills: ["React.js", "TypeScript", "Node.js", "AWS", "Docker"],
          skillsToImprove: ["JavaScript ES6+", "Database Design", "API Development", "Testing"],
          strongSkills: ["HTML", "CSS", "Basic JavaScript"],
        },
        recommendations: [{
          skill: "React.js", priority: "High", timeToLearn: "2-3 months",
          resources: [{ title: "React Official Documentation", type: "Documentation", provider: "React Team", url: "https://react.dev/", duration: "Self-paced", difficulty: "Intermediate" }],
        }],
        careerPath: { nextSteps: ["Master React.js", "Learn TypeScript", "Build portfolio projects"], timelineMonths: 6, salaryProjection: "$60,000 - $80,000" },
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white flex flex-col transition-colors duration-300">
      <Navigation showUserButton={isSignedIn} userButtonComponent={<UserButton afterSignOutUrl="/" />} />

      <main className="flex-1 container mx-auto px-4 max-w-7xl pt-32 pb-16">
        {/* Page Header */}
        <div className="mb-12">
          <Link to={isSignedIn ? "/dashboard" : "/"} className="inline-flex items-center text-sm text-slate-500 dark:text-zinc-500 hover:text-black dark:hover:text-white mb-6 transition-colors tracking-tight">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {isSignedIn ? "Back to Dashboard" : "Back to Home"}
          </Link>
          <div className="flex items-center space-x-4 mb-4">
            <div className="h-12 w-12 rounded-2xl bg-black dark:bg-white flex items-center justify-center flex-shrink-0">
              <BarChart3 className="h-6 w-6 text-white dark:text-black" />
            </div>
            <div>
              <h1 className="text-4xl font-semibold tracking-tighter">Skills Gap Analysis</h1>
              <p className="text-slate-500 dark:text-zinc-400 tracking-tight">Identify gaps and get a personalized learning roadmap.</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Input Form */}
          <div className="sutera-card p-8">
            <h2 className="text-2xl font-semibold tracking-tight mb-2">Analyze Your Skills</h2>
            <p className="text-slate-500 dark:text-zinc-400 text-sm tracking-tight mb-8">Enter your skills and target role to get recommendations.</p>
            <div className="space-y-6">
              <div>
                <label htmlFor="current-skills" className="block text-sm font-medium tracking-tight text-slate-700 dark:text-zinc-300 mb-2">Current Skills</label>
                <textarea id="current-skills" rows={4} className="w-full sutera-input" placeholder="e.g., HTML, CSS, JavaScript, Python, Project Management..." value={currentSkills} onChange={(e) => setCurrentSkills(e.target.value)} />
              </div>
              <div>
                <label htmlFor="target-role" className="block text-sm font-medium tracking-tight text-slate-700 dark:text-zinc-300 mb-2">Target Role</label>
                <input id="target-role" type="text" className="w-full sutera-input" placeholder="e.g., Senior Frontend Developer, Product Manager..." value={targetRole} onChange={(e) => setTargetRole(e.target.value)} />
              </div>
              <Button onClick={handleAnalysis} disabled={!currentSkills.trim() || !targetRole.trim() || isAnalyzing} className="w-full sutera-button py-3 h-auto disabled:opacity-40">
                {isAnalyzing ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Analyzing with AI...</> : "Analyze Skills Gap"}
              </Button>
            </div>
          </div>

          {/* Results Panel */}
          <div className="space-y-6">

            {/* Quota / Mock Data Banner */}
            {usingMockData && (
              <div className={`flex items-start gap-3 px-5 py-4 rounded-2xl border ${
                quotaExceeded
                  ? "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800"
                  : "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800"
              }`}>
                <AlertCircle className={`h-5 w-5 flex-shrink-0 mt-0.5 ${quotaExceeded ? "text-amber-500" : "text-blue-500"}`} />
                <div className="flex-1">
                  <p className={`text-sm font-semibold tracking-tight ${quotaExceeded ? "text-amber-800 dark:text-amber-300" : "text-blue-800 dark:text-blue-300"}`}>
                    {quotaExceeded ? "AI Quota Exceeded — Showing Sample Analysis" : "Showing Sample Analysis"}
                  </p>
                  <p className={`text-xs tracking-tight mt-0.5 ${quotaExceeded ? "text-amber-700 dark:text-amber-400" : "text-blue-700 dark:text-blue-400"}`}>
                    {quotaExceeded
                      ? "Your Gemini API key has hit its daily free-tier limit. Results below are sample data, not based on your actual skills. Update your API key in .env.local or wait until tomorrow for the quota to reset."
                      : "The AI couldn't generate a response and returned sample data. Results may not reflect your actual skill gaps."}
                  </p>
                </div>
                <button
                  onClick={() => setUsingMockData(false)}
                  className={`text-xs font-medium flex-shrink-0 hover:opacity-70 transition-opacity ${quotaExceeded ? "text-amber-600 dark:text-amber-400" : "text-blue-600 dark:text-blue-400"}`}
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* Error (non-quota) */}
            {error && (
              <div className="sutera-card p-6">
                <div className="flex items-center text-red-600 dark:text-red-400">
                  <AlertCircle className="h-5 w-5 mr-3 flex-shrink-0" />
                  <p className="text-sm tracking-tight">{error}</p>
                </div>
              </div>
            )}

            {result && (
              <>
                {/* Skills Grid */}
                <div className="grid sm:grid-cols-3 gap-4">
                  {[
                    { label: "Missing", color: "bg-red-500", skills: result.gapAnalysis.missingSkills },
                    { label: "Improve", color: "bg-yellow-500", skills: result.gapAnalysis.skillsToImprove },
                    { label: "Strong",  color: "bg-green-500", skills: result.gapAnalysis.strongSkills },
                  ].map(({ label, color, skills }) => (
                    <div key={label} className="sutera-card p-5">
                      <div className="flex items-center space-x-2 mb-4">
                        <div className={`w-2 h-2 rounded-full ${color}`} />
                        <span className="text-xs font-semibold tracking-widest uppercase text-slate-500 dark:text-zinc-500">{label}</span>
                      </div>
                      <ul className="space-y-2">
                        {skills.map((skill, i) => (
                          <li key={i} className="text-sm font-medium tracking-tight">{skill}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                {/* Learning Path */}
                <div className="sutera-card p-8">
                  <div className="flex items-center space-x-3 mb-6">
                    <BookOpen className="h-5 w-5" />
                    <h3 className="text-lg font-semibold tracking-tight">Learning Path</h3>
                  </div>
                  <div className="space-y-4">
                    {result.recommendations.slice(0, 3).map((rec, i) => (
                      <div key={i} className="border-b border-slate-100 dark:border-zinc-800 pb-4 last:border-0 last:pb-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium tracking-tight text-sm">{rec.skill}</span>
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${rec.priority === "High" ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400" : rec.priority === "Medium" ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400" : "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400"}`}>{rec.priority}</span>
                        </div>
                        <div className="flex items-center text-xs text-slate-500 dark:text-zinc-500 mb-2">
                          <Clock className="h-3 w-3 mr-1" />{rec.timeToLearn}
                        </div>
                        {rec.resources[0] && (
                          <a href={rec.resources[0].url} target="_blank" rel="noopener noreferrer" className="text-xs font-medium underline decoration-1 underline-offset-2 hover:opacity-60 transition-opacity">
                            {rec.resources[0].title} — {rec.resources[0].provider}
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Career Roadmap */}
                <div className="sutera-card p-8">
                  <h3 className="text-lg font-semibold tracking-tight mb-6">Career Roadmap</h3>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-slate-50 dark:bg-zinc-900 rounded-2xl p-4">
                      <p className="text-xs text-slate-500 dark:text-zinc-500 tracking-tight mb-1">Timeline</p>
                      <p className="text-2xl font-semibold tracking-tighter">{result.careerPath.timelineMonths}mo</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-zinc-900 rounded-2xl p-4">
                      <p className="text-xs text-slate-500 dark:text-zinc-500 tracking-tight mb-1">Salary Range</p>
                      <p className="text-lg font-semibold tracking-tighter">{result.careerPath.salaryProjection}</p>
                    </div>
                  </div>
                  <ol className="space-y-3">
                    {result.careerPath.nextSteps.map((step, i) => (
                      <li key={i} className="flex items-start text-sm tracking-tight">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-black dark:bg-white text-white dark:text-black text-xs font-semibold flex items-center justify-center mr-3 mt-0.5">{i + 1}</span>
                        <span className="text-slate-700 dark:text-zinc-300">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </>
            )}

            {!result && !error && (
              <div className="sutera-card p-12 text-center">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-zinc-900 flex items-center justify-center mx-auto mb-6">
                  <BarChart3 className="h-8 w-8 text-slate-400 dark:text-zinc-500" />
                </div>
                <p className="text-slate-500 dark:text-zinc-500 tracking-tight">Enter your skills and target role to see your personalized analysis.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
