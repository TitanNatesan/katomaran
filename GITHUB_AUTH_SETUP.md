# GitHub Authentication Setup Guide

## Overview
This guide covers setting up GitHub OAuth authentication for the Katomaran Task Management Application, including environment variable configuration for both local development and production deployment.

## Deployment URLs
- **Backend (Render)**: https://katomaran-yy6g.onrender.com
- **Frontend (Vercel)**: https://katomaran-todo-josh.vercel.app

## 1. GitHub OAuth App Setup

### Create a GitHub OAuth App
1. Go to GitHub Settings → Developer settings → OAuth Apps
2. Click "New OAuth App"
3. Fill in the details:
   - **Application name**: Katomaran Task Manager
   - **Homepage URL**: https://katomaran-todo-josh.vercel.app
   - **Authorization callback URL**: https://katomaran-yy6g.onrender.com/api/auth/github/callback

### For Local Development
Create a separate OAuth app for local development:
- **Homepage URL**: http://localhost:5173
- **Authorization callback URL**: http://localhost:5000/api/auth/github/callback

## 2. Environment Variables

### Backend Environment Variables (Render)

Set these environment variables in your Render dashboard:

```bash
NODE_ENV=production
PORT=10000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_production_jwt_secret_key_minimum_32_characters

# OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id
GITHUB_CLIENT_ID=your_github_client_id_from_oauth_app
GITHUB_CLIENT_SECRET=your_github_client_secret_from_oauth_app

# Frontend URL (for CORS and OAuth redirects)
FRONTEND_URL=https://katomaran-todo-josh.vercel.app
```

### Frontend Environment Variables (Vercel)

Set these environment variables in your Vercel dashboard:

```bash
VITE_API_URL=https://katomaran-yy6g.onrender.com/api
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_SOCKET_URL=https://katomaran-yy6g.onrender.com
```

### Local Development Environment Variables

#### Backend (.env)
```bash
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/katomaran
JWT_SECRET=your_local_jwt_secret_key_minimum_32_characters

# OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id
GITHUB_CLIENT_ID=your_local_github_client_id
GITHUB_CLIENT_SECRET=your_local_github_client_secret

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

#### Frontend (.env)
```bash
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_SOCKET_URL=http://localhost:5000
```

## 3. How GitHub Authentication Works

### Backend Flow
1. User clicks "Continue with GitHub" button
2. Frontend redirects to: `{API_URL}/auth/github`
3. Backend redirects to GitHub OAuth page
4. User authorizes the application
5. GitHub redirects to: `{API_URL}/auth/github/callback`
6. Backend processes the callback:
   - Verifies the GitHub user
   - Creates or updates user in database
   - Generates JWT token
   - Redirects to frontend: `{FRONTEND_URL}/auth/callback?token={jwt_token}`

### Frontend Flow
1. AuthCallback component extracts token from URL
2. Makes API call to `/auth/me` to get user data
3. Stores token in localStorage
4. Updates authentication context
5. Redirects to dashboard

## 4. Testing the Integration

### Local Testing
1. Start backend: `npm run dev` (port 5000)
2. Start frontend: `npm run dev` (port 5173)
3. Navigate to http://localhost:5173
4. Click "Continue with GitHub"
5. Authorize the application
6. Should redirect back and log you in

### Production Testing
1. Deploy both applications
2. Navigate to https://katomaran-todo-josh.vercel.app
3. Click "Continue with GitHub"
4. Authorize the application
5. Should redirect back and log you in

## 5. Important Security Notes

### JWT Secret
- Use a strong, randomly generated secret (minimum 32 characters)
- Different secrets for development and production
- Never commit secrets to version control

### GitHub OAuth App Security
- Use different OAuth apps for development and production
- Regularly rotate client secrets
- Monitor OAuth app usage in GitHub settings

### CORS Configuration
- Backend CORS is configured to only allow requests from your frontend URL
- Production: Only allows https://katomaran-todo-josh.vercel.app
- Development: Only allows http://localhost:5173

## 6. Troubleshooting

### Common Issues

#### "OAuth App not found" error
- Check that GITHUB_CLIENT_ID is correct
- Verify OAuth app exists in GitHub settings

#### "Invalid callback URL" error
- Ensure callback URL in GitHub app matches backend URL
- Production: https://katomaran-yy6g.onrender.com/api/auth/github/callback
- Development: http://localhost:5000/api/auth/github/callback

#### "CORS error" in browser
- Check FRONTEND_URL environment variable matches your frontend domain
- Verify no trailing slashes in URLs

#### "Authentication failed" after callback
- Check JWT_SECRET is set and consistent
- Verify database connection is working
- Check backend logs for detailed error messages

### Debug Steps
1. Check environment variables are set correctly
2. Verify OAuth app configuration in GitHub
3. Check backend logs for authentication errors
4. Use browser dev tools to inspect network requests
5. Verify database connectivity

## 7. Database Schema

The User model supports GitHub authentication with these fields:
- `githubId`: GitHub user ID
- `username`: GitHub username
- `email`: User email (from GitHub or manual entry)
- `name`: Display name
- `avatar`: Profile picture URL

## 8. Additional Features

### Account Linking
- Users can link GitHub to existing email/password accounts
- If email matches, GitHub ID is added to existing account
- Supports multiple authentication methods per user

### Real-time Features
- Socket.io integration works with GitHub-authenticated users
- Real-time task updates and notifications
- User presence indicators

This setup provides a secure, scalable authentication system that works across development and production environments.
