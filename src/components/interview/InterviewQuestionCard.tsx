import { useMemo } from "react";
import { Lightbulb, Tag, BarChart2, BookOpen } from "lucide-react";
import type { InterviewQuestion, InterviewType } from "../../lib/gemini";

interface InterviewQuestionCardProps {
  question: InterviewQuestion | null;
  questionNumber: number;
  totalQuestions: number;
  interviewType: InterviewType;
  answerWordCount: number;
}

// ── Type badge colors ──────────────────────────────────────────────────────

const typeStyles: Record<string, { bg: string; text: string; label: string }> = {
  behavioral:    { bg: "bg-purple-100 dark:bg-purple-950/50", text: "text-purple-700 dark:text-purple-300", label: "Behavioral" },
  technical:     { bg: "bg-blue-100 dark:bg-blue-950/50",    text: "text-blue-700 dark:text-blue-300",    label: "Technical" },
  "system-design":{ bg: "bg-cyan-100 dark:bg-cyan-950/50",   text: "text-cyan-700 dark:text-cyan-300",    label: "System Design" },
  situational:   { bg: "bg-orange-100 dark:bg-orange-950/50",text: "text-orange-700 dark:text-orange-300",label: "Situational" },
  hr:            { bg: "bg-rose-100 dark:bg-rose-950/50",    text: "text-rose-700 dark:text-rose-300",    label: "HR" },
  "case-study":  { bg: "bg-amber-100 dark:bg-amber-950/50",  text: "text-amber-700 dark:text-amber-300",  label: "Case Study" },
  opening:       { bg: "bg-emerald-100 dark:bg-emerald-950/50",text:"text-emerald-700 dark:text-emerald-300",label:"Opening" },
};

const difficultyStyles: Record<string, { dot: string; label: string }> = {
  easy:   { dot: "bg-emerald-400", label: "Easy" },
  medium: { dot: "bg-amber-400",   label: "Medium" },
  hard:   { dot: "bg-red-500",     label: "Hard" },
};

// ── Word count indicator ───────────────────────────────────────────────────

function WordCountIndicator({
  count,
  minRequired,
}: {
  count: number;
  minRequired: number;
}) {
  const pct = Math.min((count / minRequired) * 100, 100);
  const color =
    pct >= 100
      ? "#10b981"
      : pct >= 60
        ? "#f59e0b"
        : "#ef4444";

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <span className="text-xs text-slate-500 dark:text-zinc-400 tracking-tight">Answer length</span>
        <span
          className="text-xs font-semibold tracking-tight transition-colors"
          style={{ color }}
        >
          {count} / {minRequired}+ words
        </span>
      </div>
      <div className="h-1 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      {count < minRequired && count > 0 && (
        <p className="text-xs text-slate-500 dark:text-zinc-500 tracking-tight">
          Aim for at least {minRequired} words for a complete answer.
        </p>
      )}
    </div>
  );
}

// ── Scoring rubric snippet ─────────────────────────────────────────────────

function RubricHint({ rubric }: { rubric: InterviewQuestion["scoringRubric"] }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5 mb-1">
        <BarChart2 className="h-3.5 w-3.5 text-slate-400" />
        <span className="text-xs font-medium text-slate-600 dark:text-zinc-400 tracking-tight">Scoring hints</span>
      </div>
      <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900 rounded-xl px-3 py-2">
        <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">Excellent: </span>
        <span className="text-xs text-emerald-700 dark:text-emerald-300 tracking-tight">{rubric.excellent}</span>
      </div>
      <div className="bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl px-3 py-2">
        <span className="text-xs font-semibold text-slate-600 dark:text-zinc-400">Good: </span>
        <span className="text-xs text-slate-500 dark:text-zinc-400 tracking-tight">{rubric.good}</span>
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────

export default function InterviewQuestionCard({
  question,
  questionNumber,
  totalQuestions,
  interviewType,
  answerWordCount,
}: InterviewQuestionCardProps) {
  const typeStyle = useMemo(() => {
    if (!question) return typeStyles["behavioral"];
    return typeStyles[question.type] ?? typeStyles["behavioral"];
  }, [question]);

  const diffStyle = useMemo(() => {
    if (!question) return difficultyStyles["medium"];
    return difficultyStyles[question.difficulty] ?? difficultyStyles["medium"];
  }, [question]);

  const interviewTypeHints: Record<InterviewType, string> = {
    behavioral:     "Use the STAR method — ground every answer in a real past experience",
    technical:      "Think out loud — interviewers value your reasoning as much as the answer",
    "system-design": "Start with requirements, then design top-down",
    hr:             "Be genuine — honesty and self-awareness score higher than polished answers",
    "case-study":   "Take 30 seconds to structure your approach before diving in",
    mixed:          "Read the question type and choose your framework accordingly",
  };

  if (!question) {
    return (
      <div className="sutera-card p-5 space-y-4 animate-pulse">
        <div className="h-3 bg-slate-100 dark:bg-zinc-800 rounded-full w-2/3" />
        <div className="h-3 bg-slate-100 dark:bg-zinc-800 rounded-full w-full" />
        <div className="h-3 bg-slate-100 dark:bg-zinc-800 rounded-full w-1/2" />
      </div>
    );
  }

  return (
    <div className="sutera-card p-5 space-y-5">
      {/* Question number + badges */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-400 dark:text-zinc-500 tracking-tight font-medium">
            Question {questionNumber} of {totalQuestions}
          </span>
          <div className="flex items-center gap-1.5">
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${typeStyle.bg} ${typeStyle.text} tracking-tight`}>
              {typeStyle.label}
            </span>
          </div>
        </div>
        {/* Difficulty */}
        <div className="flex items-center gap-1.5">
          <div className={`w-1.5 h-1.5 rounded-full ${diffStyle.dot}`} />
          <span className="text-xs text-slate-500 dark:text-zinc-400 tracking-tight">
            {diffStyle.label} difficulty
          </span>
        </div>
      </div>

      {/* Category */}
      {question.category && (
        <div className="flex items-center gap-1.5">
          <Tag className="h-3 w-3 text-slate-400" />
          <span className="text-xs text-slate-500 dark:text-zinc-400 tracking-tight capitalize">
            {question.category}
          </span>
        </div>
      )}

      {/* Framework hint */}
      <div className="bg-black/5 dark:bg-white/5 rounded-2xl px-3 py-3 border border-black/10 dark:border-white/10">
        <div className="flex items-start gap-2">
          <Lightbulb className="h-3.5 w-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-slate-700 dark:text-zinc-300 tracking-tight leading-relaxed">
            <span className="font-semibold">Tip: </span>
            {question.frameworkHint || interviewTypeHints[interviewType]}
          </p>
        </div>
      </div>

      {/* Expected points */}
      {question.expectedPoints && question.expectedPoints.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-1.5">
            <BookOpen className="h-3.5 w-3.5 text-slate-400" />
            <span className="text-xs font-medium text-slate-600 dark:text-zinc-400 tracking-tight">
              Cover these points
            </span>
          </div>
          <ul className="space-y-1">
            {question.expectedPoints.map((pt, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-slate-500 dark:text-zinc-400 tracking-tight">
                <span className="text-slate-300 dark:text-zinc-600">•</span>
                {pt}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Word count indicator */}
      <WordCountIndicator
        count={answerWordCount}
        minRequired={question.minWordCount ?? 40}
      />

      {/* Scoring rubric */}
      {question.scoringRubric && (
        <RubricHint rubric={question.scoringRubric} />
      )}
    </div>
  );
}
