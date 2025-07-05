# URGENT: Render Environment Variables Setup

## Quick Fix for Deployment Error

Your backend deployment is failing because OAuth environment variables are not set on Render. Here's what you need to do immediately:

## 1. Set These Environment Variables on Render

Go to your Render dashboard and set these environment variables for your backend service:

### Required Variables:
```
NODE_ENV=production
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key_minimum_32_characters
FRONTEND_URL=https://katomaran-todo-josh.vercel.app
```

### Optional OAuth Variables (for GitHub/Google login):
```
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

## 2. If You Don't Have OAuth Apps Yet

If you don't have time to set up OAuth apps before the hackathon deadline, you can:

1. **Skip OAuth variables** - The app will work without them (regular email/password login will work)
2. **Set dummy values** (NOT recommended for production):
   ```
   GITHUB_CLIENT_ID=not_configured
   GITHUB_CLIENT_SECRET=not_configured
   GOOGLE_CLIENT_ID=not_configured
   GOOGLE_CLIENT_SECRET=not_configured
   ```

## 3. Deploy After Setting Variables

After setting the environment variables:
1. Go to your Render dashboard
2. Navigate to your backend service
3. Click "Manual Deploy" → "Deploy latest commit"
4. Wait for deployment to complete

## 4. Test Your App

Once deployed, test at: https://katomaran-todo-josh.vercel.app

## Quick OAuth Setup (if needed)

### GitHub OAuth App:
1. Go to GitHub Settings → Developer settings → OAuth Apps
2. Create new OAuth App:
   - Homepage URL: `https://katomaran-todo-josh.vercel.app`
   - Callback URL: `https://katomaran-yy6g.onrender.com/api/auth/github/callback`
3. Copy Client ID and Client Secret to Render

### Google OAuth App:
1. Go to Google Cloud Console
2. Create project → Enable Google+ API
3. Create OAuth 2.0 credentials:
   - Authorized origins: `https://katomaran-yy6g.onrender.com`
   - Authorized redirect URIs: `https://katomaran-yy6g.onrender.com/api/auth/google/callback`
4. Copy Client ID and Client Secret to Render

## Priority Order:
1. **Set basic environment variables** (NODE_ENV, MONGO_URI, JWT_SECRET, FRONTEND_URL)
2. **Deploy immediately** 
3. **Test basic functionality**
4. **Add OAuth later** if time permits

Time is critical - focus on getting the basic app working first! 🚀
