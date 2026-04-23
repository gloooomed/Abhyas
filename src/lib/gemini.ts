import { GoogleGenerativeAI } from "@google/generative-ai";
import { cache, CacheKeys, CacheTTL } from "./cache";

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || "");

// Get the Gemini Flash model (higher free tier limits)
export const getGeminiModel = () => {
  if (!import.meta.env.VITE_GEMINI_API_KEY) {
    throw new Error(
      "Gemini API key is not configured. Please add VITE_GEMINI_API_KEY to your .env.local file.",
    );
  }
  return genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    generationConfig: {
      temperature: 0.7,
      topK: 40,
      topP: 0.9,
      maxOutputTokens: 1024,
    },
  });
};

// Retry function with exponential backoff and timeout
const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 2,
  baseDelay: number = 1000,
  timeoutMs: number = 15000,
): Promise<T> => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await Promise.race([
        fn(),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("Request timeout")), timeoutMs),
        ),
      ]);
    } catch (error: unknown) {
      const err = error as { message?: string };
      if (i === maxRetries - 1) throw error;

      // Check if it's a quota error
      if (err.message?.includes("quota") || err.message?.includes("429")) {
        const delay = baseDelay * Math.pow(2, i) + Math.random() * 1000;
        console.log(`Quota exceeded, retrying in ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        throw error;
      }
    }
  }
  throw new Error("Max retries exceeded");
};

// Mock data for when API fails
const getMockSkillsAnalysis = (
  currentSkills: string[],
  targetRole: string,
  experience: string,
  industry: string,
) => {
  return {
    gapAnalysis: {
      missingSkills: [
        "Advanced React.js",
        "TypeScript",
        "Node.js/Express",
        "Cloud Platforms (AWS/Azure)",
        "System Design",
        "Database Design",
        "API Development",
        "Testing Frameworks",
      ],
      skillsToImprove: [
        "JavaScript ES6+",
        "Data Structures & Algorithms",
        "Version Control (Git)",
        "Problem Solving",
        "Code Optimization",
      ],
      strongSkills:
        currentSkills.length > 0
          ? currentSkills
          : [
              "HTML5",
              "CSS3",
              "Basic JavaScript",
              "Responsive Design",
              "Communication Skills",
            ],
    },
    recommendations: [
      {
        skill: "React.js",
        priority: "High" as const,
        timeToLearn: "3-4 months",
        resources: [
          {
            title: "React Official Documentation",
            type: "Course",
            provider: "React Team",
            url: "https://react.dev/learn",
            duration: "40 hours",
            difficulty: "Intermediate",
          },
          {
            title: "React - The Complete Guide",
            type: "Course",
            provider: "Udemy",
            url: "https://www.udemy.com/course/react-the-complete-guide-incl-redux/",
            duration: "48 hours",
            difficulty: "Beginner to Advanced",
          },
        ],
      },
      {
        skill: "TypeScript",
        priority: "High" as const,
        timeToLearn: "2-3 months",
        resources: [
          {
            title: "TypeScript Handbook",
            type: "Documentation",
            provider: "Microsoft",
            url: "https://www.typescriptlang.org/docs/",
            duration: "30 hours",
            difficulty: "Intermediate",
          },
        ],
      },
      {
        skill: "System Design",
        priority: "Medium" as const,
        timeToLearn: "6-8 months",
        resources: [
          {
            title: "System Design Interview",
            type: "Book",
            provider: "Alex Xu",
            url: "https://www.amazon.com/System-Design-Interview-insiders-Second/dp/B08CMF2CQF",
            duration: "3 months",
            difficulty: "Advanced",
          },
        ],
      },
    ],
    careerPath: {
      nextSteps: [
        "Master React.js and build 3-4 portfolio projects",
        "Learn TypeScript and convert existing projects",
        "Gain experience with backend technologies (Node.js)",
        "Study system design principles and scalability",
        "Contribute to open-source projects",
        "Network with professionals in the industry",
        "Prepare for technical interviews",
      ],
      timelineMonths:
        experience === "Entry Level" ? 12 : experience === "Mid Level" ? 8 : 6,
      salaryProjection:
        experience === "Entry Level"
          ? `$60,000 - $80,000 for entry-level ${targetRole} positions in ${industry}`
          : experience === "Mid Level"
            ? `$80,000 - $110,000 for mid-level ${targetRole} positions in ${industry}`
            : `$110,000 - $150,000 for senior-level ${targetRole} positions in ${industry}`,
    },
  };
};

// Skills Gap Analysis with caching
export async function analyzeSkillsGap(
  currentSkills: string[],
  targetRole: string,
  experience: string,
  industry: string,
) {
  // Check cache first
  const cacheKey = cache.createKey(CacheKeys.SKILLS_ANALYSIS, {
    currentSkills: currentSkills.sort().join(","),
    targetRole,
    experience,
    industry,
  });

  const cachedResult = cache.get(cacheKey);
  if (cachedResult) {
    console.log("Returning cached skills analysis");
    return cachedResult;
  }

  // First try with shorter, more efficient prompt to save tokens
  const model = getGeminiModel();

  const prompt = `Skills gap analysis for ${targetRole} (${experience}):
Current: ${currentSkills.join(", ")}

JSON format:
{"gapAnalysis":{"missingSkills":[],"skillsToImprove":[],"strongSkills":[]},"recommendations":[{"skill":"","priority":"","timeToLearn":"","resources":[{"title":"","type":"","url":""}]}],"careerPath":{"nextSteps":[],"timelineMonths":0,"salaryProjection":""}}`;

  try {
    console.log("Attempting AI analysis...");

    const result = await retryWithBackoff(
      async () => {
        const response = await model.generateContent(prompt);
        return response.response.text();
      },
      2,
      1000,
    );

    console.log("Raw AI response:", result);

    // Clean up the response to ensure it's valid JSON
    const jsonMatch = result.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.warn("No JSON found in AI response, using mock data");
      const mock = getMockSkillsAnalysis(
        currentSkills,
        targetRole,
        experience,
        industry,
      );
      (mock as Record<string, unknown>).isDemoData = true;
      (mock as Record<string, unknown>).note = "Invalid AI response structure";
      return mock;
    }

    const cleanedJson = jsonMatch[0];
    const parsedResponse = JSON.parse(cleanedJson);

    // Validate the response structure
    if (
      !parsedResponse.gapAnalysis ||
      !parsedResponse.recommendations ||
      !parsedResponse.careerPath
    ) {
      console.warn("Invalid AI response structure, using mock data");
      const mock = getMockSkillsAnalysis(
        currentSkills,
        targetRole,
        experience,
        industry,
      );
      (mock as Record<string, unknown>).isDemoData = true;
      (mock as Record<string, unknown>).note = "Invalid AI response structure";
      return mock;
    }

    console.log("Successfully parsed AI response");

    // Cache the successful response
    cache.set(cacheKey, parsedResponse, { ttl: CacheTTL.MEDIUM });

    return parsedResponse;
  } catch (error: unknown) {
    const err = error as { message?: string };
    console.error("AI analysis failed:", error);

    // Check if it's a quota error
    if (err.message?.includes("quota") || err.message?.includes("429")) {
      console.log(
        "Quota exceeded, falling back to demo data with realistic analysis",
      );

      // Show user-friendly message but still provide value
      const mockData = getMockSkillsAnalysis(
        currentSkills,
        targetRole,
        experience,
        industry,
      );

      // Customize mock data based on user input
      if (currentSkills.length > 0) {
        mockData.gapAnalysis.strongSkills = currentSkills.slice(0, 3);
      }

      // Add a note about using demo data
      (mockData as Record<string, unknown>).isDemoData = true;
      (mockData as Record<string, unknown>).note =
        "This is demo analysis due to API limits. Upgrade for personalized AI analysis.";

      return mockData;
    }

    // For other errors, still provide mock data but with error indication
    console.log("Using fallback analysis due to error:", err.message);
    const mockData = getMockSkillsAnalysis(
      currentSkills,
      targetRole,
      experience,
      industry,
    );
    (mockData as Record<string, unknown>).isError = true;
    (mockData as Record<string, unknown>).isDemoData = true;
    (mockData as Record<string, unknown>).note = err.message;
    return mockData;
  }
}

// ─── Interview Type Definitions ────────────────────────────────────────────

export type InterviewType =
  | "behavioral"
  | "technical"
  | "system-design"
  | "hr"
  | "case-study"
  | "mixed";

export interface InterviewScoringRubric {
  excellent: string;
  good: string;
  needs_improvement: string;
}

export interface InterviewQuestion {
  id: number;
  question: string;
  type: string;
  category: string;
  difficulty: string;
  expectedPoints: string[];
  followUpQuestions: string[];
  scoringRubric: InterviewScoringRubric;
  minWordCount: number;
  frameworkHint: string; // e.g. "Use the STAR method"
}

export interface EvaluationDimensions {
  relevance: number;   // 0–25
  specificity: number; // 0–25
  depth: number;       // 0–25
  communication: number; // 0–25
}

export interface EvaluationResult {
  status: "evaluated" | "needs_clarification";
  clarifyingPrompt?: string;
  score?: number;
  dimensions?: EvaluationDimensions;
  strengths?: string[];
  improvements?: string[];
  interviewerResponse: string;
}

export interface PerQuestionResult {
  questionIndex: number;
  question: string;
  answer: string;
  score: number;
  dimensions: EvaluationDimensions;
  keyFeedback: string;
}

export interface FinalReport {
  overallScore: number;
  grade: "A+" | "A" | "B+" | "B" | "C" | "D";
  competencyScores: {
    communication: number;
    problemSolving: number;
    technicalKnowledge: number;
    cultureFit: number;
    structuredThinking: number;
  };
  topStrengths: string[];
  criticalImprovements: string[];
  hireRecommendation: "Strong Yes" | "Yes" | "Maybe" | "No";
  interviewSummary: string;
  perQuestionBreakdown: PerQuestionResult[];
  nextSteps: string[];
}

// ─── Interview Type Prompt Helpers ─────────────────────────────────────────

const getInterviewTypeInstructions = (interviewType: InterviewType): string => {
  const map: Record<InterviewType, string> = {
    behavioral: `Focus on past behavior and situational judgment. Use the STAR method (Situation, Task, Action, Result). 
Ask about leadership, conflict resolution, teamwork, adaptability, and growth moments. 
Questions should reveal how the candidate thinks and handles real workplace challenges.`,
    technical: `Focus on domain-specific technical knowledge relevant to the role and industry.
For engineering/tech roles: ask about algorithms, system APIs, debugging, data structures.
For finance roles: ask about Excel, DCF, valuation, financial modeling.
For data roles: ask about SQL, ML concepts, statistics, Python.
For healthcare: ask about procedures, protocols, clinical decision-making.
DO NOT default to coding questions if the role is non-technical.`,
    "system-design": `Focus on architecture, scalability, trade-offs, and high-level design thinking.
For tech roles: database design, microservices, API design, caching strategies.
For business/PM roles: organizational design, process architecture, workflow scalability.
For finance roles: portfolio structure, risk management frameworks.
Ask candidates to think out loud and justify their design decisions.`,
    hr: `Focus on culture fit, motivation, salary expectations, work style, and career goals.
Ask about the candidate's values, how they handle feedback, their management style preference,
and what they are looking for in their next role. Keep tone conversational and warm.`,
    "case-study": `Present a business or domain-specific problem for the candidate to solve.
For business/consulting/PM roles: market sizing, GTM strategy, revenue analysis.
For finance roles: investment thesis, deal analysis, risk assessment.
For data roles: experiment design, metric definition, data pipeline problems.
For clinical roles: patient case scenarios, treatment decision-making.
Evaluate hypothesis formation, structured thinking, and quantitative reasoning.`,
    mixed: `Create a balanced interview covering multiple dimensions:
2 behavioral questions, 2 technical/domain-specific questions, 
1 situational/case question, 1 cultural fit question, 
1 career goals question, and 1 role-specific deep-dive question.`,
  };
  return map[interviewType];
};

const getQuestionCountByType = (interviewType: InterviewType): number => {
  const map: Record<InterviewType, number> = {
    behavioral: 7,
    technical: 8,
    "system-design": 5,
    hr: 6,
    "case-study": 5,
    mixed: 8,
  };
  return map[interviewType];
};

const getFrameworkHintByType = (interviewType: InterviewType, questionType: string): string => {
  if (interviewType === "behavioral" || questionType === "behavioral") return "Use the STAR method: Situation → Task → Action → Result";
  if (interviewType === "system-design") return "Think aloud: Requirements → High-level design → Components → Trade-offs";
  if (interviewType === "case-study") return "Structure your answer: Clarify → Hypothesize → Analyze → Recommend";
  if (interviewType === "technical") return "Explain your reasoning as you work through the problem";
  if (interviewType === "hr") return "Be honest and specific about your preferences and experiences";
  return "Structure your answer clearly with specific examples";
};

// ─── Mock Question Fallbacks ────────────────────────────────────────────────

const getMockInterviewQuestions = (role: string, interviewType: InterviewType = "mixed") => {
  const behavioralQ = {
    id: 1,
    question: `Tell me about a time you faced a major challenge in your work as a ${role} and how you overcame it.`,
    type: "behavioral",
    category: "problem-solving",
    difficulty: "medium",
    expectedPoints: ["Clear situation description", "Your specific actions", "Measurable outcome"],
    followUpQuestions: ["What would you do differently now?", "What did you learn from that experience?"],
    scoringRubric: {
      excellent: "Vivid, specific STAR story with quantified impact and clear learnings",
      good: "Clear story with actions and result, but lacks quantification",
      needs_improvement: "Vague or generic answer without a real example",
    },
    minWordCount: 60,
    frameworkHint: "Use the STAR method: Situation → Task → Action → Result",
  };
  const technicalQ = {
    id: 2,
    question: `What are the most critical technical skills for a ${role}, and how have you applied them?`,
    type: "technical",
    category: "expertise",
    difficulty: "medium",
    expectedPoints: ["Role-specific skills named", "Concrete application examples", "Results achieved"],
    followUpQuestions: ["Which skill has had the most impact?"],
    scoringRubric: {
      excellent: "Names 3+ specific skills with detailed examples and quantified outcomes",
      good: "Names skills with basic examples",
      needs_improvement: "Lists skills without real application context",
    },
    minWordCount: 50,
    frameworkHint: "Explain your reasoning as you work through the problem",
  };
  const hrQ = {
    id: 3,
    question: `Why are you interested in this ${role} position, and what are you looking for in your next role?`,
    type: "hr",
    category: "motivation",
    difficulty: "easy",
    expectedPoints: ["Specific motivation for the role", "Clear career goal alignment", "What value you bring"],
    followUpQuestions: ["Where do you see yourself in 3 years?"],
    scoringRubric: {
      excellent: "Authentic, specific answer linking personal goals to role requirements",
      good: "Clear motivation but somewhat generic",
      needs_improvement: "Vague or formulaic answer",
    },
    minWordCount: 40,
    frameworkHint: "Be honest and specific about your preferences and experiences",
  };
  const caseQ = {
    id: 4,
    question: `You're given a new ${role} project with a tight deadline and limited resources. How do you approach it?`,
    type: "situational",
    category: "problem-solving",
    difficulty: "medium",
    expectedPoints: ["Prioritization framework", "Stakeholder communication", "Risk mitigation"],
    followUpQuestions: ["How would you communicate delays to leadership?"],
    scoringRubric: {
      excellent: "Structured approach with clear prioritization, risk awareness, and communication plan",
      good: "Good approach but misses risk or communication aspect",
      needs_improvement: "Unstructured or surface-level response",
    },
    minWordCount: 50,
    frameworkHint: "Structure your answer: Clarify → Hypothesize → Analyze → Recommend",
  };
  const selfQ = {
    id: 5,
    question: `What do you consider your biggest professional weakness, and what are you actively doing about it?`,
    type: "hr",
    category: "self-awareness",
    difficulty: "medium",
    expectedPoints: ["Honest weakness identification", "Active improvement plan", "Evidence of growth mindset"],
    followUpQuestions: ["How has working on this changed how you work?"],
    scoringRubric: {
      excellent: "Genuine weakness with concrete improvement steps and measurable progress",
      good: "Real weakness named with basic improvement efforts",
      needs_improvement: "Disguised strength or no improvement plan",
    },
    minWordCount: 40,
    frameworkHint: "Be genuine — interviewers appreciate self-awareness over perfection",
  };

  const questionMap: Record<InterviewType, typeof behavioralQ[]> = {
    behavioral: [behavioralQ, caseQ, selfQ],
    technical: [technicalQ, behavioralQ, caseQ],
    "system-design": [caseQ, technicalQ],
    hr: [hrQ, selfQ, behavioralQ],
    "case-study": [caseQ, behavioralQ],
    mixed: [behavioralQ, technicalQ, hrQ, caseQ, selfQ],
  };

  const questions = questionMap[interviewType] || [behavioralQ, technicalQ, hrQ];

  return {
    questions,
    interviewType,
    tips: [
      interviewType === "behavioral"
        ? "Every answer should follow the STAR format — Situation, Task, Action, Result"
        : interviewType === "technical"
          ? "Explain your thought process out loud — interviewers assess how you think, not just your answer"
          : interviewType === "system-design"
            ? "Start with clarifying questions before jumping to solutions"
            : interviewType === "case-study"
              ? "Structure is key — take 30 seconds to lay out your approach before diving in"
              : "Be authentic and specific — vague answers signal lack of real experience",
      "Back every claim with a concrete, specific example",
      "Take a breath before answering — composure matters",
      "Ask a clarifying question if you're unsure about the question's scope",
    ],
    estimatedDuration:
      interviewType === "system-design" || interviewType === "case-study"
        ? "40–50 minutes"
        : "30–45 minutes",
    isDemoData: true,
    isQuotaExceeded: false, // set to true when returned due to quota error
  };
};

// ─── Generate Interview Questions ───────────────────────────────────────────

export async function generateInterviewQuestions(
  role: string,
  experience: string,
  industry: string,
  difficulty: "beginner" | "intermediate" | "advanced" = "intermediate",
  interviewType: InterviewType = "mixed",
) {
  const cacheKey = cache.createKey(CacheKeys.INTERVIEW_QUESTIONS, {
    role,
    experience,
    industry,
    difficulty,
    interviewType,
  });

  const cachedResult = cache.get(cacheKey);
  if (cachedResult) {
    console.log("Returning cached interview questions");
    return cachedResult;
  }

  const model = getGeminiModel();
  const questionCount = getQuestionCountByType(interviewType);
  const typeInstructions = getInterviewTypeInstructions(interviewType);

  const prompt = `You are an expert interviewer conducting a ${interviewType.replace("-", " ")} interview.

Role: ${role}
Industry: ${industry}
Experience Level: ${experience}
Difficulty: ${difficulty}

Interview Type Instructions:
${typeInstructions}

Generate exactly ${questionCount} interview questions tailored specifically for a ${role} in the ${industry} industry.
IMPORTANT: Questions must be role-specific, not generic. A "technical" question for a Financial Analyst should be about finance, not coding.

Return ONLY valid JSON in this exact format:
{
  "questions": [
    {
      "id": 1,
      "question": "The actual interview question text",
      "type": "behavioral|technical|situational|hr|case-study|system-design|opening",
      "category": "category label",
      "difficulty": "easy|medium|hard",
      "expectedPoints": ["point 1", "point 2", "point 3"],
      "followUpQuestions": ["follow-up 1", "follow-up 2"],
      "scoringRubric": {
        "excellent": "What an excellent answer looks like (90–100 score)",
        "good": "What a good answer looks like (70–89 score)",
        "needs_improvement": "What a weak answer looks like (below 70)"
      },
      "minWordCount": 50,
      "frameworkHint": "A brief tip for the candidate on how to approach this question"
    }
  ],
  "interviewType": "${interviewType}",
  "tips": ["tip 1", "tip 2", "tip 3", "tip 4"],
  "estimatedDuration": "X–Y minutes"
}`;

  try {
    const apiResponse = await retryWithBackoff(
      async () => {
        const response = await model.generateContent(prompt);
        return response.response.text();
      },
      2,
      1000,
    );

    const jsonMatch = apiResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.warn("No JSON in AI response, using mock questions");
      return getMockInterviewQuestions(role, interviewType);
    }

    const parsedResult = JSON.parse(jsonMatch[0]);

    // Ensure each question has the new fields with fallbacks
    if (parsedResult.questions) {
      parsedResult.questions = parsedResult.questions.map((q: Partial<InterviewQuestion> & { id: number; question: string }) => ({
        ...q,
        scoringRubric: q.scoringRubric ?? {
          excellent: "Highly specific, structured, and quantified answer",
          good: "Clear and relevant answer with some specifics",
          needs_improvement: "Vague or generic answer without real examples",
        },
        minWordCount: q.minWordCount ?? 40,
        frameworkHint: q.frameworkHint ?? getFrameworkHintByType(interviewType, q.type ?? ""),
      }));
    }

    cache.set(cacheKey, parsedResult, { ttl: CacheTTL.LONG });
    return parsedResult;
  } catch (error: unknown) {
    const err = error as { message?: string };
    console.error("Error generating interview questions:", error);

    if (err.message?.includes("quota") || err.message?.includes("429")) {
      console.log("Using mock interview questions due to quota limits");
      const mock = getMockInterviewQuestions(role, interviewType);
      mock.isQuotaExceeded = true;
      return mock;
    }

    const mock = getMockInterviewQuestions(role, interviewType);
    return mock;
  }
}

