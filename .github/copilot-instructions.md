<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# Abhyas - AI-Powered Career Advisor

This is a production-ready React + Vite + TypeScript application with Clerk authentication, TailwindCSS, and modern UI components.

## ✅ Completed Setup

- [x] **Project Scaffolding**: React + Vite + TypeScript project created
- [x] **Authentication**: Clerk integration with official setup
- [x] **Styling**: TailwindCSS with custom CSS variables and shadcn/ui components
- [x] **Routing**: React Router DOM with protected routes
- [x] **UI Components**: Landing page, dashboard, and three main feature components
- [x] **Development Environment**: Development server running on http://localhost:5173
- [x] **Build System**: Successfully compiles to production build
- [x] **Documentation**: Comprehensive README with setup and deployment instructions

## 🚀 Key Features Implemented

1. **Landing Page**: Marketing page with hero section, features, and CTAs
2. **Dashboard**: Protected route showing navigation to tools
3. **Skills Gap Analysis**: Interactive form with mock AI analysis results
4. **Mock Interview**: Chat-style interface with real-time tips
5. **Resume Optimizer**: File upload with optimization suggestions

## 🛠 Tech Stack

- Frontend: React 19 + Vite 7 + TypeScript
- Authentication: Clerk (configured)
- Styling: TailwindCSS + Custom CSS Variables
- UI: Custom components with Radix UI primitives
- Icons: Lucide React
- Routing: React Router DOM

## 🔧 Development Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 📝 Next Steps for AI Integration

1. Set up Google Gemini API credentials
2. Install backend dependencies: `@vercel/node`, `@clerk/clerk-sdk-node`, `@google/generative-ai`
3. Implement real API routes in `/api` directory
4. Replace mock data with actual AI API calls
5. Add database integration with Prisma + PostgreSQL
6. Implement file processing for resume optimization
7. Add speech-to-text for interview coach

## 🔐 Environment Setup Required

Update `.env.local` with actual API keys:
```bash
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_actual_key
VITE_GEMINI_API_KEY=your_gemini_api_key
VITE_GOOGLE_SPEECH_API_KEY=your_google_speech_api_key
```

The application is ready for development and can be deployed to Vercel immediately with basic functionality.