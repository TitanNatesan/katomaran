const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

async function testAPI() {
    console.log('Testing API endpoints...\n');

    // Test health endpoint
    try {
        const healthResponse = await axios.get(`${API_BASE}/health`);
        console.log('✅ Health check:', healthResponse.data);
    } catch (error) {
        console.log('❌ Health check failed:', error.message);
    }

    // Test user registration
    try {
        const registerResponse = await axios.post(`${API_BASE}/auth/register`, {
            name: 'Test User',
            email: 'test@example.com',
            password: 'Password123'
        });
        console.log('✅ User registration:', registerResponse.data);
    } catch (error) {
        console.log('❌ User registration failed:', error.response?.data || error.message);
    }

    // Test user login
    try {
        const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
            email: 'test@example.com',
            password: 'Password123'
        });
        console.log('✅ User login:', loginResponse.data);

        // Test task creation with auth token
        if (loginResponse.data.token) {
            try {
                const taskResponse = await axios.post(`${API_BASE}/tasks`, {
                    title: 'Test Task',
                    description: 'Testing task creation',
                    priority: 'medium',
                    dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000) // Tomorrow
                }, {
                    headers: {
                        'Authorization': `Bearer ${loginResponse.data.token}`
                    }
                });
                console.log('✅ Task creation:', taskResponse.data);
            } catch (error) {
                console.log('❌ Task creation failed:', error.response?.data || error.message);
            }
        }
    } catch (error) {
        console.log('❌ User login failed:', error.response?.data || error.message);
    }
}

testAPI().catch(console.error);
