#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function question(prompt) {
    return new Promise((resolve) => {
        rl.question(prompt, resolve);
    });
}

async function setupEnvironmentVariables() {
    console.log('🚀 Katomaran Environment Setup\n');
    console.log('This script will help you set up environment variables for GitHub OAuth authentication.\n');

    const environment = await question('Setup for (1) Development or (2) Production? [1/2]: ');
    const isDevelopment = environment === '1';

    console.log(`\nSetting up for ${isDevelopment ? 'Development' : 'Production'} environment...\n`);

    // Collect GitHub OAuth credentials
    const githubClientId = await question('GitHub Client ID: ');
    const githubClientSecret = await question('GitHub Client Secret: ');

    // Collect other credentials
    const jwtSecret = await question('JWT Secret (min 32 characters): ');
    const googleClientId = await question('Google Client ID (optional): ');

    let mongoUri, frontendUrl, backendUrl;

    if (isDevelopment) {
        mongoUri = await question('MongoDB URI [mongodb://localhost:27017/katomaran]: ') || 'mongodb://localhost:27017/katomaran';
        frontendUrl = 'http://localhost:5173';
        backendUrl = 'http://localhost:5000/api';
    } else {
        mongoUri = await question('MongoDB Atlas URI: ');
        frontendUrl = 'https://katomaran-todo-josh.vercel.app';
        backendUrl = 'https://katomaran-yy6g.onrender.com/api';
    }

    // Create backend .env content
    const backendEnvContent = `# ${isDevelopment ? 'Development' : 'Production'} Environment Variables
NODE_ENV=${isDevelopment ? 'development' : 'production'}
PORT=${isDevelopment ? '5000' : '10000'}
MONGO_URI=${mongoUri}
JWT_SECRET=${jwtSecret}

# OAuth Configuration
GOOGLE_CLIENT_ID=${googleClientId}
GITHUB_CLIENT_ID=${githubClientId}
GITHUB_CLIENT_SECRET=${githubClientSecret}

# Frontend URL (for CORS and OAuth redirects)
FRONTEND_URL=${frontendUrl}
`;

    // Create frontend .env content
    const frontendEnvContent = `# ${isDevelopment ? 'Development' : 'Production'} Environment Variables
VITE_API_URL=${backendUrl}
VITE_GOOGLE_CLIENT_ID=${googleClientId}
VITE_SOCKET_URL=${backendUrl.replace('/api', '')}
`;

    // Write backend .env file
    const backendEnvPath = path.join(__dirname, 'backend', '.env');
    fs.writeFileSync(backendEnvPath, backendEnvContent);
    console.log(`\n✅ Created ${backendEnvPath}`);

    // Write frontend .env file
    const frontendEnvPath = path.join(__dirname, 'frontend', '.env');
    fs.writeFileSync(frontendEnvPath, frontendEnvContent);
    console.log(`✅ Created ${frontendEnvPath}`);

    console.log('\n🎉 Environment setup complete!\n');

    if (isDevelopment) {
        console.log('Next steps for development:');
        console.log('1. Make sure MongoDB is running locally');
        console.log('2. Start backend: cd backend && npm run dev');
        console.log('3. Start frontend: cd frontend && npm run dev');
        console.log('4. Test GitHub OAuth at http://localhost:5173\n');

        console.log('GitHub OAuth App Configuration:');
        console.log('- Homepage URL: http://localhost:5173');
        console.log('- Callback URL: http://localhost:5000/api/auth/github/callback');
    } else {
        console.log('Next steps for production:');
        console.log('1. Set environment variables in Render dashboard (backend)');
        console.log('2. Set environment variables in Vercel dashboard (frontend)');
        console.log('3. Deploy both applications');
        console.log('4. Test GitHub OAuth at https://katomaran-todo-josh.vercel.app\n');

        console.log('GitHub OAuth App Configuration:');
        console.log('- Homepage URL: https://katomaran-todo-josh.vercel.app');
        console.log('- Callback URL: https://katomaran-yy6g.onrender.com/api/auth/github/callback');
    }

    console.log('\nFor detailed setup instructions, see GITHUB_AUTH_SETUP.md');

    rl.close();
}

if (require.main === module) {
    setupEnvironmentVariables().catch(error => {
        console.error('Setup failed:', error.message);
        process.exit(1);
    });
}

module.exports = { setupEnvironmentVariables };
