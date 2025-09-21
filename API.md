# API Integration Guide

## Overview

The Abhyas application is designed to integrate with AI services through Vercel serverless functions. This guide shows how to implement the backend API routes.

## API Routes Structure

```
api/
├── skills-analysis.ts     # Skills gap analysis endpoint
├── mock-interview.ts      # Mock interview generation
├── resume-optimize.ts     # Resume optimization
└── auth/                  # Authentication utilities
    └── middleware.ts      # Clerk auth middleware
```

## Skills Analysis API

**Endpoint**: `POST /api/skills-analysis`

**Request Body**:
```typescript
{
  currentSkills: string;
  targetRole: string;
}
```

**Response**:
```typescript
{
  success: boolean;
  data: {
    missingSkills: string[];
    improvementAreas: string[];
    recommendations: string[];
  }
}
```

## Mock Interview API

**Endpoint**: `POST /api/mock-interview`

**Request Body**:
```typescript
{
  role: string;
  experienceLevel: 'junior' | 'mid' | 'senior';
  questionType: 'behavioral' | 'technical' | 'mixed';
}
```

**Response**:
```typescript
{
  success: boolean;
  data: {
    question: string;
    expectedAnswerPoints: string[];
    difficulty: number;
  }
}
```

## Resume Optimization API

**Endpoint**: `POST /api/resume-optimize`

**Request Body**:
```typescript
{
  resumeText: string;
  jobDescription?: string;
}
```

**Response**:
```typescript
{
  success: boolean;
  data: {
    score: number;
    suggestions: Array<{
      type: 'improvement' | 'warning' | 'success';
      category: string;
      message: string;
    }>;
    keywords: {
      present: string[];
      missing: string[];
    };
  }
}
```

## Authentication Middleware

All API routes should be protected with Clerk authentication:

```typescript
import { getAuth } from '@clerk/clerk-sdk-node';

export function withAuth(handler: Function) {
  return async (req: VercelRequest, res: VercelResponse) => {
    const { userId } = getAuth(req);
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    return handler(req, res);
  };
}
```

## Implementation Steps

1. **Install Dependencies**:
   ```bash
   npm install @vercel/node @clerk/clerk-sdk-node @google/generative-ai
   ```

2. **Set Environment Variables**:
   ```bash
   CLERK_SECRET_KEY=sk_live_your_secret_key
   GEMINI_API_KEY=your_gemini_api_key
   ```

3. **Create API Routes**: Use the example files in the `/api` directory

4. **Update Frontend**: Replace mock data with actual API calls

## Error Handling

All API routes should implement proper error handling:

```typescript
try {
  // API logic here
  return res.status(200).json({ success: true, data: result });
} catch (error) {
  console.error('API Error:', error);
  return res.status(500).json({ 
    success: false, 
    error: 'Internal server error' 
  });
}
```

## Rate Limiting

For production, implement rate limiting to prevent abuse:

```typescript
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s'),
});
```

## Testing

Test API routes locally:

```bash
curl -X POST http://localhost:5173/api/skills-analysis \
  -H "Content-Type: application/json" \
  -d '{"currentSkills": "JavaScript, HTML, CSS", "targetRole": "Frontend Developer"}'
```