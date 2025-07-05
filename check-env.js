#!/usr/bin/env node

// Simple script to check if environment variables are configured
console.log('🔍 Environment Variables Check\n');

const requiredVars = {
    'NODE_ENV': process.env.NODE_ENV,
    'MONGO_URI': process.env.MONGO_URI ? '✅ Set' : '❌ Missing',
    'JWT_SECRET': process.env.JWT_SECRET ? '✅ Set' : '❌ Missing',
    'FRONTEND_URL': process.env.FRONTEND_URL || '❌ Missing'
};

const optionalVars = {
    'GITHUB_CLIENT_ID': process.env.GITHUB_CLIENT_ID || '⚠️ Not configured',
    'GITHUB_CLIENT_SECRET': process.env.GITHUB_CLIENT_SECRET ? '✅ Set' : '⚠️ Not configured',
    'GOOGLE_CLIENT_ID': process.env.GOOGLE_CLIENT_ID || '⚠️ Not configured',
    'GOOGLE_CLIENT_SECRET': process.env.GOOGLE_CLIENT_SECRET ? '✅ Set' : '⚠️ Not configured'
};

console.log('📋 Required Variables:');
Object.entries(requiredVars).forEach(([key, value]) => {
    console.log(`  ${key}: ${value}`);
});

console.log('\n🔐 OAuth Variables (Optional):');
Object.entries(optionalVars).forEach(([key, value]) => {
    console.log(`  ${key}: ${value}`);
});

// Check if basic setup is ready
const hasBasicSetup = requiredVars.MONGO_URI !== '❌ Missing' &&
    requiredVars.JWT_SECRET !== '❌ Missing';

console.log('\n📊 Status:');
if (hasBasicSetup) {
    console.log('✅ Basic setup complete - App should start');
} else {
    console.log('❌ Basic setup incomplete - App will fail to start');
}

// Check OAuth setup
const hasGitHub = optionalVars.GITHUB_CLIENT_ID !== '⚠️ Not configured' &&
    optionalVars.GITHUB_CLIENT_SECRET !== '⚠️ Not configured';
const hasGoogle = optionalVars.GOOGLE_CLIENT_ID !== '⚠️ Not configured' &&
    optionalVars.GOOGLE_CLIENT_SECRET !== '⚠️ Not configured';

console.log(`🔐 GitHub OAuth: ${hasGitHub ? '✅ Ready' : '⚠️ Not configured'}`);
console.log(`🔐 Google OAuth: ${hasGoogle ? '✅ Ready' : '⚠️ Not configured'}`);

if (!hasGitHub && !hasGoogle) {
    console.log('\n💡 Note: OAuth providers not configured. Users can still register/login with email/password.');
}

console.log('\n🚀 Next steps:');
if (!hasBasicSetup) {
    console.log('1. Set MONGO_URI and JWT_SECRET in your environment');
    console.log('2. Deploy your application');
} else {
    console.log('1. Your app should work with basic email/password authentication');
    console.log('2. Set up OAuth providers if needed for social login');
}
