# Security Notice

## ⚠️ Important: Environment Variables and Secrets

This repository does NOT contain any sensitive credentials in the tracked files. All sensitive information has been removed and replaced with placeholder values.

## 🔐 Setting Up Your Environment

### Local Development

1. **Backend Environment Variables**:
   ```bash
   cd backend
   cp .env.example .env
   # Edit .env with your actual credentials
   ```

2. **Frontend Environment Variables**:
   ```bash
   cd frontend
   cp .env.example .env.local
   # Edit .env.local with your actual credentials
   ```

### Production Deployment

- **Render (Backend)**: Set environment variables in your Render dashboard
- **Vercel (Frontend)**: Set environment variables in your Vercel project settings

## 🚨 Never Commit Credentials

The following files are ignored by git and should NEVER be committed:
- `.env`
- `.env.local`
- `.env.production`
- Any file containing real OAuth secrets

## ✅ What's Safe to Commit

- `.env.example` files (templates only)
- Documentation with placeholder values
- Configuration files without secrets

## 🔧 OAuth Setup Required

You need to configure your own OAuth applications:

1. **GitHub OAuth**: Create an OAuth app at https://github.com/settings/developers
2. **Google OAuth**: Create credentials at https://console.cloud.google.com/

Refer to `OAUTH_DEPLOYMENT_GUIDE.md` for detailed setup instructions.

## 📞 Getting Help

If you need help setting up credentials:
1. Check `OAUTH_DEPLOYMENT_GUIDE.md`
2. Use the template files (`.env.example`)
3. Follow the OAuth setup guides for GitHub and Google
