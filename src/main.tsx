import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { ClerkProvider } from "@clerk/clerk-react";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Clerk Publishable Key. Please add VITE_CLERK_PUBLISHABLE_KEY to your .env.local file.");
}

const clerkAppearance = {
  layout: {
    socialButtonsVariant: "iconButton" as const,
    socialButtonsPlacement: "top" as const,
  },
  elements: {
    formButtonPrimary: {
      backgroundColor: "#3b5998",
      borderRadius: "0.75rem",
      border: "none",
      fontSize: "0.875rem",
      fontWeight: "600",
      padding: "0.75rem 2rem",
      fontFamily: "'Poppins', sans-serif",
      letterSpacing: "0.025em",
      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      "&:hover": {
        backgroundColor: "#2d4373",
        transform: "translateY(-2px)",
        boxShadow: "0 8px 25px rgba(59, 89, 152, 0.5)",
      },
      "&:focus": {
        backgroundColor: "#2d4373",
        boxShadow: "0 0 0 3px rgba(59, 89, 152, 0.3)",
      },
    },
    card: {
      backgroundColor: "#ffffff",
      borderRadius: "1rem",
      border: "1px solid #e2e8f0",
      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
      padding: "2rem",
    },
    headerTitle: {
      fontFamily: "'Poppins', sans-serif",
      fontSize: "1.875rem",
      fontWeight: "700",
      color: "#1a202c",
      textAlign: "center",
      marginBottom: "0.5rem",
    },
    headerSubtitle: {
      fontFamily: "'Inter', sans-serif",
      fontSize: "0.875rem",
      color: "#4a5568",
      textAlign: "center",
      marginBottom: "1.5rem",
    },
    socialButtonsBlockButton: {
      backgroundColor: "#ffffff",
      border: "1px solid #e2e8f0",
      borderRadius: "0.75rem",
      fontFamily: "'Inter', sans-serif",
      fontWeight: "500",
      padding: "0.75rem 1rem",
      fontSize: "0.875rem",
      transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
      "&:hover": {
        backgroundColor: "#f8fafc",
        borderColor: "#3b5998",
        transform: "translateY(-1px)",
      },
    },
    formFieldInput: {
      backgroundColor: "#ffffff",
      border: "1px solid #d1d5db",
      borderRadius: "0.75rem",
      fontFamily: "'Inter', sans-serif",
      fontSize: "0.875rem",
      padding: "0.75rem 1rem",
      transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
      "&:focus": {
        borderColor: "#3b5998",
        boxShadow: "0 0 0 3px rgba(59, 89, 152, 0.1)",
        outline: "none",
      },
    },
    formFieldLabel: {
      fontFamily: "'Inter', sans-serif",
      fontSize: "0.875rem",
      fontWeight: "500",
      color: "#374151",
      marginBottom: "0.5rem",
    },
    footerActionLink: {
      color: "#3b5998",
      fontFamily: "'Inter', sans-serif",
      fontWeight: "500",
      textDecoration: "none",
      "&:hover": {
        color: "#2d4373",
        textDecoration: "underline",
      },
    },
    dividerLine: {
      backgroundColor: "#e5e7eb",
      height: "1px",
      margin: "1.5rem 0",
    },
    dividerText: {
      fontFamily: "'Inter', sans-serif",
      fontSize: "0.875rem",
      color: "#6b7280",
      backgroundColor: "#ffffff",
      padding: "0 1rem",
    },
    identityPreviewText: {
      fontFamily: "'Inter', sans-serif",
      fontSize: "0.875rem",
    },
    identityPreviewEditButton: {
      color: "#3b5998",
      fontFamily: "'Inter', sans-serif",
      fontWeight: "500",
    },
  },
  variables: {
    colorPrimary: "#3b5998",
    colorBackground: "#ffffff",
    colorInputBackground: "#ffffff",
    colorInputText: "#1f2937",
    colorText: "#1f2937",
    colorTextSecondary: "#4a5568",
    colorTextOnPrimaryBackground: "#ffffff",
    colorDanger: "#e74c3c",
    colorSuccess: "#22c55e",
    colorWarning: "#f59e0b",
    colorNeutral: "#6b7280",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    fontSize: "0.875rem",
    borderRadius: "0.75rem",
    spacingUnit: "1rem",
  },
};

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ClerkProvider 
      publishableKey={PUBLISHABLE_KEY} 
      afterSignOutUrl="/"
      appearance={clerkAppearance}
    >
      <App />
    </ClerkProvider>
  </StrictMode>
);
