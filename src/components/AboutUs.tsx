import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Github, Linkedin, Users, Heart, Code, Coffee } from 'lucide-react'
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
    role: "Full Stack Developer & Project Lead",
    bio: "Passionate about creating innovative solutions that bridge technology and career development. Leading the vision behind Abhyas.",
    github: "https://github.com/gloooomed",
    linkedin: "https://www.linkedin.com/in/gloooomed/",
    githubUsername: "gloooomed",
    profileImage: "https://github.com/gloooomed.png"
  },
  {
    name: "Anushka Choudhary",
    role: "Frontend Developer & UI/UX Designer",
    bio: "Dedicated to crafting beautiful and intuitive user experiences. Bringing creativity and functionality together in every design.",
    github: "https://github.com/nusshkaa",
    linkedin: "https://www.linkedin.com/in/anushka-choudhary-661553311/",
    githubUsername: "nusshkaa",
    profileImage: "https://github.com/nusshkaa.png"
  },
  {
    name: "Praphull Kumar",
    role: "Backend Developer & AI Integration Specialist",
    bio: "Expert in building robust backend systems and integrating AI technologies. Focused on creating scalable and intelligent solutions.",
    github: "https://github.com/praphulln19",
    linkedin: "https://www.linkedin.com/in/praphulln21/",
    githubUsername: "praphulln19",
    profileImage: "https://github.com/praphulln19.png"
  },
  {
    name: "Niraj Kumar Verma",
    role: "Full Stack Developer & DevOps Engineer",
    bio: "Passionate about end-to-end development and deployment pipelines. Ensuring our platform runs smoothly and efficiently.",
    github: "https://github.com/Nirajkrverma",
    linkedin: "https://www.linkedin.com/in/vnirajkr02/",
    githubUsername: "Nirajkrverma",
    profileImage: "https://github.com/Nirajkrverma.png"
  }
]

export default function AboutUs() {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <Navigation />

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
                <CardContent className="p-8">
                  {/* Profile Image */}
                  <div className="mb-6">
                    <img
                      src={member.profileImage}
                      alt={member.name}
                      className="w-24 h-24 rounded-full mx-auto border-4 border-blue-100 shadow-lg"
                      onError={(e) => {
                        e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=3b82f6&color=fff&size=96`
                      }}
                    />
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
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Side */}
            <div className="animate-fade-in-up">
              <div className="badge badge-primary mb-6">OUR MISSION</div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Empowering Careers Through Innovation
              </h2>
              <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                At Abhyas, we believe that everyone deserves access to intelligent career guidance. 
                Our team combines cutting-edge AI technology with deep understanding of professional 
                development to create tools that truly make a difference.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-1 mr-4">
                    <Code className="h-3 w-3 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Innovation First</h4>
                    <p className="text-slate-600 text-sm">Leveraging the latest AI technologies to solve real career challenges</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-1 mr-4">
                    <Users className="h-3 w-3 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">User-Centric Design</h4>
                    <p className="text-slate-600 text-sm">Every feature is designed with our users' success in mind</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center mt-1 mr-4">
                    <Heart className="h-3 w-3 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Passion for Growth</h4>
                    <p className="text-slate-600 text-sm">We're committed to continuous improvement and learning</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side */}
            <div className="animate-fade-in-up">
              <Card className="card border-0 bg-gradient-to-br from-blue-50 to-purple-50">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Coffee className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Built with Passion</h3>
                  <p className="text-slate-600 mb-6 leading-relaxed">
                    Every line of code, every design decision, and every feature is crafted with care 
                    to help professionals like you achieve their career goals.
                  </p>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold gradient-text">4</div>
                      <div className="text-sm text-slate-600">Team Members</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold gradient-text">∞</div>
                      <div className="text-sm text-slate-600">Possibilities</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-dark">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
              Ready to Transform Your Career?
            </h2>
            <p className="text-xl mb-12 text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Join thousands of professionals who trust Abhyas to accelerate their career growth 
              with AI-powered insights and guidance.
            </p>
            <div className="flex justify-center">
              <Button size="lg" className="btn-primary btn-xl hover-lift">
                Get Started Today
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Minimal Footer */}
      <footer className="border-t border-gray-200 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-slate-600 text-sm">&copy; 2025 Abhyas. All rights reserved.</span>
            </div>
            <div className="flex items-center gap-4">
              <a href="https://github.com/gloooomed" target="_blank" rel="noopener noreferrer" className="text-slate-600 hover:text-blue-600 transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="https://github.com/gloooomed" target="_blank" rel="noopener noreferrer" className="text-slate-600 hover:text-blue-600 transition-colors">
                <Github className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}