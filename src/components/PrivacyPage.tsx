import { Link } from 'react-router-dom'
import Navigation from './Navigation'
import Footer from './ui/Footer'
import { motion } from 'framer-motion'

const LAST_UPDATED = 'April 24, 2026'
const APP_NAME = 'Abhyas'
const CONTACT_EMAIL = 'abhisheksingh970824@gmail.com'

export default function PrivacyPage() {
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
              <h1 className="text-4xl md:text-5xl font-semibold tracking-tighter mb-4">Privacy Policy</h1>
              <p className="text-slate-500 dark:text-zinc-400 tracking-tight text-sm">
                Last updated: {LAST_UPDATED}
              </p>
            </div>

            {/* TL;DR Card */}
            <div className="sutera-card p-6 mb-12">
              <p className="text-xs font-semibold tracking-tight uppercase text-slate-400 dark:text-zinc-500 mb-3">TL;DR</p>
              <ul className="space-y-2 text-sm tracking-tight text-slate-700 dark:text-zinc-300">
                <li>✓ &nbsp;We only collect what's needed to run the app (your Google profile + your analysis history)</li>
                <li>✓ &nbsp;We never sell your data to anyone</li>
                <li>✓ &nbsp;Your resume and answers are processed by AI and not stored raw</li>
                <li>✓ &nbsp;You can request deletion of your data at any time</li>
                <li>✓ &nbsp;{APP_NAME} is open-source — you can inspect exactly what we do</li>
              </ul>
            </div>

            {/* Content */}
            <div className="space-y-10 text-sm leading-relaxed text-slate-700 dark:text-zinc-300 tracking-tight">

              <section>
                <h2 className="text-lg font-semibold text-black dark:text-white mb-3">1. Who We Are</h2>
                <p>
                  {APP_NAME} is a free, open-source AI career preparation platform. We offer tools for skills gap
                  analysis, mock interview simulation, and resume optimization. Our source code is publicly
                  available for inspection.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-black dark:text-white mb-3">2. Information We Collect</h2>
                <p className="mb-3">We collect the minimum data necessary to operate the service:</p>

                <div className="space-y-4">
                  <div className="sutera-card p-5">
                    <p className="font-medium text-black dark:text-white mb-1">Account Information</p>
                    <p className="text-slate-500 dark:text-zinc-400">
                      When you sign in with Google, we receive your name, email address, and profile picture from
                      Google. We store this in Supabase to associate your data with your account.
                    </p>
                  </div>

                  <div className="sutera-card p-5">
                    <p className="font-medium text-black dark:text-white mb-1">Activity Data</p>
                    <p className="text-slate-500 dark:text-zinc-400">
                      We store the results of your sessions — skills scan results, resume scores, and interview
                      session summaries — so you can access your history. We do not store your raw resume text or
                      full answer transcripts on our servers beyond the AI-generated analysis output.
                    </p>
                  </div>

                  <div className="sutera-card p-5">
                    <p className="font-medium text-black dark:text-white mb-1">Usage Information</p>
                    <p className="text-slate-500 dark:text-zinc-400">
                      Standard server logs (timestamps, errors) may be captured by our hosting infrastructure.
                      We do not use analytics tracking, advertising pixels, or fingerprinting.
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-black dark:text-white mb-3">3. How We Use Your Information</h2>
                <p className="mb-3">We use collected information solely to:</p>
                <ul className="list-disc list-inside space-y-1.5 pl-2">
                  <li>Authenticate you and maintain your session</li>
                  <li>Save and display your analysis history in the app</li>
                  <li>Prevent abuse (duplicate submissions, rate limiting)</li>
                  <li>Improve the platform (aggregate, non-personal usage patterns only)</li>
                </ul>
                <p className="mt-3">
                  We <strong>never</strong> use your data for advertising, profiling, or selling to third parties.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-black dark:text-white mb-3">4. AI Processing</h2>
                <p>
                  Content you submit (skills lists, resume text, interview answers) is sent to{' '}
                  <strong>Groq's AI API</strong> for processing. Groq may retain submitted data according to their
                  own{' '}
                  <a
                    href="https://groq.com/privacy-policy/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline underline-offset-2 hover:text-black dark:hover:text-white transition-colors"
                  >
                    privacy policy
                  </a>
                  . We recommend not submitting highly sensitive personal information. AI responses are processed
                  client-side first and only the structured result is saved to your history.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-black dark:text-white mb-3">5. Third-Party Services</h2>
                <p className="mb-4">We rely on the following third-party services to operate:</p>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-zinc-800">
                        <th className="text-left py-3 pr-6 font-semibold text-black dark:text-white">Service</th>
                        <th className="text-left py-3 pr-6 font-semibold text-black dark:text-white">Purpose</th>
                        <th className="text-left py-3 font-semibold text-black dark:text-white">Data Shared</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-zinc-900">
                      <tr>
                        <td className="py-3 pr-6 font-medium">Google OAuth</td>
                        <td className="py-3 pr-6 text-slate-500 dark:text-zinc-400">Authentication</td>
                        <td className="py-3 text-slate-500 dark:text-zinc-400">Name, email, avatar</td>
                      </tr>
                      <tr>
                        <td className="py-3 pr-6 font-medium">Supabase</td>
                        <td className="py-3 pr-6 text-slate-500 dark:text-zinc-400">Database & auth session</td>
                        <td className="py-3 text-slate-500 dark:text-zinc-400">Account info + analysis results</td>
                      </tr>
                      <tr>
                        <td className="py-3 pr-6 font-medium">Groq</td>
                        <td className="py-3 pr-6 text-slate-500 dark:text-zinc-400">AI inference</td>
                        <td className="py-3 text-slate-500 dark:text-zinc-400">Submitted text for analysis</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-black dark:text-white mb-3">6. Data Retention</h2>
                <p>
                  Your account data and analysis history are retained as long as your account is active.
                  Session-scoped in-memory data (AI cache) is discarded when you close the browser tab.
                  You can request deletion of all your data at any time — see Section 8.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-black dark:text-white mb-3">7. Cookies & Local Storage</h2>
                <p>
                  {APP_NAME} uses browser <strong>localStorage</strong> only to persist your theme preference
                  (light/dark) and rate-limit state between sessions. We do not use cookies for tracking or
                  advertising. Supabase may set a session cookie to maintain your login.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-black dark:text-white mb-3">8. Your Rights & Data Deletion</h2>
                <p className="mb-3">You have the right to:</p>
                <ul className="list-disc list-inside space-y-1.5 pl-2">
                  <li><strong>Access</strong> — request a copy of the data we hold about you</li>
                  <li><strong>Correction</strong> — update inaccurate information</li>
                  <li><strong>Deletion</strong> — request complete removal of your account and data</li>
                  <li><strong>Portability</strong> — receive your data in a machine-readable format</li>
                </ul>
                <p className="mt-3">
                  To exercise any of these rights, email us at{' '}
                  <a href={`mailto:${CONTACT_EMAIL}`} className="underline underline-offset-2 hover:text-black dark:hover:text-white transition-colors">
                    {CONTACT_EMAIL}
                  </a>
                  . We will respond within 30 days.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-black dark:text-white mb-3">9. Children's Privacy</h2>
                <p>
                  {APP_NAME} is not directed at children under 13. We do not knowingly collect personal information
                  from children under 13. If you believe a child has provided us personal information, please
                  contact us and we will delete it promptly.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-black dark:text-white mb-3">10. Changes to This Policy</h2>
                <p>
                  We may update this Privacy Policy from time to time. We will update the "Last updated" date at
                  the top of this page when we do. For significant changes, we will provide a more prominent notice.
                  Continued use of {APP_NAME} after changes constitutes your acceptance of the revised policy.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-black dark:text-white mb-3">11. Contact</h2>
                <p>
                  Questions or concerns about this Privacy Policy? Contact us at{' '}
                  <a href={`mailto:${CONTACT_EMAIL}`} className="underline underline-offset-2 hover:text-black dark:hover:text-white transition-colors">
                    {CONTACT_EMAIL}
                  </a>.
                </p>
              </section>

              <div className="pt-8 border-t border-slate-200 dark:border-zinc-800">
                <p className="text-slate-400 dark:text-zinc-600 text-xs">
                  See also:{' '}
                  <Link to="/terms" className="underline underline-offset-2 hover:text-black dark:hover:text-white transition-colors">
                    Terms of Service
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
