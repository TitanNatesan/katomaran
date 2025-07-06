# Katomaran Backend

A professional-grade backend for task management application built with Node.js, Express.js, and MongoDB.

## Features

- **User Authentication**: JWT, Google OAuth, and GitHub OAuth authentication
- **Task Management**: Complete CRUD operations for tasks
- **Task Sharing**: Share tasks with other users
- **Security**: Rate limiting, input validation, and secure password hashing
- **Professional Structure**: Modular architecture with proper error handling and logging

## Tech Stack

- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT, Google OAuth, GitHub OAuth
- **Real-time**: REST API only
- **Security**: express-rate-limit, express-validator, bcryptjs
- **Logging**: Winston
- **Testing**: Jest, Supertest
- **Utilities**: cors, dotenv

## Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
```

3. Update the `.env` file with your configuration:
```
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/katomaran
JWT_SECRET=your_jwt_secret_key_here
GOOGLE_CLIENT_ID=your_google_client_id_here
FRONTEND_URL=http://localhost:3000
```

4. Start the development server:
```bash
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/google` - Google OAuth login
- `GET /api/auth/me` - Get current user

### Tasks
- `GET /api/tasks` - Get all tasks (with pagination and filters)
- `POST /api/tasks` - Create new task
- `GET /api/tasks/:id` - Get single task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `POST /api/tasks/:id/share` - Share task with users

### System
- `GET /api/health` - Health check endpoint

## Request/Response Examples

### Register User
```bash
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePassword123"
}
```

Response:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "64f1b2c3d4e5f6a7b8c9d0e1",
    "email": "john@example.com",
    "name": "John Doe"
  }
}
```

### Create Task
```bash
POST /api/tasks
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "title": "Complete project documentation",
  "description": "Write comprehensive documentation for the project",
  "dueDate": "2024-12-31T23:59:59Z",
  "priority": "high",
  "status": "pending"
}
```

Response:
```json
{
  "success": true,
  "task": {
    "_id": "64f1b2c3d4e5f6a7b8c9d0e2",
    "title": "Complete project documentation",
    "description": "Write comprehensive documentation for the project",
    "dueDate": "2024-12-31T23:59:59.000Z",
    "priority": "high",
    "status": "pending",
    "creator": {
      "_id": "64f1b2c3d4e5f6a7b8c9d0e1",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "sharedWith": [],
    "createdAt": "2024-07-05T10:30:00.000Z",
    "updatedAt": "2024-07-05T10:30:00.000Z"
  }
}
```

