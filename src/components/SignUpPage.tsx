import { SignUp } from '@clerk/clerk-react'
import { Github } from 'lucide-react'
import Navigation from './Navigation'

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Navigation */}
      <Navigation isAuthPage={true} />

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          {/* Welcome Section */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Join Abhyas</h1>
            <p className="text-gray-600">Create your account and start your AI-powered career journey</p>
          </div>

          {/* Clerk SignUp Component */}
          <div className="flex justify-center">
            <SignUp 
              routing="path" 
              path="/sign-up"
              redirectUrl="/dashboard"
              signInUrl="/sign-in"
              appearance={{
                elements: {
                  headerTitle: {
                    display: "none",
                  },
                  headerSubtitle: {
                    display: "none",
                  },
                  card: {
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                    border: "1px solid #e5e7eb",
                    borderRadius: "12px",
                    backgroundColor: "white",
                    padding: "16px 32px 24px 32px",
                  },
                  formButtonPrimary: {
                    backgroundColor: "#3b82f6",
                    borderRadius: "8px",
                    fontSize: "16px",
                    fontWeight: "600",
                    padding: "12px 24px",
                    "&:hover": {
                      backgroundColor: "#2563eb",
                    },
                  },
                  formFieldInput: {
                    borderRadius: "8px",
                    border: "1px solid #9ca3af",
                    padding: "12px 16px",
                    fontSize: "16px",
                    "&:focus": {
                      borderColor: "#3b82f6",
                      boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.1)",
                    },
                  },
                  socialButtonsBlockButton: {
                    borderRadius: "8px",
                    border: "1px solid #9ca3af",
                    padding: "12px 16px",
                    fontSize: "16px",
                    fontWeight: "500",
                    color: "#374151",
                    backgroundColor: "white",
                    "&:hover": {
                      backgroundColor: "#f9fafb",
                      color: "#111827",
                      borderColor: "#6b7280",
                    },
                  },
                  footer: {
                    display: "none",
                  },
                  footerAction: {
                    display: "none",
                  },
                  footerActionText: {
                    display: "none",
                  },
                  footerActionLink: {
                    display: "none",
                  },
                },
              }}
            />
          </div>
        </div>
      </main>

      {/* Minimal Footer */}
      <footer className="border-t border-gray-200 py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-3">
            <div className="flex items-center">
              <span className="text-slate-600 text-sm">&copy; 2025 Abhyas. All rights reserved.</span>
            </div>
            <div className="flex items-center">
              <a href="https://github.com/gloooomed/Abhyas" target="_blank" rel="noopener noreferrer" className="text-slate-600 hover:text-blue-600 transition-colors">
                <Github className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}