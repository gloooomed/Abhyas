# 🚀 Complete API Setup Guide for Abhyas

This comprehensive guide will walk you through setting up all necessary API keys and services for your production-ready AI-powered career advisor platform.

## 📋 Prerequisites

- Node.js and npm installed
- Modern web browser (Chrome/Edge recommended for voice features)
- Internet connection for API setup
- Email addresses for account creation

## � Step-by-Step API Configuration

### 1. **Clerk Authentication** (✅ Required)

Clerk provides enterprise-grade authentication with social logins, user management, and security.

**Setup Steps:**
1. Visit [Clerk Dashboard](https://dashboard.clerk.com/)
2. Sign up with your email or GitHub
3. Click "Create Application"
4. Choose "React" as your framework
5. Configure sign-in options (email, Google, GitHub, etc.)
6. Copy your **Publishable Key** from the API Keys section
7. Add to `.env.local`:
   ```bash
   VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_actual_key_here
   ```

**Pricing:** Free for 10,000 monthly active users, then $25/month

---

### 2. **Google AI (Gemini)** (⭐ Essential for AI Features)

Powers all AI capabilities: skills analysis, interview coaching, resume optimization, and career recommendations.

**Setup Steps:**
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Read and accept the terms of service
4. Click "Create API Key" → "Create API key in new project"
5. Copy the generated key (starts with `AIzaSy`)
6. Add to `.env.local`:
   ```bash
   VITE_GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
   ```

**Pricing:** Free tier includes 15 requests per minute, 1,500 requests per day

---

### 3. **Text-to-Speech APIs** (🎙️ Optional for Enhanced Voice Features)

Your app already includes **free browser-based text-to-speech** that works without any API keys! For enhanced voice quality, you can optionally add one of these **free services** (no payment required):

#### **Option A: Eleven Labs (Recommended - No Payment Required)**
- **Free Tier**: 10,000 characters/month permanently
- **Quality**: Excellent, human-like voices
- **Setup**:
  1. Go to [elevenlabs.io](https://elevenlabs.io)
  2. Sign up with just your email (no payment info needed)
  3. Go to Profile → API Keys
  4. Copy your API key
  5. Add to `.env.local`:
     ```bash
     VITE_ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
     ```

#### **Option B: Azure Speech (Enterprise Quality)**
- **Free Tier**: 5 hours of audio/month permanently
- **Quality**: Enterprise-grade, multiple languages
- **Setup**:
  1. Go to [portal.azure.com](https://portal.azure.com)
  2. Create free account (no payment required for free tier)
  3. Create "Speech Services" resource
  4. Copy API key and region
  5. Add to `.env.local`:
     ```bash
     VITE_AZURE_SPEECH_KEY=your_key
     VITE_AZURE_SPEECH_REGION=your_region
     ```

#### **Option C: Browser Speech API (Already Included)**
- **Cost**: Completely free, no API needed
- **Quality**: Good, works offline
- **Setup**: Already working! No configuration needed

**Note**: The app automatically falls back to browser speech if external APIs fail.

---

### 4. **Database** (💾 Optional for Data Persistence)

Store user profiles, analysis history, and progress tracking.

#### **Option A: Neon (Recommended)**
1. Go to [neon.tech](https://neon.tech)
2. Sign up with GitHub or email
3. Create a new project
4. Copy the connection string from dashboard
5. Add to `.env.local`:
   ```bash
   DATABASE_URL=postgresql://username:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```

#### **Option B: Supabase**
1. Visit [supabase.com](https://supabase.com)
2. Create account and new project
3. Go to Settings → Database
4. Copy the connection pooler string

#### **Option C: Railway**
1. Go to [railway.app](https://railway.app)
2. Create PostgreSQL database
3. Copy connection string from variables

**Free Tiers:** All offer 1GB+ storage free

---

## 📁 Environment File Configuration

Create `.env.local` in your project root with:

```bash
# ========================================
# Clerk Authentication (Required)
# ========================================
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_actual_clerk_key_here

# ========================================
# AI Services (Required for AI features)
# ========================================
VITE_GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

# ========================================
# Text-to-Speech Services (Optional - FREE options available)
# ========================================
# Eleven Labs (FREE: 10,000 chars/month, no payment required)
VITE_ELEVENLABS_API_KEY=your_elevenlabs_key_here

# Azure Speech (FREE: 5 hours/month, no payment required)
VITE_AZURE_SPEECH_KEY=your_azure_key_here
VITE_AZURE_SPEECH_REGION=eastus

# Google Speech (Requires payment setup)
VITE_GOOGLE_SPEECH_API_KEY=your_google_speech_key_here

# ========================================
# Application Settings
# ========================================
VITE_APP_URL=http://localhost:5174

# ========================================
# Database (Optional)
# ========================================
DATABASE_URL=postgresql://username:password@host:5432/database?sslmode=require
```

## 🧪 Comprehensive Testing Guide

### Phase 1: Authentication Testing
```bash
# 1. Start development server
npm run dev

# 2. Open browser to http://localhost:5174
# 3. Test sign-up flow
# 4. Test sign-in flow
# 5. Verify dashboard access
```

### Phase 2: AI Features Testing

**Skills Gap Analysis:**
1. Navigate to Skills Gap Analysis
2. Enter: "JavaScript, HTML, CSS, Git"
3. Target role: "Frontend Developer"
4. Click "Analyze Skills Gap"
5. ✅ Should see AI-generated recommendations

**Mock Interview:**
1. Go to Mock Interview
2. Configure: "Software Engineer", "Mid Level", "Technology"
3. Choose text or voice mode
4. Start interview
5. ✅ Should receive AI-generated questions

**Resume Optimizer:**
1. Visit Resume Optimizer
2. Paste sample resume text
3. Set target role
4. Analyze
5. ✅ Should get optimization suggestions

### Phase 3: Voice Features Testing (If Enabled)
1. Grant microphone permissions
2. Test voice input in mock interview
3. Verify transcription accuracy
4. Test voice synthesis (AI speaking)

## 🚨 Troubleshooting Guide

### Common Issues & Solutions:

| Issue | Cause | Solution |
|-------|--------|----------|
| "Clerk key not found" | Missing/incorrect env var | Check `.env.local` syntax, restart server |
| "Gemini API error" | Invalid API key | Verify key in Google AI Studio |
| Blank page | Authentication failure | Clear browser cache, check Clerk config |
| Voice not working | Browser permissions | Grant microphone access in browser |
| Build errors | Missing dependencies | Run `npm install` |

### Environment Variable Checklist:
- [ ] `.env.local` file exists in project root
- [ ] File contains all required variables
- [ ] No extra spaces around `=` signs
- [ ] Keys start with correct prefixes
- [ ] Development server restarted after changes

### Browser Console Debugging:
1. Open Developer Tools (F12)
2. Check Console tab for errors
3. Look for network errors in Network tab
4. Verify environment variables are loaded

## 📊 API Usage Monitoring & Limits

### Clerk Usage:
- **Free:** 10,000 MAU (Monthly Active Users)
- **Pro:** $25/month for unlimited users
- Monitor in [Clerk Dashboard](https://dashboard.clerk.com/)

### Google Gemini Usage:
- **Free:** 15 RPM, 1,500 RPD (requests per day)
- **Paid:** $0.50 per 1M characters
- Monitor in [Google AI Studio](https://makersuite.google.com/)

### Google Speech Usage:
- **Free:** 60 minutes/month
- **Paid:** $0.006 per 15 seconds
- Monitor in [Google Cloud Console](https://console.cloud.google.com/)

## 🚀 Production Deployment Guide

### Vercel Deployment (Recommended):

1. **Connect Repository:**
   ```bash
   # Push code to GitHub
   git add .
   git commit -m "Ready for production"
   git push origin main
   ```

2. **Configure Vercel:**
   - Visit [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Add environment variables in project settings:
     - `VITE_CLERK_PUBLISHABLE_KEY`
     - `VITE_GEMINI_API_KEY`
     - `VITE_GOOGLE_SPEECH_API_KEY`
     - `VITE_APP_URL` (your production URL)

3. **Deploy & Test:**
   - Deploy automatically on git push
   - Test all features in production
   - Monitor performance and errors

### Alternative Platforms:
- **Netlify:** Similar process, add env vars in site settings
- **Railway:** Deploy directly from GitHub
- **AWS Amplify:** Use AWS ecosystem

## 🔒 Security Best Practices

### Development:
- Never commit `.env.local` to version control
- Add `.env.local` to `.gitignore`
- Use different API keys for dev/prod
- Regularly rotate API keys

### Production:
- Use environment-specific keys
- Implement rate limiting
- Monitor API usage for unusual patterns
- Set up error tracking (Sentry, LogRocket)

## 💡 Optimization Tips

### Performance:
- Implement response caching for AI calls
- Use debouncing for user input
- Implement loading states
- Optimize bundle size

### User Experience:
- Provide fallback mock data
- Implement progressive enhancement
- Add offline detection
- Use error boundaries

## 📈 Scaling Considerations

### When to Upgrade:
- Clerk: >10K monthly users
- Gemini: >1,500 daily requests
- Speech: >60 minutes monthly
- Database: >1GB data

### Cost Optimization:
- Cache AI responses where appropriate
- Implement request batching
- Use efficient prompts
- Monitor and optimize API calls

## 📞 Support & Resources

### Documentation:
- [Clerk Docs](https://clerk.com/docs)
- [Google AI Docs](https://ai.google.dev/docs)
- [Vite Docs](https://vitejs.dev/guide/)
- [React Docs](https://react.dev/)

### Community:
- [Clerk Discord](https://clerk.com/discord)
- [Google AI Community](https://developers.googleblog.com/search/label/AI)
- [React Community](https://react.dev/community)

### Status Pages:
- [Clerk Status](https://status.clerk.com/)
- [Google Cloud Status](https://status.cloud.google.com/)

## 🎯 Next Steps After Setup

1. **Customize AI Prompts:** Tailor prompts for your specific use cases
2. **Add Analytics:** Implement user behavior tracking
3. **Performance Monitoring:** Set up application monitoring
4. **User Feedback:** Implement feedback collection system
5. **Content Management:** Add admin panel for managing content
6. **Advanced Features:** Add more AI capabilities

## ✅ Setup Completion Checklist

- [ ] Clerk authentication working
- [ ] All AI features functional
- [ ] Voice features tested (if enabled)
- [ ] Database connected (if using)
- [ ] Production deployment successful
- [ ] Error monitoring set up
- [ ] Analytics implemented
- [ ] User feedback system ready

**🎉 Congratulations! Your AI-powered career advisor is now ready to help users achieve their career goals!**

---

**Need help?** Check our troubleshooting section above or open an issue in the repository.