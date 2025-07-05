const axios = require('axios');

async function testRegistration() {
    try {
        console.log('Testing user registration...');
        
        const response = await axios.post('http://localhost:5000/api/auth/register', {
            name: 'Test User',
            email: 'test@example.com',
            password: 'testpass123'
        });
        
        console.log('Registration successful:', response.data);
        return true;
    } catch (error) {
        console.error('Registration failed:', error.response?.data || error.message);
        return false;
    }
}

async function testLogin() {
    try {
        console.log('Testing user login...');
        
        const response = await axios.post('http://localhost:5000/api/auth/login', {
            email: 'test@example.com',
            password: 'testpass123'
        });
        
        console.log('Login successful:', response.data);
        return true;
    } catch (error) {
        console.error('Login failed:', error.response?.data || error.message);
        return false;
    }
}

async function main() {
    console.log('🔐 Testing Email Authentication...');
    
    const registrationSuccess = await testRegistration();
    if (registrationSuccess) {
        await testLogin();
    }
}

main();
