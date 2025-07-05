const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../index');
const User = require('../models/User');
const Task = require('../models/Task');

// Test database
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/katomaran_test';

describe('Katomaran API Tests', () => {
    let authToken;
    let userId;
    let taskId;
    let server;

    beforeAll(async () => {
        // Connect to test database
        await mongoose.connect(MONGO_URI);

        // Clear test data
        await User.deleteMany({});
        await Task.deleteMany({});
    });

    afterAll(async () => {
        // Clean up and close database connection
        await User.deleteMany({});
        await Task.deleteMany({});
        await mongoose.connection.close();

        // Close server if it exists
        if (server) {
            server.close();
        }
    });

    describe('API Health Check', () => {
        test('GET /api/health should return 200', async () => {
            const response = await request(app)
                .get('/api/health')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('Server is running');
        });
    });

    describe('Authentication', () => {
        test('POST /api/auth/register should create a new user', async () => {
            const userData = {
                name: 'Test User',
                email: 'test@example.com',
                password: 'TestPassword123'
            };

            const response = await request(app)
                .post('/api/auth/register')
                .send(userData)
                .expect(201);

            expect(response.body.success).toBe(true);
            expect(response.body.token).toBeDefined();
            expect(response.body.user.email).toBe(userData.email);

            authToken = response.body.token;
            userId = response.body.user.id;
        });

        test('POST /api/auth/register should validate input', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    email: 'invalid-email',
                    password: '123'
                })
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('Validation errors');
        });

        test('POST /api/auth/login should authenticate user', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'test@example.com',
                    password: 'TestPassword123'
                })
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.token).toBeDefined();
        });

        test('POST /api/auth/login should validate input', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'invalid-email',
                    password: ''
                })
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('Validation errors');
        });

        test('GET /api/auth/me should return current user', async () => {
            const response = await request(app)
                .get('/api/auth/me')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.user.email).toBe('test@example.com');
        });
    });

    describe('Protected Routes', () => {
        test('GET /api/tasks should require authentication', async () => {
            const response = await request(app)
                .get('/api/tasks')
                .expect(401);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('No token provided');
        });
    });

    describe('Task Management', () => {
        test('POST /api/tasks should create a new task', async () => {
            const taskData = {
                title: 'Test Task',
                description: 'This is a test task',
                priority: 'high',
                status: 'pending'
            };

            const response = await request(app)
                .post('/api/tasks')
                .set('Authorization', `Bearer ${authToken}`)
                .send(taskData)
                .expect(201);

            expect(response.body.success).toBe(true);
            expect(response.body.task.title).toBe(taskData.title);
            expect(response.body.task.creator).toBeDefined();

            taskId = response.body.task._id;
        });

        test('GET /api/tasks should return user tasks', async () => {
            const response = await request(app)
                .get('/api/tasks')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.tasks).toHaveLength(1);
            expect(response.body.tasks[0].title).toBe('Test Task');
        });

        test('GET /api/tasks/:id should return specific task', async () => {
            const response = await request(app)
                .get(`/api/tasks/${taskId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.task.title).toBe('Test Task');
        });

        test('PUT /api/tasks/:id should update task', async () => {
            const updateData = {
                title: 'Updated Test Task',
                status: 'completed'
            };

            const response = await request(app)
                .put(`/api/tasks/${taskId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send(updateData)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.task.title).toBe(updateData.title);
            expect(response.body.task.status).toBe(updateData.status);
        });

        test('DELETE /api/tasks/:id should delete task', async () => {
            const response = await request(app)
                .delete(`/api/tasks/${taskId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('Task deleted successfully');
        });

        test('POST /api/tasks should validate task data', async () => {
            const response = await request(app)
                .post('/api/tasks')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    title: '', // Invalid: empty title
                    priority: 'invalid' // Invalid: not in enum
                })
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('Validation errors');
        });
    });

    describe('Rate Limiting', () => {
        test('Should apply rate limiting to auth endpoints', async () => {
            // Make multiple requests to test rate limiting
            const promises = [];
            for (let i = 0; i < 7; i++) {
                promises.push(
                    request(app)
                        .post('/api/auth/login')
                        .send({
                            email: 'test@example.com',
                            password: 'wrong-password'
                        })
                );
            }

            const results = await Promise.all(promises);

            // Some requests should be rate limited
            const rateLimitedRequests = results.filter(res => res.status === 429);
            expect(rateLimitedRequests.length).toBeGreaterThan(0);
        });
    });
});
