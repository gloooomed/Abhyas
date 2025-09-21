# Deployment Guide

## Quick Deploy to Vercel

1. **Install Vercel CLI** (if not already installed)
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy the Project**
   ```bash
   vercel
   ```
   - Follow the prompts
   - Set up environment variables when prompted

4. **Set Environment Variables** in Vercel Dashboard
   - Go to your project in Vercel dashboard
   - Navigate to Settings → Environment Variables
   - Add:
     ```
     VITE_CLERK_PUBLISHABLE_KEY=pk_live_your_production_key
     VITE_GEMINI_API_KEY=your_gemini_api_key
     VITE_GOOGLE_SPEECH_API_KEY=your_google_speech_api_key
     ```

5. **Deploy to Production**
   ```bash
   vercel --prod
   ```

## Manual Setup for Other Platforms

### Netlify
1. Build the project: `npm run build`
2. Deploy the `dist` folder to Netlify
3. Set environment variables in Netlify dashboard

### Cloudflare Pages
1. Connect your Git repository
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Add environment variables

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_CLERK_PUBLISHABLE_KEY` | Clerk publishable key | Yes |
| `VITE_GEMINI_API_KEY` | Google Gemini API key | For AI features |
| `VITE_GOOGLE_SPEECH_API_KEY` | Google Speech API key | For voice features |
| `DATABASE_URL` | PostgreSQL connection string | For data persistence |

## Post-Deployment Checklist

- [ ] Verify authentication works
- [ ] Test all navigation routes
- [ ] Check responsive design on mobile
- [ ] Validate form submissions
- [ ] Test error handling
- [ ] Monitor performance metrics
- [ ] Set up analytics (optional)

## Troubleshooting

**Build Errors**: Check that all environment variables are set correctly

**Authentication Issues**: Verify Clerk domain settings match your deployment URL

**Styling Issues**: Ensure TailwindCSS is properly configured and built