### Get Tasks with Filters
```bash
GET /api/tasks?status=pending&priority=high&page=1&limit=10&search=documentation
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Response:
```json
{
  "success": true,
  "tasks": [
    {
      "_id": "64f1b2c3d4e5f6a7b8c9d0e2",
      "title": "Complete project documentation",
      "description": "Write comprehensive documentation for the project",
      "dueDate": "2024-12-31T23:59:59.000Z",
      "priority": "high",
      "status": "pending",
      "creator": {
        "_id": "64f1b2c3d4e5f6a7b8c9d0e1",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "sharedWith": [],
      "createdAt": "2024-07-05T10:30:00.000Z",
      "updatedAt": "2024-07-05T10:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "pages": 1
  }
}
```

## Project Structure

```
├── config/
│   ├── database.js      # MongoDB connection
│   └── logger.js        # Winston logger configuration
├── controllers/
│   ├── authController.js    # Authentication logic
│   └── taskController.js    # Task management logic
├── middleware/
│   ├── auth.js              # JWT authentication middleware
│   ├── errorHandler.js      # Global error handler
│   └── rateLimiter.js       # Rate limiting configuration
├── models/
│   ├── User.js              # User schema
│   └── Task.js              # Task schema
├── routes/
│   ├── auth.js              # Authentication routes
│   └── tasks.js             # Task routes
├── socket/
│   └── socketHandler.js     # Socket.io configuration
├── utils/
│   ├── jwt.js               # JWT utilities
│   └── taskUtils.js         # Task utility functions
├── validators/
│   ├── authValidator.js     # Authentication validation
│   └── taskValidator.js     # Task validation
├── tests/
│   └── api.test.js          # API tests
├── logs/                    # Log files
├── .env                     # Environment variables
├── .gitignore
├── index.js                 # Main application file
└── package.json
```

## Security Features

- **Rate Limiting**: Prevents abuse with configurable limits
  - General endpoints: 100 requests per 15 minutes
  - Auth endpoints: 5 requests per 15 minutes
- **Input Validation**: Comprehensive validation using express-validator
- **Password Hashing**: Secure password storage with bcryptjs (salt rounds: 12)
- **JWT Authentication**: Secure token-based authentication with 7-day expiry
- **Error Handling**: Proper error responses without exposing sensitive data
- **CORS**: Configured to allow requests only from specified frontend URLs

## Real-time Features

- **WebSocket Support**: Real-time task updates using Socket.io
- **User Rooms**: Users automatically join their personal rooms
- **Task Rooms**: Join specific task rooms for real-time updates
- **Event Broadcasting**: Automatic event broadcasting for task changes
- **Typing Indicators**: Real-time typing indicators for collaborative editing
- **User Presence**: Online/offline status updates

## Database Schema

### User Model
```javascript
{
  email: String (required, unique),
  password: String (required for local auth),
  googleId: String (optional for Google OAuth),
  name: String (required),
  avatar: String (optional),
  createdAt: Date
}
```

### Task Model
```javascript
{
  title: String (required, max 200 chars),
  description: String (optional, max 1000 chars),
  dueDate: Date (optional),
  priority: String (enum: ['low', 'medium', 'high'], default: 'medium'),
  status: String (enum: ['pending', 'in progress', 'completed'], default: 'pending'),
  creator: ObjectId (ref: User, required),
  sharedWith: [ObjectId] (ref: User, default: []),
  createdAt: Date,
  updatedAt: Date
}
```

## Development

```bash
# Start development server with nodemon
npm run dev

# Start production server
npm start

# Run tests
npm test

# Run tests with coverage
npm run test -- --coverage
```

## Testing

The project includes comprehensive API tests using Jest and Supertest:

- Authentication tests (register, login, Google OAuth)
- Task management tests (CRUD operations)
- Rate limiting tests
- Input validation tests
- Error handling tests

Run tests with:
```bash
npm test
```

## Environment Variables

| Variable           | Description               | Default                 |
| ------------------ | ------------------------- | ----------------------- |
| `NODE_ENV`         | Environment mode          | `development`           |
| `PORT`             | Server port               | `5000`                  |
| `MONGO_URI`        | MongoDB connection string | Required                |
| `JWT_SECRET`       | JWT secret key            | Required                |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID    | Required                |
| `FRONTEND_URL`     | Frontend URL for CORS     | `http://localhost:3000` |

## Error Handling

The application includes comprehensive error handling:

- **Validation Errors**: Detailed validation error messages
- **Authentication Errors**: Proper JWT error handling
- **Database Errors**: MongoDB-specific error handling
- **Global Error Handler**: Centralized error processing
- **Logging**: All errors are logged with Winston

## Logging

Winston is configured for comprehensive logging:

- **Error Logs**: `logs/error.log`
- **Combined Logs**: `logs/combined.log`
- **Console Logs**: Development environment only
- **Structured Logging**: JSON format with timestamps

## Socket.io Events

### Client to Server Events
- `joinTaskRoom(taskId)` - Join a task room for real-time updates
- `leaveTaskRoom(taskId)` - Leave a task room
- `taskUpdate(data)` - Send task update
- `startTyping(data)` - Start typing indicator
- `stopTyping(data)` - Stop typing indicator
- `userActive()` - User is active

### Server to Client Events
- `connected(data)` - Welcome message on connection
- `taskCreated(data)` - New task created
- `taskUpdated(data)` - Task updated
- `taskDeleted(data)` - Task deleted
- `taskShared(data)` - Task shared
- `userTyping(data)` - User is typing
- `userStoppedTyping(data)` - User stopped typing
- `userOnline(data)` - User came online
- `userOffline(data)` - User went offline

## Production Deployment

1. Set `NODE_ENV=production` in environment variables
2. Use a production-grade MongoDB instance
3. Configure proper CORS settings
4. Set up proper SSL/TLS certificates
5. Use a process manager like PM2
6. Configure proper logging and monitoring

## Contributing

1. Follow the existing code structure and patterns
2. Add proper error handling and logging
3. Include input validation for new endpoints
4. Update documentation for new features
5. Add tests for new functionality
6. Follow ESLint and Prettier configurations

## License

MIT License - see LICENSE file for details.
