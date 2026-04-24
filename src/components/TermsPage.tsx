import { Link } from 'react-router-dom'
import Navigation from './Navigation'
import Footer from './ui/Footer'
import { motion } from 'framer-motion'

const LAST_UPDATED = 'April 24, 2026'
const APP_NAME = 'Abhyas'
const CONTACT_EMAIL = 'abhisheksingh970824@gmail.com'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white flex flex-col transition-colors duration-300">
      <Navigation />

      <main className="flex-1 pt-28 pb-24 px-4">
        <div className="container mx-auto max-w-3xl">
          <motion.div
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Header */}
            <div className="mb-12">
              <p className="text-xs text-slate-400 dark:text-zinc-500 tracking-tight uppercase mb-3">Legal</p>
              <h1 className="text-4xl md:text-5xl font-semibold tracking-tighter mb-4">Terms of Service</h1>
              <p className="text-slate-500 dark:text-zinc-400 tracking-tight text-sm">
                Last updated: {LAST_UPDATED}
              </p>
            </div>

            {/* Content */}
            <div className="space-y-10 text-sm leading-relaxed text-slate-700 dark:text-zinc-300 tracking-tight">

              <section>
                <h2 className="text-lg font-semibold text-black dark:text-white mb-3">1. About {APP_NAME}</h2>
                <p>
                  {APP_NAME} is a free, open-source AI-powered career preparation platform. It provides tools for
                  skills gap analysis, mock interview practice, and resume optimization. The source code is publicly
                  available and the platform is provided free of charge.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-black dark:text-white mb-3">2. Acceptance of Terms</h2>
                <p>
                  By accessing or using {APP_NAME}, you agree to be bound by these Terms of Service. If you do not
                  agree, please do not use the platform. These terms apply to all visitors, users, and others who
                  access the service.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-black dark:text-white mb-3">3. Use of the Service</h2>
                <p className="mb-3">You agree to use {APP_NAME} only for lawful purposes. You must not:</p>
                <ul className="list-disc list-inside space-y-1.5 pl-2">
                  <li>Attempt to disrupt, overload, or abuse the platform or its underlying services</li>
                  <li>Attempt to reverse-engineer, scrape, or extract AI responses at scale</li>
                  <li>Use the platform to generate or distribute harmful, misleading, or illegal content</li>
                  <li>Misrepresent your identity or impersonate any person or organization</li>
                  <li>Use automated bots or scripts to abuse the API or consume resources unfairly</li>
                </ul>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-black dark:text-white mb-3">4. AI-Generated Content</h2>
                <p className="mb-3">
                  {APP_NAME} uses AI to generate career advice, interview feedback, and resume suggestions. By using
                  these features you acknowledge that:
                </p>
                <ul className="list-disc list-inside space-y-1.5 pl-2">
                  <li>AI-generated content is for informational and practice purposes only</li>
                  <li>It does not constitute professional career, legal, or financial advice</li>
                  <li>Results may be inaccurate, incomplete, or outdated</li>
                  <li>You are solely responsible for decisions made based on this content</li>
                </ul>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-black dark:text-white mb-3">5. User Accounts</h2>
                <p>
                  {APP_NAME} uses Google OAuth for authentication. You are responsible for maintaining the security
                  of your Google account. We do not store your password. You may delete your {APP_NAME} account and
                  associated data at any time by contacting us at{' '}
                  <a href={`mailto:${CONTACT_EMAIL}`} className="underline underline-offset-2 hover:text-black dark:hover:text-white transition-colors">
                    {CONTACT_EMAIL}
                  </a>.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-black dark:text-white mb-3">6. Intellectual Property</h2>
                <p>
                  {APP_NAME} is open-source software. The codebase is available under its respective open-source
                  license. You retain all rights to the content you input (your resume text, skills, answers).
                  You grant us a limited, non-exclusive license to process that content solely to provide the
                  service to you.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-black dark:text-white mb-3">7. Third-Party Services</h2>
                <p>
                  {APP_NAME} integrates with third-party services including Google OAuth, Supabase (database
                  hosting), and Groq (AI inference). Your use of these services is governed by their respective
                  privacy policies and terms. We are not responsible for the practices of these third parties.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-black dark:text-white mb-3">8. Disclaimers & Limitation of Liability</h2>
                <p className="mb-3">
                  {APP_NAME} is provided <strong>"as is"</strong> without warranties of any kind, either express or
                  implied. We do not guarantee that the service will be uninterrupted, error-free, or free of
                  harmful components.
                </p>
                <p>
                  To the fullest extent permitted by applicable law, {APP_NAME} and its contributors shall not be
                  liable for any indirect, incidental, special, consequential, or punitive damages arising from your
                  use of, or inability to use, the service.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-black dark:text-white mb-3">9. Modifications</h2>
                <p>
                  We reserve the right to update these terms at any time. We will indicate the date of the last
                  update at the top of this page. Continued use of the service after changes constitutes acceptance
                  of the revised terms.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-black dark:text-white mb-3">10. Contact</h2>
                <p>
                  Questions about these terms? Reach us at{' '}
                  <a href={`mailto:${CONTACT_EMAIL}`} className="underline underline-offset-2 hover:text-black dark:hover:text-white transition-colors">
                    {CONTACT_EMAIL}
                  </a>.
                </p>
              </section>

              <div className="pt-8 border-t border-slate-200 dark:border-zinc-800">
                <p className="text-slate-400 dark:text-zinc-600 text-xs">
                  See also:{' '}
                  <Link to="/privacy" className="underline underline-offset-2 hover:text-black dark:hover:text-white transition-colors">
                    Privacy Policy
                  </Link>
                </p>
              </div>

            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
