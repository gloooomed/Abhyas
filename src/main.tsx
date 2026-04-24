import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { ThemeProvider } from "./components/theme-provider";
import { LenisProvider } from "./components/lenis-provider";
import { Analytics } from "@vercel/analytics/react";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider defaultTheme="dark" storageKey="abhyas-theme">
      <LenisProvider>
        <App />
        <Analytics />
      </LenisProvider>
    </ThemeProvider>
  </StrictMode>
);