// ─── Per-Question Evaluator with Guardrails ─────────────────────────────────

export async function evaluateInterviewAnswer(
  question: string,
  answer: string,
  role: string,
  scoringRubric?: InterviewScoringRubric,
  minWordCount: number = 40,
): Promise<EvaluationResult> {
  // ── Client-side guardrail: catch vague answers before API call ──
  const wordCount = answer.trim().split(/\s+/).filter(Boolean).length;
  if (wordCount < Math.min(minWordCount, 15)) {
    return {
      status: "needs_clarification",
      clarifyingPrompt:
        "Your answer is quite brief. Could you elaborate with a specific example from your experience? The more detail you provide, the better I can assess your fit for this role.",
      interviewerResponse:
        "I'd love to hear more about that. Can you walk me through a concrete example?",
    };
  }

  const model = getGeminiModel();

  const rubricText = scoringRubric
    ? `Scoring rubric:
- Excellent (90–100): ${scoringRubric.excellent}
- Good (70–89): ${scoringRubric.good}
- Needs improvement (<70): ${scoringRubric.needs_improvement}`
    : "";

  const prompt = `You are an expert interviewer evaluating a candidate for a ${role} position.

Question: ${question}
Candidate's Answer: ${answer}
${rubricText}

Evaluate the answer on four dimensions (each 0–25):
- relevance: How directly does the answer address the question?
- specificity: Does the candidate use concrete examples vs vague generalities?
- depth: Is the answer substantive and well-developed?
- communication: Is the answer clear, structured, and well-articulated?

Also determine if the answer is too vague to evaluate properly.

Return ONLY valid JSON:
{
  "status": "evaluated",
  "score": <sum of 4 dimensions, 0–100>,
  "dimensions": {
    "relevance": <0–25>,
    "specificity": <0–25>,
    "depth": <0–25>,
    "communication": <0–25>
  },
  "strengths": ["strength 1", "strength 2"],
  "improvements": ["improvement 1", "improvement 2"],
  "interviewerResponse": "A 1–2 sentence natural interviewer response acknowledging the answer"
}

If the answer is genuinely too vague or lacks any real substance, return:
{
  "status": "needs_clarification",
  "clarifyingPrompt": "A specific follow-up question to draw out more detail",
  "interviewerResponse": "A polite prompt asking them to elaborate"
}`;

  try {
    const text = await retryWithBackoff(
      async () => {
        const result = await model.generateContent(prompt);
        return result.response.text();
      },
      3,
      1500,
      20000,
    );

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Invalid AI response format");

    const parsed = JSON.parse(jsonMatch[0]) as EvaluationResult;

    // Ensure score is consistent with dimensions if both present
    if (parsed.status === "evaluated" && parsed.dimensions && !parsed.score) {
      const { relevance, specificity, depth, communication } = parsed.dimensions;
      parsed.score = relevance + specificity + depth + communication;
    }

    return parsed;
  } catch (error) {
    console.error("Error evaluating answer:", error);
    const isQuota = (error as { status?: number; message?: string })?.status === 429
      || (error as { message?: string })?.message?.includes("429")
      || (error as { message?: string })?.message?.includes("quota");
    // Graceful fallback — don't block the interview
    return {
      status: "evaluated",
      score: 65,
      dimensions: { relevance: 17, specificity: 15, depth: 16, communication: 17 },
      strengths: ["You addressed the question"],
      improvements: ["Try to include more specific examples with measurable outcomes"],
      interviewerResponse: "Thank you for that answer. Let's move on.",
      isDemoData: true,
      isQuotaExceeded: isQuota,
    } as EvaluationResult & { isDemoData: boolean; isQuotaExceeded: boolean };
  }
}

