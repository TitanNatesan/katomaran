#!/usr/bin/env node

console.log('🔧 RENDER DEPLOYMENT FIX - GitHub & Google OAuth Setup');
console.log('='.repeat(50));

console.log('\n❌ CURRENT ISSUE:');
console.log('Backend is crashing because GITHUB_CLIENT_ID environment variable is not set');
console.log('Error: "OAuth2Strategy requires a clientID option"');

console.log('\n✅ QUICK FIX:');
console.log('Your backend code is already configured to handle missing OAuth credentials gracefully.');
console.log('The issue is that environment variables are not set in Render.');

console.log('\n📋 ENVIRONMENT VARIABLES NEEDED IN RENDER:');
console.log('\n1. Go to your Render dashboard → Backend service → Environment tab');
console.log('2. Add these environment variables:');

console.log('\nRequired Variables:');
console.log('GITHUB_CLIENT_ID=your_github_client_id_here');
console.log('GITHUB_CLIENT_SECRET=your_github_client_secret_here');
console.log('GOOGLE_CLIENT_ID=your_google_client_id_here');
console.log('GOOGLE_CLIENT_SECRET=your_google_client_secret_here');

console.log('\nOptional (if not already set):');
console.log('NODE_ENV=production');
console.log('JWT_SECRET=your_production_jwt_secret_here');
console.log('FRONTEND_URL=https://katomaran-todo-josh.vercel.app');

console.log('\n🔗 GITHUB OAUTH APP SETUP:');
console.log('\n1. Go to GitHub → Settings → Developer settings → OAuth Apps');
console.log('2. Click "New OAuth App"');
console.log('3. Fill in:');
console.log('   - Application name: Katomaran Task Manager');
console.log('   - Homepage URL: https://katomaran-todo-josh.vercel.app');
console.log('   - Authorization callback URL: https://katomaran-yy6g.onrender.com/api/auth/github/callback');
console.log('4. Copy the Client ID and Client Secret');
console.log('5. Add them to your Render environment variables');

console.log('\n🔗 GOOGLE OAUTH APP SETUP:');
console.log('\n1. Go to Google Cloud Console → API & Services → Credentials');
console.log('2. Click "Create Credentials" → OAuth 2.0 Client IDs');
console.log('3. Fill in:');
console.log('   - Application type: Web application');
console.log('   - Name: Katomaran Task Manager');
console.log('   - Authorized JavaScript origins: https://katomaran-todo-josh.vercel.app');
console.log('   - Authorized redirect URIs: https://katomaran-yy6g.onrender.com/api/auth/google/callback');
console.log('4. Copy the Client ID and Client Secret');
console.log('5. Add them to your Render environment variables');

console.log('\n🔧 VERCEL ENVIRONMENT VARIABLES:');
console.log('\nAdd these to your Vercel dashboard → Project → Settings → Environment Variables:');
console.log('VITE_API_URL=https://katomaran-yy6g.onrender.com/api');
console.log('VITE_GOOGLE_CLIENT_ID=your_google_client_id_here');
console.log('VITE_SOCKET_URL=https://katomaran-yy6g.onrender.com');

console.log('\n✅ CURRENT STATUS:');
console.log('- Backend code is now crash-proof (handles missing GitHub/Google OAuth)');
console.log('- CORS is configured for the correct frontend domain');
console.log('- Application will work without OAuth configured');
console.log('- Both GitHub and Google OAuth are implemented');

console.log('\n⏰ URGENT - RENDER DEPLOYMENT:');
console.log('1. Set the environment variables in Render NOW');
console.log('2. Redeploy the backend service');
console.log('3. Test the application');

console.log('\n🚀 TESTING STEPS:');
console.log('1. Visit https://katomaran-todo-josh.vercel.app');
console.log('2. Try regular email/password login first');
console.log('3. Test GitHub OAuth (if configured)');
console.log('4. Test Google OAuth (if configured)');

console.log('\nTime remaining: ~27 hours until hackathon deadline');
console.log('Priority: Fix Render deployment first, then configure OAuth');
console.log('- Once you add the GitHub credentials, GitHub login will work');

console.log('\n🚀 DEPLOYMENT STEPS:');
console.log('1. Set the environment variables in Render');
console.log('2. Render will automatically redeploy');
console.log('3. Test your application at https://katomaran-todo-josh.vercel.app');

console.log('\n💡 TIPS:');
console.log('- Your app will work with email/password login even without GitHub OAuth');
console.log('- The GitHub login button will show an error message if not configured');
console.log('- All other features (tasks, real-time updates) will work normally');

console.log('\n🔍 TESTING:');
console.log('- Health check: https://katomaran-yy6g.onrender.com/api/health');
console.log('- GitHub OAuth: https://katomaran-yy6g.onrender.com/api/auth/github');
console.log('  (Should return 503 if not configured, redirect if configured)');

console.log('\n' + '='.repeat(50));
console.log('🎉 Your deployment should now succeed!');
console.log('Add the GitHub OAuth credentials when you\'re ready to enable GitHub login.');
