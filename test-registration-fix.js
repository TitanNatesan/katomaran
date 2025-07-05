const axios = require('axios');

async function testRegistrationFixed() {
    try {
        console.log('Testing user registration with proper validation...');
        
        // Test with a proper password that meets requirements
        const response = await axios.post('http://localhost:5000/api/auth/register', {
            name: 'Test User',
            email: 'testuser@example.com',
            password: 'TestPass123' // Contains uppercase, lowercase, and number
        });
        
        console.log('✅ Registration successful:', response.data);
        return true;
    } catch (error) {
        console.error('❌ Registration failed:', error.response?.data || error.message);
        return false;
    }
}

async function testRegistrationWithWeakPassword() {
    try {
        console.log('Testing registration with weak password (should fail)...');
        
        const response = await axios.post('http://localhost:5000/api/auth/register', {
            name: 'Test User 2',
            email: 'testuser2@example.com',
            password: 'weak' // Should fail validation
        });
        
        console.log('❌ This should have failed:', response.data);
        return false;
    } catch (error) {
        console.log('✅ Properly rejected weak password:', error.response?.data?.message || error.message);
        return true;
    }
}

async function main() {
    console.log('🔐 Testing Fixed Registration Validation...\n');
    
    // Wait a moment for server to restart
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    await testRegistrationFixed();
    console.log('');
    await testRegistrationWithWeakPassword();
}

main();
