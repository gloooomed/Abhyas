import { Card, CardContent } from '@/components/ui/card'
import { Github, Users, Code, Heart, Linkedin } from "lucide-react";
import { UserButton, useAuth } from '@clerk/clerk-react'
import Navigation from './Navigation'
import Footer from './ui/Footer'
import { motion } from 'framer-motion'

interface TeamMember {
  name: string
  role: string
  bio: string
  github: string
  linkedin: string
  githubUsername: string
  profileImage: string
}

const teamMembers: TeamMember[] = [
  {
    name: "Abhishek Kumar",
    role: "Project Lead",
    bio: "Passionate about creating innovative solutions that bridge technology and career development. Leading the vision behind Abhyas.",
    github: "https://github.com/gloooomed",
    linkedin: "https://www.linkedin.com/in/gloooomed/",
    githubUsername: "gloooomed",
    profileImage: "https://github.com/gloooomed.png"
  },
  {
    name: "Anushka Choudhary",
    role: "Full Stack Developer",
    bio: "Dedicated to building scalable and efficient applications. Bringing functionality and seamless user experience together across frontend and backend.",
    github: "https://github.com/nusshkaa",
    linkedin: "https://www.linkedin.com/in/anushka-choudhary-661553311/",
    githubUsername: "nusshkaa",
    profileImage: "https://github.com/nusshkaa.png"
  },
  {
    name: "Praphull Kumar",
    role: "Backend Developer",
    bio: "Expert in building robust backend systems and integrating AI technologies. Focused on creating scalable and intelligent solutions.",
    github: "https://github.com/praphulln19",
    linkedin: "https://www.linkedin.com/in/praphulln21/",
    githubUsername: "praphulln19",
    profileImage: "https://github.com/praphulln19.png"
  },
  {
    name: "Niraj Kumar Verma",
    role: "Database Engineer",
    bio: "Passionate about designing, optimizing, and managing databases.",
    github: "https://github.com/Nirajkrverma",
    linkedin: "https://www.linkedin.com/in/vnirajkr02/",
    githubUsername: "Nirajkrverma",
    profileImage: "https://github.com/Nirajkrverma.png"
  }
]

export default function AboutUs() {
  const { isSignedIn } = useAuth()

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black text-black dark:text-white flex flex-col transition-colors duration-300">
      {/* Navigation */}
      <Navigation showUserButton={isSignedIn} userButtonComponent={<UserButton afterSignOutUrl="/" />} />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="pt-32 pb-16 px-4">
          <div className="container mx-auto max-w-7xl text-center">
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="max-w-4xl mx-auto"
            >
              <div className="inline-flex items-center space-x-2 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 px-4 py-1.5 rounded-full mb-8">
                <Users className="h-4 w-4" />
                <span className="text-sm font-medium tracking-tight">Meet Our Team</span>
              </div>
              
              <h1 className="text-5xl md:text-7xl font-semibold tracking-tighter mb-6 leading-tight">
                The Minds Behind <br /> Abhyas.
              </h1>
              
              <p className="text-xl text-slate-500 dark:text-zinc-400 max-w-2xl mx-auto font-medium tracking-tight leading-relaxed">
                We're a passionate team of developers and designers united by our mission to transform career development through AI-powered innovation.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-24 px-4">
          <div className="container mx-auto max-w-7xl">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {teamMembers.map((member, index) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                >
                  <Card className="sutera-card h-full p-8 border-0 text-center flex flex-col">
                    <CardContent className="p-0 flex flex-col items-center flex-grow">
                      {/* Profile Image */}
                      <div className="w-24 h-24 rounded-full overflow-hidden mb-6 mt-4 shadow-xl shadow-black/5 dark:shadow-white/5">
                        <img
                          src={member.profileImage}
                          alt={member.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=000&color=fff&size=96`
                          }}
                        />
                      </div>

                      {/* Member Info */}
                      <h3 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-white mb-2">{member.name}</h3>
                      <p className="text-sm font-medium tracking-wide string uppercase text-slate-500 dark:text-zinc-400 mb-6">{member.role}</p>
                      <p className="text-slate-500 dark:text-zinc-400 text-sm leading-relaxed mb-6 tracking-tight flex-grow">{member.bio}</p>

                      {/* Social Links */}
                      <div className="flex justify-center space-x-3 mt-auto">
                        <a
                          href={member.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-10 h-10 bg-slate-100 dark:bg-zinc-900 rounded-full flex items-center justify-center text-slate-600 dark:text-zinc-400 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all"
                        >
                          <Github className="h-5 w-5" />
                        </a>
                        <a
                          href={member.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-10 h-10 bg-slate-100 dark:bg-zinc-900 rounded-full flex items-center justify-center text-slate-600 dark:text-zinc-400 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all"
                        >
                          <Linkedin className="h-5 w-5" />
                        </a>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-24 px-4 bg-slate-100 dark:bg-zinc-950/50">
          <div className="container mx-auto max-w-7xl">
            <div className="max-w-4xl mx-auto">
              <Card className="sutera-card border-0">
                <CardContent className="p-12 text-center">
                  <div className="inline-block text-xs font-bold tracking-widest uppercase text-slate-400 dark:text-zinc-500 mb-6">Our Mission</div>
                  <h2 className="text-3xl md:text-5xl font-semibold tracking-tighter mb-8 leading-tight">
                    Empowering Careers Through Intelligence
                  </h2>
                  <p className="text-lg text-slate-500 dark:text-zinc-400 mb-12 leading-relaxed max-w-3xl mx-auto tracking-tight">
                    At Abhyas, we believe that everyone deserves access to intelligent career guidance. 
                    Our team combines cutting-edge AI technology with deep understanding of professional 
                    development to create tools that truly make a difference.
                  </p>
                  
                  <div className="grid sm:grid-cols-3 gap-8 text-left mt-8">
                    <div className="flex flex-col items-center text-center">
                      <div className="w-12 h-12 bg-black dark:bg-white rounded-2xl flex items-center justify-center mb-6">
                        <Code className="h-6 w-6 text-white dark:text-black" />
                      </div>
                      <h4 className="font-semibold text-lg tracking-tight mb-2">Innovation First</h4>
                      <p className="text-slate-500 dark:text-zinc-400 text-sm tracking-tight text-center">Neural models generating exact analysis loops.</p>
                    </div>
                    
                    <div className="flex flex-col items-center text-center">
                      <div className="w-12 h-12 bg-black dark:bg-white rounded-2xl flex items-center justify-center mb-6">
                        <Users className="h-6 w-6 text-white dark:text-black" />
                      </div>
                      <h4 className="font-semibold text-lg tracking-tight mb-2">User-Centric</h4>
                      <p className="text-slate-500 dark:text-zinc-400 text-sm tracking-tight text-center">Precision engineered exactly for your success.</p>
                    </div>
                    
                    <div className="flex flex-col items-center text-center">
                      <div className="w-12 h-12 bg-black dark:bg-white rounded-2xl flex items-center justify-center mb-6">
                        <Heart className="h-6 w-6 text-white dark:text-black" />
                      </div>
                      <h4 className="font-semibold text-lg tracking-tight mb-2">Passion Driven</h4>
                      <p className="text-slate-500 dark:text-zinc-400 text-sm tracking-tight text-center">A deep love for design, code, and perfection.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}