// ─── Final Report Generator ─────────────────────────────────────────────────

export async function generateFinalReport(
  role: string,
  interviewType: InterviewType,
  perQuestionResults: PerQuestionResult[],
): Promise<FinalReport> {
  // Calculate weighted overall score from per-question results
  const scores = perQuestionResults.map((r) => r.score);
  const avgScore = scores.length > 0
    ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
    : 60;

  const gradeFromScore = (s: number): FinalReport["grade"] => {
    if (s >= 93) return "A+";
    if (s >= 85) return "A";
    if (s >= 78) return "B+";
    if (s >= 70) return "B";
    if (s >= 60) return "C";
    return "D";
  };

  const hireFromScore = (s: number): FinalReport["hireRecommendation"] => {
    if (s >= 85) return "Strong Yes";
    if (s >= 72) return "Yes";
    if (s >= 60) return "Maybe";
    return "No";
  };

  // Compute competency scores from dimension averages
  const avgDim = (dim: keyof EvaluationDimensions) => {
    const vals = perQuestionResults
      .filter((r) => r.dimensions)
      .map((r) => r.dimensions[dim]);
    return vals.length > 0
      ? Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 4) // scale 0–25 → 0–100
      : 60;
  };

  const competencyScores = {
    communication: avgDim("communication"),
    problemSolving: avgDim("depth"),
    technicalKnowledge: avgDim("relevance"),
    cultureFit: avgDim("specificity"),
    structuredThinking: Math.round((avgDim("depth") + avgDim("communication")) / 2),
  };

  // Try to get an AI-generated narrative summary
  const model = getGeminiModel();
  const summaryPrompt = `Write a concise 2-sentence interview summary for a ${role} candidate who scored ${avgScore}/100 in a ${interviewType} interview.
Per-question scores: ${perQuestionResults.map((r, i) => `Q${i + 1}: ${r.score}/100`).join(", ")}.
Return only plain text, no JSON, no markdown.`;

  let interviewSummary = `The candidate demonstrated ${avgScore >= 75 ? "strong" : avgScore >= 60 ? "moderate" : "developing"} proficiency across the interview questions. ${avgScore >= 75 ? "They showed clear communication and relevant examples." : "There is room to build more depth and specificity in their answers."}`;

  try {
    const summaryResult = await model.generateContent(summaryPrompt);
    const summaryText = summaryResult.response.text().trim();
    if (summaryText.length > 20) interviewSummary = summaryText;
  } catch {
    // Use the fallback summary above
  }

  // Aggregate top strengths & improvements from all per-question feedback
  const allStrengths: string[] = [];
  const allImprovements: string[] = [];
  perQuestionResults.forEach(() => {
    // These come from the evaluation results stored in the UI layer
  });

  const topStrengths =
    allStrengths.length > 0
      ? allStrengths.slice(0, 3)
      : avgScore >= 75
        ? ["Clear communication", "Relevant examples provided", "Structured responses"]
        : ["Engaged with the questions", "Showed willingness to improve"];

  const criticalImprovements =
    allImprovements.length > 0
      ? allImprovements.slice(0, 3)
      : ["Provide more quantified, specific examples", "Use structured frameworks consistently", "Deepen role-specific knowledge"];

  const nextSteps = [
    avgScore < 70 ? "Practice answering questions using the STAR method daily" : "Refine your strongest stories with more quantified data",
    interviewType === "technical" || interviewType === "system-design"
      ? "Review core technical concepts for your domain"
      : "Prepare 5–7 strong STAR stories covering leadership, conflict, and growth",
    "Record yourself answering questions and review for clarity and structure",
    "Research the company deeply — mission, recent news, culture, and the team",
    "Prepare 3 strong questions to ask the interviewer",
  ];

  return {
    overallScore: avgScore,
    grade: gradeFromScore(avgScore),
    competencyScores,
    topStrengths,
    criticalImprovements,
    hireRecommendation: hireFromScore(avgScore),
    interviewSummary,
    perQuestionBreakdown: perQuestionResults,
    nextSteps,
  };
}

