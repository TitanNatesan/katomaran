#!/usr/bin/env node

const https = require('https');
const http = require('http');

// Configuration
const BACKEND_URL = 'https://katomaran-yy6g.onrender.com';
const FRONTEND_URL = 'https://katomaran-todo-josh.vercel.app';

console.log('🔍 Katomaran Deployment Health Check');
console.log('=====================================\n');

// Function to make HTTP requests
function makeRequest(url, description) {
    return new Promise((resolve, reject) => {
        const protocol = url.startsWith('https:') ? https : http;

        const req = protocol.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                resolve({
                    status: res.statusCode,
                    data: data,
                    headers: res.headers
                });
            });
        });

        req.on('error', (err) => {
            reject(err);
        });

        req.setTimeout(10000, () => {
            req.destroy();
            reject(new Error('Request timeout'));
        });
    });
}

// Test functions
async function testBackendHealth() {
    try {
        console.log('📊 Testing Backend Health...');
        const response = await makeRequest(`${BACKEND_URL}/api/health`, 'Backend Health');

        if (response.status === 200) {
            console.log('✅ Backend is running successfully');
            try {
                const data = JSON.parse(response.data);
                console.log(`   Environment: ${data.environment}`);
                console.log(`   Timestamp: ${data.timestamp}`);
            } catch (e) {
                console.log('   Response received but not JSON');
            }
        } else {
            console.log(`❌ Backend health check failed (Status: ${response.status})`);
        }
    } catch (error) {
        console.log(`❌ Backend health check failed: ${error.message}`);
    }
}

async function testOAuthEndpoints() {
    console.log('\n🔐 Testing OAuth Endpoints...');

    // Test GitHub OAuth
    try {
        const githubResponse = await makeRequest(`${BACKEND_URL}/api/auth/github`, 'GitHub OAuth');
        if (githubResponse.status === 302) {
            console.log('✅ GitHub OAuth endpoint is working (redirect detected)');
        } else if (githubResponse.status === 503) {
            console.log('⚠️  GitHub OAuth not configured (expected in some cases)');
        } else {
            console.log(`❌ GitHub OAuth unexpected status: ${githubResponse.status}`);
        }
    } catch (error) {
        console.log(`❌ GitHub OAuth test failed: ${error.message}`);
    }

    // Test Google OAuth
    try {
        const googleResponse = await makeRequest(`${BACKEND_URL}/api/auth/google`, 'Google OAuth');
        if (googleResponse.status === 302) {
            console.log('✅ Google OAuth endpoint is working (redirect detected)');
        } else if (googleResponse.status === 503) {
            console.log('⚠️  Google OAuth not configured (expected in some cases)');
        } else {
            console.log(`❌ Google OAuth unexpected status: ${googleResponse.status}`);
        }
    } catch (error) {
        console.log(`❌ Google OAuth test failed: ${error.message}`);
    }
}

async function testFrontend() {
    console.log('\n🌐 Testing Frontend...');

    try {
        const response = await makeRequest(FRONTEND_URL, 'Frontend');
        if (response.status === 200) {
            console.log('✅ Frontend is accessible');

            // Check for common indicators that the app loaded
            if (response.data.includes('Katomaran') || response.data.includes('Task Management')) {
                console.log('✅ Frontend content appears to be loading correctly');
            } else {
                console.log('⚠️  Frontend loaded but content may not be correct');
            }
        } else {
            console.log(`❌ Frontend test failed (Status: ${response.status})`);
        }
    } catch (error) {
        console.log(`❌ Frontend test failed: ${error.message}`);
    }
}

async function testCORS() {
    console.log('\n🔄 Testing CORS Configuration...');

    try {
        const response = await makeRequest(`${BACKEND_URL}/api/health`, 'CORS Test');

        if (response.headers['access-control-allow-origin']) {
            console.log('✅ CORS headers are present');
            console.log(`   Access-Control-Allow-Origin: ${response.headers['access-control-allow-origin']}`);
        } else {
            console.log('⚠️  CORS headers not found (might be okay depending on setup)');
        }

        if (response.headers['access-control-allow-credentials']) {
            console.log(`   Access-Control-Allow-Credentials: ${response.headers['access-control-allow-credentials']}`);
        }
    } catch (error) {
        console.log(`❌ CORS test failed: ${error.message}`);
    }
}

// Run all tests
async function runHealthCheck() {
    try {
        await testBackendHealth();
        await testOAuthEndpoints();
        await testFrontend();
        await testCORS();

        console.log('\n🎉 Health check complete!');
        console.log('\n📋 Next Steps:');
        console.log('1. Update OAuth app settings (see OAUTH_DEPLOYMENT_GUIDE.md)');
        console.log('2. Set environment variables in Render and Vercel');
        console.log('3. Test OAuth flows manually in browser');
        console.log('4. Monitor logs for any errors');

    } catch (error) {
        console.log(`\n❌ Health check failed: ${error.message}`);
    }
}

// Run the health check
runHealthCheck();
