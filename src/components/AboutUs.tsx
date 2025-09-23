import { Card, CardContent } from '@/components/ui/card'
import { Github, Users, Code, Heart, Linkedin } from "lucide-react";
import { UserButton, useAuth } from '@clerk/clerk-react'
import Navigation from './Navigation'

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
    <div className="min-h-screen">
      {/* Navigation */}
      <Navigation showUserButton={isSignedIn} userButtonComponent={<UserButton afterSignOutUrl="/" />} />

      {/* Hero Section */}
      <section className="section-hero relative">
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-4xl mx-auto">
            <div className="badge badge-primary mb-8 animate-fade-in-down">
              <Users className="h-4 w-4 mr-2" />
              <span>Meet Our Team</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-6 tracking-tight leading-tight animate-fade-in-up">
              The Minds Behind
              <span className="block gradient-text mt-2">
                Abhyas
              </span>
            </h1>
            
            <p className="text-xl text-slate-600 mb-12 max-w-3xl mx-auto leading-relaxed animate-fade-in-up">
              We're a passionate team of developers and designers united by our mission to transform career development through AI-powered innovation.
            </p>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="section section-alt">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Our Amazing Team</h2>
            <p className="text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Four talented individuals working together to build the future of career development
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {teamMembers.map((member, index) => (
              <Card key={index} className="card hover-lift border-0 bg-white text-center">
                <CardContent className="p-6 sm:p-8">
                  {/* Profile Image */}
                  <div className="mb-6 flex justify-center">
                    <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-blue-100 shadow-lg">
                      <img
                        src={member.profileImage}
                        alt={member.name}
                        className="w-full h-full object-cover object-center scale-110"
                        onError={(e) => {
                          e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=3b82f6&color=fff&size=96`
                        }}
                      />
                    </div>
                  </div>

                  {/* Member Info */}
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{member.name}</h3>
                  <p className="text-blue-600 font-medium mb-4">{member.role}</p>
                  <p className="text-slate-600 text-sm leading-relaxed mb-6">{member.bio}</p>

                  {/* Social Links */}
                  <div className="flex justify-center space-x-4">
                    <a
                      href={member.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 bg-gradient-to-br from-gray-500/20 to-gray-600/30 rounded-lg flex items-center justify-center border border-gray-200 text-gray-600 hover:bg-gray-600 hover:text-white transition-all hover-lift"
                    >
                      <Github className="h-5 w-5" />
                    </a>
                    <a
                      href={member.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 bg-gradient-to-br from-blue-500/20 to-blue-600/30 rounded-lg flex items-center justify-center border border-blue-200 text-blue-600 hover:bg-blue-600 hover:text-white transition-all hover-lift"
                    >
                      <Linkedin className="h-5 w-5" />
                    </a>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="section">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="card border-0 bg-white shadow-lg">
              <CardContent className="p-8 text-center">
                <div className="badge badge-primary mb-6">OUR MISSION</div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  Empowering Careers Through Innovation
                </h2>
                <p className="text-lg text-slate-600 mb-8 leading-relaxed max-w-3xl mx-auto">
                  At Abhyas, we believe that everyone deserves access to intelligent career guidance. 
                  Our team combines cutting-edge AI technology with deep understanding of professional 
                  development to create tools that truly make a difference.
                </p>
                
                <div className="flex flex-wrap justify-center gap-8 mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Code className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="text-left">
                      <h4 className="font-semibold text-gray-900 text-sm">Innovation First</h4>
                      <p className="text-slate-600 text-xs">Latest AI technologies</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <Users className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="text-left">
                      <h4 className="font-semibold text-gray-900 text-sm">User-Centric Design</h4>
                      <p className="text-slate-600 text-xs">Built for your success</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <Heart className="h-5 w-5 text-purple-600" />
                    </div>
                    <div className="text-left">
                      <h4 className="font-semibold text-gray-900 text-sm">Passion for Growth</h4>
                      <p className="text-slate-600 text-xs">Continuous improvement</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

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