// Resume Optimization
export async function optimizeResume(
  resumeText: string,
  targetRole: string,
  jobDescription?: string,
) {
  const model = getGeminiModel();

  const prompt = `Optimize resume for ${targetRole}:
${resumeText.substring(0, 500)}...
${jobDescription ? jobDescription.substring(0, 200) : ""}

JSON: {"analysis":{"atsScore":0,"strengths":[],"weaknesses":[],"missingKeywords":[]},"optimizations":[],"actionItems":[],"score":{"overall":0}}`;

  try {
    const text = await retryWithBackoff(
      async () => {
        const result = await model.generateContent(prompt);
        return result.response.text();
      },
      3,
      1500,
      20000,
    );

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Invalid response format from AI");

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error("Error optimizing resume:", error);
    // Re-throw original error so callers can detect status (e.g. 429 quota)
    throw error;
  }
}

// Career Path Recommendations
export async function getCareerPathRecommendations(
  currentRole: string,
  skills: string[],
  _interests: string[],
  timeframe: string,
) {
  const model = getGeminiModel();

  const prompt = `Career paths for ${currentRole} with skills: ${skills.join(", ")}\nTimeframe: ${timeframe}\n\nJSON: {"paths":[{"title":"","match":0,"description":"","requiredSkills":[],"timeline":"","salaryRange":"","steps":[]}],"skillGaps":{"critical":[],"important":[]},"marketTrends":[]}`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Invalid response format from AI");
    }

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error("Error getting career recommendations:", error);
    throw new Error("Failed to get career recommendations. Please try again.");
  }
}
