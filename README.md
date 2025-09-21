# 🚀 Abhyas - AI-Powered Interview Preparation Platform

**Master Your Interviews with Advanced AI Technology**

Abhyas is a cutting-edge AI-powered interview preparation platform that transforms how professionals practice interviews, optimize resumes, and identify skill gaps. Built with modern React, TypeScript, and powered by Google's Gemini AI.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Visit%20Site-brightgreen.svg)](https://abhyas-lac.vercel.app)
![Built with React](https://img.shields.io/badge/React-19-blue.svg)
![Powered by AI](https://img.shields.io/badge/AI-Gemini-green.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue.svg)
![Vite](https://img.shields.io/badge/Vite-7.1-purple.svg)

## ✨ Core Features

### 🎤 **AI Mock Interview**
- **Intelligent Question Generation**: Role-specific questions powered by Google Gemini AI
- **Real-Time Evaluation**: Instant feedback with detailed scoring and improvement suggestions
- **Voice & Text Support**: Practice with speech recognition or traditional text input
- **Adaptive Follow-ups**: Dynamic questions based on your responses
- **Performance Analytics**: Comprehensive feedback on communication skills, technical knowledge, and areas for improvement

### 📄 **Resume Optimizer**
- **AI-Powered Analysis**: Advanced resume evaluation using machine learning algorithms
- **ATS Compatibility**: Ensure your resume passes Applicant Tracking Systems
- **Content Enhancement**: Improve language, structure, and impact with actionable suggestions
- **Role-Specific Optimization**: Tailored recommendations for your target position
- **Instant Results**: Get optimization suggestions in seconds

### 🎯 **Skills Gap Analysis**
- **Personalized Assessment**: AI-driven analysis of your current skills vs. market demands
- **Learning Roadmaps**: Custom development paths with resource recommendations
- **Industry Insights**: Market trends and in-demand skills for your field
- **Progress Tracking**: Monitor your skill development journey
- **Career Guidance**: Strategic advice for career advancement

### 🎨 **Modern User Experience**
- **Responsive Design**: Seamless experience across desktop, tablet, and mobile devices
- **Intuitive Interface**: Clean, professional design optimized for productivity
- **Real-time Updates**: Instant feedback and dynamic content loading
- **Accessibility First**: WCAG compliant for inclusive user experience

## 🛠️ Technology Stack

### **Frontend Architecture**
- **React 19** - Latest React with concurrent features and improved performance
- **TypeScript** - Full type safety for robust development
- **Vite 7** - Lightning-fast build tool with hot module replacement
- **Modern CSS** - Custom design system with gradient animations and responsive layouts
- **Lucide React** - Beautiful, consistent icon library

### **AI & APIs**
- **Google Gemini AI** - Advanced language model for intelligent responses and analysis
- **Web Speech API** - Browser-native voice recognition and synthesis
- **ElevenLabs** - Premium text-to-speech for enhanced voice interaction (optional)

### **Development & Deployment**
- **ESLint** - Code quality and consistency enforcement
- **Vercel** - Serverless deployment with global CDN
- **Git** - Version control with automated deployments
- **GitHub** - Repository hosting and collaboration

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Modern web browser (Chrome/Firefox recommended for voice features)
- Google Gemini API key

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/gloooomed/Abhyas.git
   cd Abhyas
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   ```bash
   cp .env.example .env.local
   ```
   
   Add your API keys to `.env.local`:
   ```bash
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   VITE_ELEVENLABS_API_KEY=your_elevenlabs_api_key_here # Optional
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   ```
   http://localhost:5174
   ```

## 🎯 How to Use

### **Mock Interview Practice**
1. Navigate to "Mock Interview" from the dashboard
2. Configure your interview settings:
   - Target role (e.g., Software Engineer, Product Manager)
   - Experience level (Entry, Mid, Senior)
   - Interview difficulty
3. Choose your interaction mode (text or voice)
4. Practice with AI-generated questions and receive instant feedback

### **Resume Optimization**
1. Go to "Resume Optimizer"
2. Upload your resume file or paste your resume text
3. Optionally specify your target role for personalized suggestions
4. Review AI-powered recommendations for improvement
5. Download or copy the optimized version

### **Skills Gap Analysis**
1. Visit "Skills Gap Analysis"
2. Enter your current skills (comma-separated)
3. Specify your target role and desired industry
4. Get personalized learning recommendations and skill development roadmap

## 🏗️ Project Structure

```
src/
├── components/              # React components
│   ├── ui/                 # Reusable UI components
│   │   ├── button.tsx     # Custom button component
│   │   └── card.tsx       # Card layout component
│   ├── Dashboard.tsx       # Main application dashboard
│   ├── LandingPage.tsx     # Homepage and hero section
│   ├── MockInterview.tsx   # AI interview practice tool
│   ├── ResumeOptimizer.tsx # Resume analysis and optimization
│   ├── SkillsGapAnalysis.tsx # Skills assessment and recommendations
│   ├── Logo.tsx           # Brand logo component
│   └── HeroLogo.tsx       # Landing page logo with animations
├── lib/                    # Utility libraries and services
│   ├── gemini.ts          # Google Gemini AI integration
│   ├── speech.ts          # Speech recognition and synthesis
│   └── utils.ts           # Helper functions and utilities
├── assets/                 # Static assets
│   └── Logo.jpg           # Brand logo image
├── App.tsx                 # Main app component and routing
├── main.tsx               # Application entry point
└── index.css              # Global styles and design system
```

## 🚀 Deployment

### **Live Application**
🌐 **[abhyas-lac.vercel.app](https://abhyas-lac.vercel.app)**

### **Deploy Your Own**
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/gloooomed/Abhyas)

### **Manual Deployment Steps**
1. **Fork this repository** to your GitHub account
2. **Connect to Vercel**:
   - Visit [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Configure environment variables
3. **Set Environment Variables**:
   ```bash
   VITE_GEMINI_API_KEY=your_gemini_api_key
   VITE_ELEVENLABS_API_KEY=your_elevenlabs_api_key # Optional
   ```
4. **Deploy** - Vercel will automatically build and deploy your application

### **Other Deployment Options**
- **Netlify**: Connect GitHub repository and deploy
- **Railway**: Full-stack deployment with database support
- **AWS/Azure**: Enterprise cloud deployment options

## 🎨 Design & Performance

- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Modern UI**: Clean interface with gradient animations
- **Fast Loading**: Optimized React build with Vite
- **Voice Support**: Browser-native speech recognition and synthesis
- **AI-Powered**: Real-time responses using Google Gemini

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### **How to Contribute**
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🗺️ Roadmap

### **Current Features** ✅
- [x] AI-powered mock interviews with voice support
- [x] Resume optimization with detailed feedback
- [x] Skills gap analysis and recommendations
- [x] Responsive design for all devices
- [x] Professional UI with gradient animations

### **Upcoming Features** �
- [ ] User authentication and profile management
- [ ] Interview performance tracking and analytics
- [ ] Industry-specific interview question sets
- [ ] Video interview practice mode
- [ ] Career path visualization tools

### **Future Vision** 🔮
- [ ] Multi-language support
- [ ] Integration with job boards and ATS systems
- [ ] Team and enterprise features
- [ ] Advanced AI coaching and mentorship
- [ ] Mobile app for iOS and Android

## 🔧 Environment Setup

### **Required API Keys**
```bash
# Google Gemini AI (Required)
VITE_GEMINI_API_KEY=your_gemini_api_key_here

# ElevenLabs TTS (Optional - enhances voice quality)  
VITE_ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
```

### **Getting API Keys**
1. **Google Gemini AI**: Visit [Google AI Studio](https://makersuite.google.com/) to get your API key
2. **ElevenLabs** (Optional): Sign up at [ElevenLabs](https://elevenlabs.io/) for premium voice features

## 📊 Performance

- ⚡ **Fast Loading**: Optimized React build with Vite
- 📱 **Mobile Responsive**: Works on all devices
- 🌍 **Global CDN**: Deployed on Vercel's edge network
- 🎯 **AI-Powered**: Real-time responses using Google Gemini

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## 🙋‍♀️ Support & Contact

### **Getting Help**
- � **Bug Reports**: [GitHub Issues](https://github.com/gloooomed/Abhyas/issues)
- � **Feature Requests**: [GitHub Discussions](https://github.com/gloooomed/Abhyas/discussions)
- 📧 **Email Support**: abhisheksingh970824@gmail.com
- 🔗 **LinkedIn**: Connect with the developer

### **Stay Updated**
- ⭐ **Star this repository** to show your support
- � **Watch** for updates and new releases
- � **Fork** to create your own version
- � **Share** with your network

---

<div align="center">

**Built with ❤️ [gloooomed](https://github.com/gloooomed)**

*Abhyas (अभ्यास) means "practice" in Sanskrit - embodying our mission to help you perfect your interview skills through practice.*

[![Live Demo](https://img.shields.io/badge/🚀%20Live%20Demo-Visit%20Now-success?style=for-the-badge)](https://abhyas-lac.vercel.app)
[![GitHub](https://img.shields.io/badge/⭐%20GitHub-Star%20Repo-blue?style=for-the-badge)](https://github.com/gloooomed/Abhyas)

</div>