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
    model: "gemini-2.5-flash",
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
      return getMockSkillsAnalysis(
        currentSkills,
        targetRole,
        experience,
        industry,
      );
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
      return getMockSkillsAnalysis(
        currentSkills,
        targetRole,
        experience,
        industry,
      );
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
    return mockData;
  }
}

// Mock Interview Questions Generation with caching
export async function generateInterviewQuestions(
  role: string,
  experience: string,
  industry: string,
  difficulty: "beginner" | "intermediate" | "advanced" = "intermediate",
) {
  // Check cache first
  const cacheKey = cache.createKey(CacheKeys.INTERVIEW_QUESTIONS, {
    role,
    experience,
    industry,
    difficulty,
  });

  const cachedResult = cache.get(cacheKey);
  if (cachedResult) {
    console.log("Returning cached interview questions");
    return cachedResult;
  }

  const model = getGeminiModel();

  const prompt = `Generate 8 ${difficulty} interview questions for ${role}:
{"questions":[{"id":1,"question":"","type":"","category":"","difficulty":"","expectedPoints":[],"followUpQuestions":[]}],"tips":[],"estimatedDuration":""}`;

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
      // Return mock questions if API fails
      return getMockInterviewQuestions(role);
    }

    const parsedResult = JSON.parse(jsonMatch[0]);

    // Cache the successful response
    cache.set(cacheKey, parsedResult, { ttl: CacheTTL.LONG });

    return parsedResult;
  } catch (error: unknown) {
    const err = error as { message?: string };
    console.error("Error generating interview questions:", error);

    if (err.message?.includes("quota") || err.message?.includes("429")) {
      console.log("Using mock interview questions due to quota limits");
      return getMockInterviewQuestions(role);
    }

    throw new Error(
      "Failed to generate interview questions. Please try again.",
    );
  }
}

// Mock interview questions
const getMockInterviewQuestions = (role: string) => {
  return {
    questions: [
      {
        id: 1,
        question:
          "Tell me about yourself and what brings you to this position.",
        type: "opening",
        category: "introduction",
        difficulty: "easy",
        expectedPoints: [
          "Professional background summary",
          "Career motivation",
          "Relevant experience highlights",
        ],
        followUpQuestions: [
          "What specific aspect of this role excites you most?",
        ],
      },
      {
        id: 2,
        question: `What experience do you have with ${role.toLowerCase()} responsibilities?`,
        type: "experience",
        category: "background",
        difficulty: "medium",
        expectedPoints: [
          "Specific examples from past roles",
          "Quantifiable achievements",
          "Relevant skills demonstrated",
        ],
        followUpQuestions: [
          "Can you give me a specific example of a challenge you overcame?",
        ],
      },
      {
        id: 3,
        question: "Where do you see yourself in 3-5 years?",
        type: "career",
        category: "goals",
        difficulty: "medium",
        expectedPoints: [
          "Clear career progression plan",
          "Alignment with company growth",
          "Professional development goals",
        ],
        followUpQuestions: ["How does this role fit into your career plans?"],
      },
      {
        id: 4,
        question:
          "Describe a challenging project you worked on and how you handled it.",
        type: "behavioral",
        category: "problem-solving",
        difficulty: "medium",
        expectedPoints: [
          "Clear problem description using STAR method",
          "Action steps taken",
          "Measurable results",
        ],
        followUpQuestions: [
          "What would you do differently if faced with a similar situation?",
        ],
      },
      {
        id: 5,
        question: `What do you think are the most important skills for a ${role}?`,
        type: "technical",
        category: "expertise",
        difficulty: "medium",
        expectedPoints: [
          "Industry-relevant skills",
          "Both technical and soft skills",
          "Understanding of role requirements",
        ],
        followUpQuestions: [
          "Which of these skills do you consider your strongest?",
        ],
      },
    ],
    tips: [
      "Use the STAR method (Situation, Task, Action, Result) for behavioral questions",
      "Be specific with examples and include measurable outcomes when possible",
      "Research the company and role thoroughly before the interview",
      "Prepare thoughtful questions to ask about the role and company",
      "Practice describing technical concepts in simple, clear terms",
    ],
    estimatedDuration: "45-60 minutes",
    isDemoData: true,
    note: "These are sample questions. Our AI generates role-specific questions when available.",
  };
};

// Evaluate Interview Answer
export async function evaluateInterviewAnswer(
  question: string,
  answer: string,
  role: string,
) {
  const model = getGeminiModel();

  const prompt = `Evaluate interview answer for ${role}:
Q: ${question}
A: ${answer}

JSON: {"score":0,"evaluation":{"strengths":[],"weaknesses":[],"improvements":[]},"interviewerResponse":""}`;

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
    console.error("Error evaluating answer:", error);
    throw new Error("Failed to evaluate answer. Please try again.");
  }
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
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Invalid response format from AI");
    }

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error("Error optimizing resume:", error);
    throw new Error("Failed to optimize resume. Please try again.");
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
