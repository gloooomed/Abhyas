import { useState } from "react";
import { ChevronDown, ChevronRight, CheckCircle2, XCircle, AlertCircle, TrendingUp, Star, Target, Award } from "lucide-react";
import type { FinalReport, InterviewType } from "../../lib/ai";

interface InterviewScorecardProps {
  report: FinalReport;
  role: string;
  interviewType: InterviewType;
  onStartNew: () => void;
}

// ── SVG Arc Score Gauge ──────────────────────────────────────────────────────

function ScoreGauge({ score, grade }: { score: number; grade: FinalReport["grade"] }) {
  const radius = 54;
  const circumference = Math.PI * radius; // half-circle
  const offset = circumference - (score / 100) * circumference;

  const gradeColor: Record<FinalReport["grade"], string> = {
    "A+": "#10b981", // emerald-500
    "A":  "#34d399", // emerald-400
    "B+": "#3b82f6", // blue-500
    "B":  "#60a5fa", // blue-400
    "C":  "#f59e0b", // amber-500
    "D":  "#ef4444", // red-500
  };

  const color = gradeColor[grade];

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-36 h-20 overflow-hidden">
        <svg viewBox="0 0 120 60" className="w-full h-full" style={{ overflow: "visible" }}>
          {/* Track */}
          <path
            d="M 10 55 A 50 50 0 0 1 110 55"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeLinecap="round"
            className="text-slate-200 dark:text-zinc-800"
          />
          {/* Progress */}
          <path
            d="M 10 55 A 50 50 0 0 1 110 55"
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${circumference}`}
            strokeDashoffset={`${offset}`}
            style={{ transition: "stroke-dashoffset 1s ease-out" }}
          />
          {/* Score text */}
          <text x="60" y="46" textAnchor="middle" className="font-bold" style={{ fill: color, fontSize: "18px", fontWeight: 700 }}>
            {score}
          </text>
          <text x="60" y="58" textAnchor="middle" style={{ fill: "#94a3b8", fontSize: "7px" }}>
            out of 100
          </text>
        </svg>
      </div>
      {/* Grade badge */}
      <div
        className="mt-1 w-12 h-12 rounded-2xl flex items-center justify-center text-white text-xl font-bold shadow-lg"
        style={{ backgroundColor: color }}
      >
        {grade}
      </div>
    </div>
  );
}

// ── Competency Bar ───────────────────────────────────────────────────────────

function CompetencyBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <span className="text-xs font-medium text-slate-600 dark:text-zinc-400 tracking-tight">{label}</span>
        <span className="text-xs font-semibold" style={{ color }}>{value}</span>
      </div>
      <div className="h-1.5 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: `${value}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

// ── Hire Recommendation Badge ────────────────────────────────────────────────

function HireBadge({ recommendation }: { recommendation: FinalReport["hireRecommendation"] }) {
  const config = {
    "Strong Yes": { icon: CheckCircle2, color: "#10b981", bg: "bg-emerald-50 dark:bg-emerald-950/40", border: "border-emerald-200 dark:border-emerald-800", text: "text-emerald-700 dark:text-emerald-400" },
    "Yes":        { icon: CheckCircle2, color: "#3b82f6", bg: "bg-blue-50 dark:bg-blue-950/40",     border: "border-blue-200 dark:border-blue-800",     text: "text-blue-700 dark:text-blue-400" },
    "Maybe":      { icon: AlertCircle,  color: "#f59e0b", bg: "bg-amber-50 dark:bg-amber-950/40",   border: "border-amber-200 dark:border-amber-800",   text: "text-amber-700 dark:text-amber-400" },
    "No":         { icon: XCircle,      color: "#ef4444", bg: "bg-red-50 dark:bg-red-950/40",       border: "border-red-200 dark:border-red-800",       text: "text-red-700 dark:text-red-400" },
  };
  const cfg = config[recommendation];
  const Icon = cfg.icon;
  return (
    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl border ${cfg.bg} ${cfg.border}`}>
      <Icon className={`h-4 w-4 ${cfg.text}`} />
      <span className={`text-sm font-semibold tracking-tight ${cfg.text}`}>
        Hire Recommendation: {recommendation}
      </span>
    </div>
  );
}

// ── Per-Question Accordion ───────────────────────────────────────────────────

function QuestionBreakdown({ breakdown }: { breakdown: FinalReport["perQuestionBreakdown"] }) {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  const scoreColor = (s: number) =>
    s >= 85 ? "#10b981" : s >= 70 ? "#3b82f6" : s >= 55 ? "#f59e0b" : "#ef4444";

  return (
    <div className="space-y-2">
      {breakdown.map((item, i) => (
        <div
          key={i}
          className="border border-slate-200 dark:border-zinc-800 rounded-2xl overflow-hidden"
        >
          <button
            onClick={() => setOpenIdx(openIdx === i ? null : i)}
            className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50 dark:hover:bg-zinc-900/60 transition-colors"
          >
            <div className="flex items-center gap-3 min-w-0">
              {openIdx === i ? (
                <ChevronDown className="h-4 w-4 text-slate-400 flex-shrink-0" />
              ) : (
                <ChevronRight className="h-4 w-4 text-slate-400 flex-shrink-0" />
              )}
              <span className="text-sm font-medium text-slate-700 dark:text-zinc-300 tracking-tight truncate">
                Q{i + 1}: {item.question}
              </span>
            </div>
            <div
              className="flex-shrink-0 ml-3 text-sm font-bold px-2.5 py-1 rounded-lg"
              style={{ color: scoreColor(item.score), backgroundColor: `${scoreColor(item.score)}18` }}
            >
              {item.score}/100
            </div>
          </button>

          {openIdx === i && (
            <div className="px-4 pb-4 border-t border-slate-100 dark:border-zinc-800 pt-3 space-y-3">
              {/* Dimension bars */}
              {item.dimensions && (
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Relevance", val: item.dimensions.relevance, max: 25 },
                    { label: "Specificity", val: item.dimensions.specificity, max: 25 },
                    { label: "Depth", val: item.dimensions.depth, max: 25 },
                    { label: "Communication", val: item.dimensions.communication, max: 25 },
                  ].map(({ label, val, max }) => (
                    <div key={label} className="space-y-1">
                      <div className="flex justify-between">
                        <span className="text-xs text-slate-500 dark:text-zinc-400 tracking-tight">{label}</span>
                        <span className="text-xs font-medium text-slate-700 dark:text-zinc-300">{val}/{max}</span>
                      </div>
                      <div className="h-1 bg-slate-100 dark:bg-zinc-800 rounded-full">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${(val / max) * 100}%`,
                            backgroundColor: scoreColor((val / max) * 100),
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {/* Key feedback */}
              {item.keyFeedback && (
                <p className="text-xs text-slate-600 dark:text-zinc-400 tracking-tight leading-relaxed border-l-2 border-slate-300 dark:border-zinc-700 pl-3">
                  {item.keyFeedback}
                </p>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ── Main Scorecard Component ─────────────────────────────────────────────────

export default function InterviewScorecard({
  report,
  role,
  interviewType,
  onStartNew,
}: InterviewScorecardProps) {
  const [breakdownOpen, setBreakdownOpen] = useState(false);

  const competencyColors = {
    communication:      "#3b82f6",
    problemSolving:     "#8b5cf6",
    technicalKnowledge: "#10b981",
    cultureFit:         "#f59e0b",
    structuredThinking: "#ec4899",
  };

  const interviewTypeLabel: Record<InterviewType, string> = {
    behavioral:     "Behavioral Interview",
    technical:      "Technical Interview",
    "system-design": "System Design Interview",
    hr:             "HR Round",
    "case-study":   "Case Study Interview",
    mixed:          "Mixed Round Interview",
  };

  return (
    <div className="rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 overflow-hidden shadow-xl dark:shadow-black/40">
      {/* Header */}
      <div className="px-6 py-5 border-b border-slate-100 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900">
        <div className="flex items-center gap-2 mb-1">
          <Award className="h-5 w-5 text-slate-500 dark:text-zinc-400" />
          <span className="text-xs font-medium text-slate-500 dark:text-zinc-400 tracking-tight uppercase">
            {interviewTypeLabel[interviewType]}
          </span>
        </div>
        <h3 className="text-xl font-semibold tracking-tighter text-slate-900 dark:text-white">
          Interview Complete — {role}
        </h3>
        <p className="text-sm text-slate-500 dark:text-zinc-400 tracking-tight mt-0.5">
          {report.interviewSummary}
        </p>
      </div>

      <div className="p-6 space-y-6">

        {/* Score + Hire Recommendation row */}
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <ScoreGauge score={report.overallScore} grade={report.grade} />
          <div className="flex-1 space-y-3">
            <HireBadge recommendation={report.hireRecommendation} />
            <p className="text-sm text-slate-600 dark:text-zinc-400 tracking-tight leading-relaxed">
              You answered {report.perQuestionBreakdown.length} question
              {report.perQuestionBreakdown.length !== 1 ? "s" : ""} with an average score of{" "}
              <span className="font-semibold text-slate-800 dark:text-zinc-200">
                {report.overallScore}/100
              </span>
              .
            </p>
          </div>
        </div>

        {/* Competency Scores */}
        <div className="sutera-card !rounded-2xl !shadow-none p-4 space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <Target className="h-4 w-4 text-slate-400" />
            <h4 className="text-sm font-semibold tracking-tight text-slate-700 dark:text-zinc-300">
              Competency Breakdown
            </h4>
          </div>
          <CompetencyBar label="Communication"       value={report.competencyScores.communication}      color={competencyColors.communication} />
          <CompetencyBar label="Problem Solving"     value={report.competencyScores.problemSolving}      color={competencyColors.problemSolving} />
          <CompetencyBar label="Technical Knowledge" value={report.competencyScores.technicalKnowledge}  color={competencyColors.technicalKnowledge} />
          <CompetencyBar label="Culture Fit"         value={report.competencyScores.cultureFit}          color={competencyColors.cultureFit} />
          <CompetencyBar label="Structured Thinking" value={report.competencyScores.structuredThinking}  color={competencyColors.structuredThinking} />
        </div>

        {/* Strengths & Improvements */}
        <div className="grid sm:grid-cols-2 gap-4">
          {/* Strengths */}
          <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Star className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <h4 className="text-sm font-semibold text-emerald-700 dark:text-emerald-400 tracking-tight">
                Top Strengths
              </h4>
            </div>
            <ul className="space-y-1.5">
              {report.topStrengths.map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-emerald-700 dark:text-emerald-300 tracking-tight">
                  <CheckCircle2 className="h-3 w-3 mt-0.5 flex-shrink-0" />
                  {s}
                </li>
              ))}
            </ul>
          </div>

          {/* Improvements */}
          <div className="rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900 p-4">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              <h4 className="text-sm font-semibold text-amber-700 dark:text-amber-400 tracking-tight">
                Key Improvements
              </h4>
            </div>
            <ul className="space-y-1.5">
              {report.criticalImprovements.map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-amber-700 dark:text-amber-300 tracking-tight">
                  <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                  {s}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Per-Question Breakdown (accordion) */}
        {report.perQuestionBreakdown.length > 0 && (
          <div>
            <button
              onClick={() => setBreakdownOpen(!breakdownOpen)}
              className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-zinc-300 tracking-tight mb-3 hover:text-black dark:hover:text-white transition-colors"
            >
              {breakdownOpen ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
              Per-Question Breakdown ({report.perQuestionBreakdown.length} questions)
            </button>
            {breakdownOpen && (
              <QuestionBreakdown breakdown={report.perQuestionBreakdown} />
            )}
          </div>
        )}

        {/* Next Steps */}
        <div className="rounded-2xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-4">
          <h4 className="text-sm font-semibold tracking-tight text-slate-700 dark:text-zinc-300 mb-3">
            Recommended Next Steps
          </h4>
          <ol className="space-y-2">
            {report.nextSteps.map((step, i) => (
              <li key={i} className="flex items-start gap-3 text-xs text-slate-600 dark:text-zinc-400 tracking-tight">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center text-xs font-semibold">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={onStartNew}
            className="flex-1 sutera-button py-3 text-sm font-medium tracking-tight rounded-2xl"
          >
            Start New Interview
          </button>
          <button
            onClick={() => window.print()}
            className="flex-1 py-3 text-sm font-medium tracking-tight rounded-2xl border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-900 transition-colors"
          >
            Print Report
          </button>
        </div>
      </div>
    </div>
  );
}
