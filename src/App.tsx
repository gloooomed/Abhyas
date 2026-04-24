import { lazy, Suspense } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useAuth, AuthProvider } from "./contexts/AuthContext";
import LoadingSpinner from "./components/ui/LoadingSpinner";

const LandingPage = lazy(() => import("./components/LandingPage"));
const Dashboard = lazy(() => import("./components/Dashboard"));
const SkillsGapAnalysis = lazy(() => import("./components/SkillsGapAnalysis"));
const MockInterview = lazy(() => import("./components/MockInterview"));
const ResumeOptimizer = lazy(() => import("./components/ResumeOptimizer"));
const AboutUs = lazy(() => import("./components/AboutUs"));
const SignInPage = lazy(() => import("./components/SignInPage"));
const AuthCallback = lazy(() => import("./components/AuthCallback"));
const HistoryPage = lazy(() => import("./components/HistoryPage"));
const TermsPage = lazy(() => import("./components/TermsPage"));
const PrivacyPage = lazy(() => import("./components/PrivacyPage"));

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black transition-colors duration-300">
      <LoadingSpinner size="lg" text="Loading..." />
    </div>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (!session) return <Navigate to="/sign-in" replace />;
  return <>{children}</>;
}

function PublicOnlyRoute({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (session) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  const { session, loading } = useAuth();

  if (loading) return <PageLoader />;

  return (
    <div className="min-h-screen bg-white dark:bg-black transition-colors duration-300">
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Home — landing or dashboard based on auth */}
          <Route
            path="/"
            element={session ? <Dashboard /> : <LandingPage />}
          />

          {/* Protected routes */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/history" element={<ProtectedRoute><HistoryPage /></ProtectedRoute>} />

          {/* Feature routes */}
          <Route path="/skills-analysis" element={<SkillsGapAnalysis />} />
          <Route path="/mock-interview" element={<MockInterview />} />
          <Route path="/resume-optimizer" element={<ResumeOptimizer />} />

          {/* Public routes */}
          <Route path="/about" element={<AboutUs />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />

          {/* Auth routes */}
          <Route path="/sign-in" element={<PublicOnlyRoute><SignInPage /></PublicOnlyRoute>} />
          <Route path="/sign-up" element={<Navigate to="/sign-in" replace />} />
          <Route path="/auth/callback" element={<AuthCallback />} />

          {/* 404 */}
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
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;
