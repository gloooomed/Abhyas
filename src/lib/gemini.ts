import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || '');

// Get the Gemini Flash model (higher free tier limits)
export const getGeminiModel = () => {
  if (!import.meta.env.VITE_GEMINI_API_KEY) {
    throw new Error('Gemini API key is not configured. Please add VITE_GEMINI_API_KEY to your .env.local file.');
  }
  return genAI.getGenerativeModel({ 
    model: 'gemini-1.5-flash',
    generationConfig: {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 4096,
    }
  });
};

// Retry function with exponential backoff
const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      if (i === maxRetries - 1) throw error;
      
      // Check if it's a quota error
      if (error.message?.includes('quota') || error.message?.includes('429')) {
        const delay = baseDelay * Math.pow(2, i) + Math.random() * 1000;
        console.log(`Quota exceeded, retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        throw error;
      }
    }
  }
  throw new Error('Max retries exceeded');
};

// Mock data for when API fails
const getMockSkillsAnalysis = (currentSkills: string[], targetRole: string, experience: string, industry: string) => {
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
        "Testing Frameworks"
      ],
      skillsToImprove: [
        "JavaScript ES6+",
        "Data Structures & Algorithms",
        "Version Control (Git)",
        "Problem Solving",
        "Code Optimization"
      ],
      strongSkills: currentSkills.length > 0 ? currentSkills : [
        "HTML5",
        "CSS3",
        "Basic JavaScript",
        "Responsive Design",
        "Communication Skills"
      ]
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
            difficulty: "Intermediate"
          },
          {
            title: "React - The Complete Guide",
            type: "Course",
            provider: "Udemy",
            url: "https://www.udemy.com/course/react-the-complete-guide-incl-redux/",
            duration: "48 hours",
            difficulty: "Beginner to Advanced"
          }
        ]
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
            difficulty: "Intermediate"
          }
        ]
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
            difficulty: "Advanced"
          }
        ]
      }
    ],
    careerPath: {
      nextSteps: [
        "Master React.js and build 3-4 portfolio projects",
        "Learn TypeScript and convert existing projects",
        "Gain experience with backend technologies (Node.js)",
        "Study system design principles and scalability",
        "Contribute to open-source projects",
        "Network with professionals in the industry",
        "Prepare for technical interviews"
      ],
      timelineMonths: experience === 'Entry Level' ? 12 : experience === 'Mid Level' ? 8 : 6,
      salaryProjection: experience === 'Entry Level' 
        ? `$60,000 - $80,000 for entry-level ${targetRole} positions in ${industry}`
        : experience === 'Mid Level'
        ? `$80,000 - $110,000 for mid-level ${targetRole} positions in ${industry}`
        : `$110,000 - $150,000 for senior-level ${targetRole} positions in ${industry}`
    }
  };
};

// Skills Gap Analysis
export async function analyzeSkillsGap(
  currentSkills: string[],
  targetRole: string,
  experience: string,
  industry: string
) {
  // First try with shorter, more efficient prompt to save tokens
  const model = getGeminiModel();
  
  const prompt = `Analyze skills gap for ${targetRole} in ${industry} (${experience} level).
Current: ${currentSkills.join(', ')}

Return ONLY JSON:
{
  "gapAnalysis": {
    "missingSkills": ["skill1", "skill2"],
    "skillsToImprove": ["skill1", "skill2"], 
    "strongSkills": ["skill1", "skill2"]
  },
  "recommendations": [
    {
      "skill": "React.js",
      "priority": "High",
      "timeToLearn": "3 months",
      "resources": [{"title": "React Docs", "type": "Course", "provider": "React", "url": "https://react.dev", "duration": "40h", "difficulty": "Medium"}]
    }
  ],
  "careerPath": {
    "nextSteps": ["step1", "step2"],
    "timelineMonths": 6,
    "salaryProjection": "$70k-90k"
  }
}`;

  try {
    console.log('Attempting AI analysis...');
    
    const result = await retryWithBackoff(async () => {
      const response = await model.generateContent(prompt);
      return response.response.text();
    }, 2, 1000);
    
    console.log('Raw AI response:', result);
    
    // Clean up the response to ensure it's valid JSON
    const jsonMatch = result.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.warn('No JSON found in AI response, using mock data');
      return getMockSkillsAnalysis(currentSkills, targetRole, experience, industry);
    }
    
    const cleanedJson = jsonMatch[0];
    const parsedResponse = JSON.parse(cleanedJson);
    
    // Validate the response structure
    if (!parsedResponse.gapAnalysis || !parsedResponse.recommendations || !parsedResponse.careerPath) {
      console.warn('Invalid AI response structure, using mock data');
      return getMockSkillsAnalysis(currentSkills, targetRole, experience, industry);
    }
    
    console.log('Successfully parsed AI response');
    return parsedResponse;
    
  } catch (error: any) {
    console.error('AI analysis failed:', error);
    
    // Check if it's a quota error
    if (error.message?.includes('quota') || error.message?.includes('429')) {
      console.log('Quota exceeded, falling back to demo data with realistic analysis');
      
      // Show user-friendly message but still provide value
      const mockData = getMockSkillsAnalysis(currentSkills, targetRole, experience, industry);
      
      // Customize mock data based on user input
      if (currentSkills.length > 0) {
        mockData.gapAnalysis.strongSkills = currentSkills.slice(0, 3);
      }
      
      // Add a note about using demo data
      (mockData as any).isDemoData = true;
      (mockData as any).note = "This is demo analysis due to API limits. Upgrade for personalized AI analysis.";
      
      return mockData;
    }
    
    // For other errors, still provide mock data but with error indication
    console.log('Using fallback analysis due to error:', error.message);
    const mockData = getMockSkillsAnalysis(currentSkills, targetRole, experience, industry);
    (mockData as any).isError = true;
    return mockData;
  }
}

// Mock Interview Questions Generation
export async function generateInterviewQuestions(
  role: string,
  experience: string,
  industry: string,
  difficulty: 'beginner' | 'intermediate' | 'advanced' = 'intermediate'
) {
  const model = getGeminiModel();
  
  // Shorter prompt to save tokens
  const prompt = `Generate 10 ${difficulty} interview questions for ${role} in ${industry} (${experience} level).

Return JSON:
{
  "questions": [
    {
      "id": 1,
      "question": "Tell me about yourself",
      "type": "opening",
      "category": "introduction",
      "difficulty": "easy",
      "expectedPoints": ["background", "motivation"],
      "followUpQuestions": ["What interests you about this role?"]
    }
  ],
  "tips": ["Use STAR method", "Be specific"],
  "estimatedDuration": "45-60 minutes"
}`;

  try {
    const result = await retryWithBackoff(async () => {
      const response = await model.generateContent(prompt);
      return response.response.text();
    }, 2, 1000);
    
    const jsonMatch = result.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      // Return mock questions if API fails
      return getMockInterviewQuestions(role, experience, industry, difficulty);
    }
    
    return JSON.parse(jsonMatch[0]);
  } catch (error: any) {
    console.error('Error generating interview questions:', error);
    
    if (error.message?.includes('quota') || error.message?.includes('429')) {
      console.log('Using mock interview questions due to quota limits');
      return getMockInterviewQuestions(role, experience, industry, difficulty);
    }
    
    throw new Error('Failed to generate interview questions. Please try again.');
  }
}

// Mock interview questions
const getMockInterviewQuestions = (role: string, _experience: string, _industry: string, _difficulty: string) => {
  return {
    questions: [
      {
        id: 1,
        question: "Tell me about yourself and what brings you to this position.",
        type: "opening",
        category: "introduction",
        difficulty: "easy",
        expectedPoints: [
          "Professional background summary",
          "Career motivation",
          "Relevant experience highlights"
        ],
        followUpQuestions: [
          "What specific aspect of this role excites you most?"
        ]
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
          "Relevant skills demonstrated"
        ],
        followUpQuestions: [
          "Can you give me a specific example of a challenge you overcame?"
        ]
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
          "Professional development goals"
        ],
        followUpQuestions: [
          "How does this role fit into your career plans?"
        ]
      },
      {
        id: 4,
        question: "Describe a challenging project you worked on and how you handled it.",
        type: "behavioral",
        category: "problem-solving",
        difficulty: "medium",
        expectedPoints: [
          "Clear problem description using STAR method",
          "Action steps taken",
          "Measurable results"
        ],
        followUpQuestions: [
          "What would you do differently if faced with a similar situation?"
        ]
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
          "Understanding of role requirements"
        ],
        followUpQuestions: [
          "Which of these skills do you consider your strongest?"
        ]
      }
    ],
    tips: [
      "Use the STAR method (Situation, Task, Action, Result) for behavioral questions",
      "Be specific with examples and include measurable outcomes when possible",
      "Research the company and role thoroughly before the interview",
      "Prepare thoughtful questions to ask about the role and company",
      "Practice describing technical concepts in simple, clear terms"
    ],
    estimatedDuration: "45-60 minutes",
    isDemoData: true,
    note: "These are sample questions. Our AI generates role-specific questions when available."
  };
};

// Evaluate Interview Answer
export async function evaluateInterviewAnswer(
  question: string,
  answer: string,
  role: string
) {
  const model = getGeminiModel();
  
  const prompt = `
You are a senior hiring manager conducting a critical evaluation of interview performance for a ${role} position.

Question: ${question}
Candidate's Answer: ${answer}

Evaluate this answer critically but constructively, like a real interviewer would. Be honest about weaknesses while providing actionable feedback.

Consider:
- Content quality and relevance
- Structure and clarity of communication
- Specific examples and evidence provided
- Technical accuracy (if applicable)
- Depth of thinking and analysis
- Professional maturity and confidence
- Areas where the answer fell short

Provide detailed, structured feedback in JSON format:
{
  "score": 72,
  "evaluation": {
    "strengths": [
      "Provided a clear, specific example from previous experience",
      "Demonstrated good understanding of the core concepts",
      "Communicated confidently and professionally"
    ],
    "weaknesses": [
      "Lacked quantifiable results or metrics",
      "Could have addressed the team collaboration aspect",
      "Missed opportunity to connect to business impact"
    ],
    "improvements": [
      "Structure your answer using STAR method (Situation, Task, Action, Result)",
      "Include specific numbers, percentages, or measurable outcomes",
      "Connect your example to broader business or team objectives"
    ],
    "missingElements": [
      "Quantifiable results",
      "Leadership or initiative aspects",
      "Lessons learned or growth from the experience"
    ]
  },
  "interviewerResponse": "Thank you for that example. I can see you have relevant experience, though I'd like to understand more about the measurable impact. Could you share specific metrics or outcomes from that project?",
  "detailedAnalysis": {
    "communicationClarity": 8,
    "contentRelevance": 7,
    "specificityOfExamples": 6,
    "professionalMaturity": 8,
    "technicalAccuracy": 7
  },
  "coachingNotes": [
    "Practice quantifying achievements with specific numbers",
    "Develop 2-3 strong STAR examples for each competency area",
    "Research common follow-up questions for this type of scenario"
  ]
}

Be critical but fair. Score range:
- 90-100: Outstanding, comprehensive answer
- 80-89: Strong answer with minor gaps
- 70-79: Good answer but missing key elements
- 60-69: Adequate but needs significant improvement
- Below 60: Weak answer, major gaps

Provide honest, professional feedback that helps them improve.
`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid response format from AI');
    }
    
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('Error evaluating answer:', error);
    throw new Error('Failed to evaluate answer. Please try again.');
  }
}

// Resume Optimization
export async function optimizeResume(
  resumeText: string,
  targetRole: string,
  jobDescription?: string
) {
  const model = getGeminiModel();
  
  const prompt = `
Analyze and optimize this resume for a ${targetRole} position:

Resume Content:
${resumeText}

${jobDescription ? `Job Description: ${jobDescription}` : ''}

Provide optimization suggestions in JSON format:
{
  "analysis": {
    "atsScore": 85,
    "strengths": ["strength1", "strength2"],
    "weaknesses": ["weakness1", "weakness2"],
    "missingKeywords": ["keyword1", "keyword2"],
    "formatIssues": ["issue1", "issue2"]
  },
  "optimizations": [
    {
      "section": "Professional Summary",
      "current": "Current text",
      "improved": "Improved version",
      "reasoning": "Why this change is better"
    }
  ],
  "keywords": {
    "missing": ["keyword1", "keyword2"],
    "suggested": ["suggested keyword placement"],
    "density": "Analysis of keyword usage"
  },
  "actionItems": [
    {
      "priority": "High|Medium|Low",
      "action": "Specific action to take",
      "impact": "Expected improvement"
    }
  ],
  "score": {
    "overall": 85,
    "atsCompatibility": 90,
    "relevance": 80,
    "formatting": 85
  }
}

Focus on ATS optimization, keyword matching, and impact-driven content.
`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid response format from AI');
    }
    
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('Error optimizing resume:', error);
    throw new Error('Failed to optimize resume. Please try again.');
  }
}

// Career Path Recommendations
export async function getCareerPathRecommendations(
  currentRole: string,
  skills: string[],
  interests: string[],
  timeframe: string
) {
  const model = getGeminiModel();
  
  const prompt = `
Provide career path recommendations for:

Current Role: ${currentRole}
Skills: ${skills.join(', ')}
Interests: ${interests.join(', ')}
Timeframe: ${timeframe}

Return recommendations in JSON format:
{
  "paths": [
    {
      "title": "Senior Software Engineer",
      "match": 95,
      "description": "Natural progression path",
      "requiredSkills": ["skill1", "skill2"],
      "timeline": "1-2 years",
      "salaryRange": "$80,000 - $120,000",
      "steps": [
        "Step 1: Action to take",
        "Step 2: Next action"
      ]
    }
  ],
  "skillGaps": {
    "critical": ["skill1"],
    "important": ["skill2"],
    "nice-to-have": ["skill3"]
  },
  "marketTrends": [
    "Trend 1 affecting this career path",
    "Trend 2 to be aware of"
  ]
}

Provide 3-5 realistic career paths with actionable steps.
`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid response format from AI');
    }
    
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('Error getting career recommendations:', error);
    throw new Error('Failed to get career recommendations. Please try again.');
  }
}