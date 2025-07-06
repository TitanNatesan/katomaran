#!/usr/bin/env node

const dotenv = require('dotenv');
dotenv.config();

console.log('🔍 Environment Variables Check');
console.log('='.repeat(40));

const requiredVars = [
    'NODE_ENV',
    'MONGO_URI',
    'JWT_SECRET'
];

const optionalVars = [
    'FRONTEND_URL',
    'GITHUB_CLIENT_ID',
    'GITHUB_CLIENT_SECRET'
];

console.log('\n✅ Required Variables:');
let allRequiredSet = true;
requiredVars.forEach(varName => {
    const value = process.env[varName];
    if (value) {
        console.log(`   ${varName}: ${varName.includes('SECRET') ? '***hidden***' : value}`);
    } else {
        console.log(`❌ ${varName}: NOT SET`);
        allRequiredSet = false;
    }
});

console.log('\n📋 Optional Variables (OAuth):');
optionalVars.forEach(varName => {
    const value = process.env[varName];
    if (value && value !== 'your_' + varName.toLowerCase() + '_here') {
        console.log(`✅ ${varName}: ${varName.includes('SECRET') ? '***hidden***' : value}`);
    } else {
        console.log(`⚠️  ${varName}: Not configured`);
    }
});

console.log('\n🔧 OAuth Status:');
const githubConfigured = process.env.GITHUB_CLIENT_ID &&
    process.env.GITHUB_CLIENT_SECRET &&
    process.env.GITHUB_CLIENT_ID !== 'your_github_client_id_here';

console.log(`   GitHub OAuth: ${githubConfigured ? '✅ Configured' : '❌ Not configured'}`);

if (!allRequiredSet) {
    console.log('\n❌ CRITICAL: Missing required environment variables!');
    console.log('Application may not start properly.');
    process.exit(1);
} else {
    console.log('\n✅ All required environment variables are set!');
    console.log('Starting application...');
}

// Start the actual application
require('./index.js');
