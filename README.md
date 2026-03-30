<p align="center">
  <img src="src/assets/abhyas-logo.gif" alt="Abhyas Logo" width="96" height="96" style="border-radius: 12px;" />
</p>

<h1 align="center">Abhyas</h1>

<p align="center">
  AI-powered career preparation. Close skill gaps, ace interviews, and get your resume noticed.
</p>

<p align="center">
  <a href="https://github.com/gloooomed/Abhyas/issues/new?labels=bug">Report Bug</a>
  ·
  <a href="https://github.com/gloooomed/Abhyas/issues/new?labels=enhancement">Request Feature</a>
</p>

<p align="center">
  <a href="https://github.com/gloooomed/Abhyas/stargazers">
    <img src="https://img.shields.io/github/stars/gloooomed/Abhyas?style=for-the-badge&labelColor=1a1a2e&color=4f8ef7&label=STARS" alt="Stars" />
  </a>
  <a href="https://github.com/gloooomed/Abhyas/forks">
    <img src="https://img.shields.io/github/forks/gloooomed/Abhyas?style=for-the-badge&labelColor=1a1a2e&color=4f8ef7&label=FORKS" alt="Forks" />
  </a>
  <a href="LICENSE">
    <img src="https://img.shields.io/badge/LICENSE-MIT-brightgreen?style=for-the-badge&labelColor=1a1a2e" alt="License" />
  </a>
  <a href="https://abhyas-lac.vercel.app">
    <img src="https://img.shields.io/badge/LIVE-PAGE-blueviolet?style=for-the-badge&labelColor=1a1a2e" alt="Live Page" />
  </a>
</p>

---

## What it does

- **Skills Gap Analysis** - Tell it your current skills and target role. It maps exactly what you're missing and what to learn first.
- **AI Mock Interviews** - Practice with an AI that asks real questions, evaluates your answers, and gives honest feedback.
- **Resume Optimizer** - Paste your resume and a job description. Get rewritten copy, stronger keywords, and ATS-ready formatting.

---

## Tech Stack

| Category | Technology |
|---|---|
| Frontend | [![React](https://img.shields.io/badge/React_19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev) [![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org) |
| Build | [![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev) |
| Styling | [![TailwindCSS](https://img.shields.io/badge/TailwindCSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com) |
| Auth | [![Clerk](https://img.shields.io/badge/Clerk-6C47FF?style=for-the-badge&logo=clerk&logoColor=white)](https://clerk.com) |
| AI | [![Gemini AI](https://img.shields.io/badge/Gemini_AI-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://deepmind.google/technologies/gemini) |
| Animations | [![Framer Motion](https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white)](https://www.framer.com/motion) |

---

## Getting Started

```bash
git clone https://github.com/gloooomed/Abhyas.git
cd Abhyas
npm install
```

Create a `.env.local` file:

```env
VITE_GEMINI_API_KEY=your_key_here
VITE_CLERK_PUBLISHABLE_KEY=your_key_here
```

```bash
npm run dev
```

---

## Project Structure

```
Abhyas/
├── src/
│   ├── assets/
│   │   └── abhyas-logo.gif        # Animated app logo
│   ├── components/
│   │   ├── ui/                    # Shared shadcn/ui primitives
│   │   ├── LandingPage.tsx        # Marketing / hero page
│   │   ├── Dashboard.tsx          # Post-login home
│   │   ├── SkillsGapAnalysis.tsx  # Skills gap feature
│   │   ├── MockInterview.tsx      # AI interview feature
│   │   ├── ResumeOptimizer.tsx    # Resume rewrite feature
│   │   ├── Navigation.tsx         # Top nav bar
│   │   ├── Logo.tsx               # Logo component (GIF + text)
│   │   ├── SignInPage.tsx         # Custom sign-in page
│   │   ├── SignUpPage.tsx         # Custom sign-up page
│   │   ├── AboutUs.tsx            # About page
│   │   ├── QuotaHelper.tsx        # API quota UI helper
│   │   ├── theme-provider.tsx     # Dark/light mode context
│   │   ├── theme-toggle.tsx       # Theme toggle button
│   │   └── lenis-provider.tsx     # Smooth scroll provider
│   ├── hooks/
│   │   ├── useApiCache.ts         # In-memory + localStorage cache
│   │   ├── useDebounce.ts         # Input debounce hook
│   │   ├── useLocalStorage.ts     # Persistent local state
│   │   ├── useRequireAuth.ts      # Auth guard hook
│   │   └── index.ts               # Hook barrel exports
│   ├── lib/
│   │   ├── gemini.ts              # Gemini AI client & prompts
│   │   ├── speech.ts              # Web Speech API wrapper
│   │   ├── cache.ts               # Cache utilities
│   │   └── utils.ts               # Shared helpers (cn, etc.)
│   ├── App.tsx                    # Routes & layout shell
│   ├── main.tsx                   # Entry point + providers
│   └── index.css                  # Global styles & design tokens
├── public/                        # Static assets
├── .env.local                     # Local environment variables (not committed)
├── .env.example                   # Environment variable template
├── index.html                     # Vite HTML entry
├── vite.config.ts
├── tailwind.config.js
└── package.json
```

---

## Contributing

### Prerequisites

Make sure you have the following before contributing:

| Requirement | Version | Notes |
|---|---|---|
| [Node.js](https://nodejs.org/) | v18+ | LTS recommended |
| [Git](https://git-scm.com/) | Any recent | For version control |
| [Gemini API Key](https://aistudio.google.com/app/apikey) | - | Free tier works fine |
| [Clerk Account](https://clerk.com/) | - | Free plan is sufficient |

Set up your local environment using the steps in [Getting Started](#getting-started) above.

### Steps

Contributions are welcome! Here's how to get involved:

1. **Fork** the repository
2. **Create a branch** for your feature or fix:
   ```bash
   git checkout -b feat/your-feature-name
   ```
3. **Make your changes** and commit with a clear message:
   ```bash
   git commit -m "feat: add your feature description"
   ```
4. **Push** to your fork:
   ```bash
   git push origin feat/your-feature-name
   ```
5. **Open a Pull Request** against `main` and describe what you changed and why.

### Guidelines

- Keep PRs focused - one feature or fix per PR.
- Follow the existing code style (TypeScript strict, Tailwind classes, Framer Motion for animations).
- Don't commit `.env.local` or any API keys.
- For larger changes, open an issue first to discuss the approach.

---

## License

MIT with Commons Clause - free for personal and educational use. Commercial use not permitted without permission. See [LICENSE](LICENSE) for details.

---

<p align="center">
  <em>Abhyas (अभ्यास) means "practice" in Sanskrit.</em>
</p>
