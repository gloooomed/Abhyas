# Contributing to Abhyas

Thank you for your interest in contributing to Abhyas! We welcome contributions from everyone whether it's fixing bugs, improving documentation, or adding new features.

## Prerequisites

Before contributing, please ensure you have the following installed:

- **[Node.js](https://nodejs.org/)** (v18+ LTS recommended)
- **[Git](https://git-scm.com/)**
- **[Supabase Account](https://supabase.com/)** (Free tier)
- **[Groq API Key](https://console.groq.com/keys)** (Free tier works perfectly)

## Local Development Setup

1. **Fork and Clone the Repository**
   ```bash
   git clone https://github.com/gloooomed/Abhyas.git
   cd Abhyas
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Set Up Environment Variables**
   Create a `.env.local` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_GROQ_API_KEY=your_groq_api_key
   VITE_ELEVENLABS_API_KEY=your_elevenlabs_api_key
   ```

4. **Start the Development Server**
   ```bash
   npm run dev
   ```

## Contribution Workflow

1. **Create a branch** for your feature or fix:
   ```bash
   git checkout -b feat/your-feature-name
   ```
   Or for bug fixes:
   ```bash
   git checkout -b fix/your-bug-fix
   ```

2. **Make your changes**. Please adhere to the project's coding style (TypeScript strict, Tailwind CSS for styling).

3. **Test your changes**. Ensure that the app builds correctly (`npm run build`) and no existing functionality is broken.

4. **Commit your changes**. Use clear and descriptive commit messages:
   ```bash
   git commit -m "feat: add user history dashboard"
   ```

5. **Push to your fork**:
   ```bash
   git push origin feat/your-feature-name
   ```

6. **Open a Pull Request** against the `main` branch. Provide a clear description of what you have changed and why.

## Code Style & Guidelines

- **TypeScript**: We use strict TypeScript. Please avoid `any` types wherever possible.
- **Styling**: We use Tailwind CSS along with Shadcn UI primitives. Stick to existing class patterns for consistency.
- **Focus**: Keep Pull Requests focused on a single feature or bug fix.
- **Discussions**: For significant architecture changes or new features, please open an issue first to discuss it with the maintainers.

## Code of Conduct

Please note that this project is released with a [Contributor Code of Conduct](CODE_OF_CONDUCT.md). By participating in this project you agree to abide by its terms.
