# OAuth & CORS Deployment Guide - Katomaran Task Management

## 🚀 Current Status
Your application is ready for deployment! All OAuth credentials are configured and CORS is properly set up.

## 📋 Pre-Deployment Checklist

### ✅ Completed
- [x] Backend environment variables configured
- [x] Frontend environment variables configured
- [x] CORS configuration updated for production
- [x] Google OAuth integration implemented
- [x] GitHub OAuth integration implemented
- [x] Error handling for missing OAuth credentials
- [x] Environment variable validation scripts

### 🔧 OAuth App Configuration Required

Before deploying, ensure your OAuth applications are configured with the correct callback URLs:

#### GitHub OAuth App Settings
1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Select your OAuth app (`Ov23lieU2AmnIB4yMK9V`)
3. Update the **Authorization callback URL** to:
   ```
   https://katomaran-yy6g.onrender.com/api/auth/github/callback
   ```
4. Add additional callback URL for local development:
   ```
   http://localhost:5000/api/auth/github/callback
   ```

#### Google OAuth App Settings
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to APIs & Services > Credentials
3. Select your OAuth client (your Google OAuth client ID)
4. Add **Authorized redirect URIs**:
   ```
   https://katomaran-yy6g.onrender.com/api/auth/google/callback
   http://localhost:5000/api/auth/google/callback
   ```
5. Add **Authorized JavaScript origins**:
   ```
   https://katomaran-todo-josh.vercel.app
   https://katomaran-yy6g.onrender.com
   http://localhost:5173
   http://localhost:5000
   ```

## 🌐 Production Environment Variables

### Render (Backend) - Environment Variables to Set:
```env
NODE_ENV=production
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key_here
FRONTEND_URL=https://katomaran-todo-josh.vercel.app
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### Vercel (Frontend) - Environment Variables to Set:
```env
VITE_API_URL=https://katomaran-yy6g.onrender.com/api
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_SOCKET_URL=https://katomaran-yy6g.onrender.com
```

## 🔄 Deployment Steps

### 1. Set Environment Variables
- **Render**: Go to your service dashboard > Environment tab > Add the backend variables
- **Vercel**: Go to your project > Settings > Environment Variables > Add the frontend variables

### 2. Deploy Backend (Render)
```bash
# Your backend will automatically deploy when you push to main branch
# Or manually deploy from Render dashboard
```

### 3. Deploy Frontend (Vercel)
```bash
# Your frontend will automatically deploy when you push to main branch
# Or manually deploy from Vercel dashboard
```

### 4. Verify Deployment
After deployment, test these endpoints:

#### Backend Health Check:
```
GET https://katomaran-yy6g.onrender.com/api/health
```

#### OAuth Endpoints:
```
GET https://katomaran-yy6g.onrender.com/api/auth/github
GET https://katomaran-yy6g.onrender.com/api/auth/google
```

## 🧪 Testing OAuth Flows

### Testing GitHub OAuth:
1. Visit: `https://katomaran-todo-josh.vercel.app`
2. Click "Login with GitHub"
3. Should redirect to GitHub, then back to your app with auth token

### Testing Google OAuth:
1. Visit: `https://katomaran-todo-josh.vercel.app`
2. Click "Login with Google"
3. Should redirect to Google, then back to your app with auth token

## 🔍 Debugging

### Common Issues and Solutions:

#### CORS Errors:
- Check that your frontend URL is in the CORS allowlist
- Verify the FRONTEND_URL environment variable is correct

#### OAuth Not Working:
- Check that OAuth app callback URLs are correct
- Verify all OAuth environment variables are set
- Check browser console for specific error messages

#### 404 Errors:
- Ensure API routes are correctly prefixed with `/api`
- Check that the backend URL is correct in frontend env vars

### Debug Commands:
```bash
# Check backend environment variables
curl https://katomaran-yy6g.onrender.com/api/health

# Test OAuth endpoints
curl -I https://katomaran-yy6g.onrender.com/api/auth/github
curl -I https://katomaran-yy6g.onrender.com/api/auth/google
```

## 📚 Architecture Overview

```
Frontend (Vercel)
├── Login Page with OAuth buttons
├── Auth callback handler
└── API calls to backend

Backend (Render)
├── CORS configuration
├── OAuth strategies (GitHub, Google)
├── Auth routes and callbacks
└── JWT token generation
```

## 🎯 Next Steps After Deployment

1. **Update OAuth Apps**: Configure callback URLs as described above
2. **Set Environment Variables**: In both Render and Vercel dashboards
3. **Deploy**: Push changes or manually deploy from dashboards
4. **Test**: Verify both OAuth flows work in production
5. **Monitor**: Check logs for any errors

## 📞 Support

If you encounter issues:
1. Check browser console for errors
2. Check server logs in Render dashboard
3. Verify all environment variables are set correctly
4. Ensure OAuth app settings match the callback URLs

---

✅ **Your app is ready for production!** All the code is correctly configured for OAuth and CORS.
