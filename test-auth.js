#!/usr/bin/env node

const axios = require('axios');

// Configuration
const API_BASE = process.env.API_URL || 'http://localhost:5000/api';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

async function testAuthEndpoints() {
    console.log('🔍 Testing Katomaran Authentication Endpoints\n');
    console.log(`API Base: ${API_BASE}`);
    console.log(`Frontend URL: ${FRONTEND_URL}\n`);

    // Test health endpoint
    try {
        console.log('1. Testing health endpoint...');
        const healthResponse = await axios.get(`${API_BASE}/health`);
        console.log('✅ Health check passed:', healthResponse.data.message);
    } catch (error) {
        console.log('❌ Health check failed:', error.message);
        return;
    }

    // Test GitHub OAuth endpoint (should redirect)
    try {
        console.log('\n2. Testing GitHub OAuth endpoint...');
        const response = await axios.get(`${API_BASE}/auth/github`, {
            maxRedirects: 0,
            validateStatus: (status) => status === 302
        });
        console.log('✅ GitHub OAuth endpoint returns redirect (302)');
        console.log('   Redirect location:', response.headers.location);
    } catch (error) {
        if (error.response && error.response.status === 302) {
            console.log('✅ GitHub OAuth endpoint returns redirect (302)');
            console.log('   Redirect location:', error.response.headers.location);
        } else {
            console.log('❌ GitHub OAuth endpoint failed:', error.message);
        }
    }

    // Test auth/me endpoint (should require authentication)
    try {
        console.log('\n3. Testing protected endpoint (/auth/me)...');
        await axios.get(`${API_BASE}/auth/me`);
        console.log('❌ Protected endpoint allowed unauthenticated access');
    } catch (error) {
        if (error.response && error.response.status === 401) {
            console.log('✅ Protected endpoint correctly requires authentication');
        } else {
            console.log('❌ Unexpected error:', error.message);
        }
    }

    console.log('\n🎉 Basic endpoint tests completed!');
    console.log('\nTo test full GitHub OAuth flow:');
    console.log('1. Start your application');
    console.log('2. Navigate to the login page');
    console.log('3. Click "Continue with GitHub"');
    console.log('4. Complete OAuth authorization');
    console.log('5. Verify redirect to /auth/callback works');
    console.log('6. Check that you\'re logged in successfully');
}

// Test environment variables
function checkEnvironmentVariables() {
    console.log('🔧 Environment Variables Check\n');

    const requiredBackendVars = [
        'NODE_ENV',
        'JWT_SECRET',
        'GITHUB_CLIENT_ID',
        'GITHUB_CLIENT_SECRET',
        'FRONTEND_URL'
    ];

    const requiredFrontendVars = [
        'VITE_API_URL',
        'VITE_GOOGLE_CLIENT_ID'
    ];

    console.log('Backend Environment Variables:');
    requiredBackendVars.forEach(varName => {
        const value = process.env[varName];
        if (value) {
            console.log(`✅ ${varName}: ${varName.includes('SECRET') ? '***hidden***' : value}`);
        } else {
            console.log(`❌ ${varName}: Not set`);
        }
    });

    console.log('\nFrontend Environment Variables:');
    console.log('(Check these in your frontend .env file)');
    requiredFrontendVars.forEach(varName => {
        console.log(`   ${varName}`);
    });
}

if (require.main === module) {
    checkEnvironmentVariables();
    console.log('\n' + '='.repeat(50) + '\n');
    testAuthEndpoints().catch(error => {
        console.error('Test failed:', error.message);
        process.exit(1);
    });
}

module.exports = { testAuthEndpoints, checkEnvironmentVariables };
