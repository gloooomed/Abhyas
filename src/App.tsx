import { lazy, Suspense } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { SignedIn, SignedOut, useAuth } from "@clerk/clerk-react";
import LoadingSpinner from "./components/ui/LoadingSpinner";

// Lazy load all route components for better initial bundle size
const LandingPage = lazy(() => import("./components/LandingPage"));
const Dashboard = lazy(() => import("./components/Dashboard"));
const SkillsGapAnalysis = lazy(() => import("./components/SkillsGapAnalysis"));
const MockInterview = lazy(() => import("./components/MockInterview"));
const ResumeOptimizer = lazy(() => import("./components/ResumeOptimizer"));
const AboutUs = lazy(() => import("./components/AboutUs"));
const SignInPage = lazy(() => import("./components/SignInPage"));
const SignUpPage = lazy(() => import("./components/SignUpPage"));

// Loading fallback component
function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black transition-colors duration-300">
      <LoadingSpinner size="lg" text="Loading..." />
    </div>
  );
}

// Protected route wrapper component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isSignedIn, isLoaded } = useAuth();

  // Show loading while auth state is being determined
  if (!isLoaded) {
    return <PageLoader />;
  }

  // Redirect to sign-in if not authenticated
  if (!isSignedIn) {
    return <Navigate to="/sign-in" replace />;
  }

  return <>{children}</>;
}

// Public route that redirects to dashboard if already signed in
function PublicOnlyRoute({ children }: { children: React.ReactNode }) {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) {
    return <PageLoader />;
  }

  if (isSignedIn) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-white dark:bg-black transition-colors duration-300">
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Home route - shows landing or dashboard based on auth */}
            <Route
              path="/"
              element={
                <>
                  <SignedOut>
                    <LandingPage />
                  </SignedOut>
                  <SignedIn>
                    <Dashboard />
                  </SignedIn>
                </>
              }
            />

            {/* Protected routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            {/* Feature routes - accessible to all but functionality requires auth */}
            <Route path="/skills-analysis" element={<SkillsGapAnalysis />} />
            <Route path="/mock-interview" element={<MockInterview />} />
            <Route path="/resume-optimizer" element={<ResumeOptimizer />} />

            {/* Public routes */}
            <Route path="/about" element={<AboutUs />} />

            {/* Auth routes - redirect to dashboard if already signed in */}
            <Route
              path="/sign-in/*"
              element={
                <PublicOnlyRoute>
                  <SignInPage />
                </PublicOnlyRoute>
              }
            />
            <Route
              path="/sign-up/*"
              element={
                <PublicOnlyRoute>
                  <SignUpPage />
                </PublicOnlyRoute>
              }
            />

            {/* Catch-all route for 404 */}
            <Route
              path="*"
              element={
                <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-black text-black dark:text-white transition-colors duration-300">
                  <h1 className="text-8xl font-semibold tracking-tighter mb-4">404</h1>
                  <p className="text-slate-500 dark:text-zinc-400 tracking-tight mb-8">This page doesn't exist.</p>
                  <a href="/" className="px-6 py-3 rounded-full bg-black dark:bg-white text-white dark:text-black text-sm font-medium tracking-tight hover:opacity-80 transition-opacity">
                    Go back home
                  </a>
                </div>
              }
            />
          </Routes>
        </Suspense>
      </div>
    </Router>
  );
}

export default App;
