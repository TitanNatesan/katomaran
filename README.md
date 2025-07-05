# Katomaran Task Management Application

A full-stack task management application built with React and Node.js, featuring OAuth authentication, real-time updates, and modern UI design.

## 🏆 Hackathon Project

This project was developed as part of a hackathon challenge with the following key features:
- **OAuth Authentication**: GitHub and Google OAuth integration
- **Real-time Updates**: Socket.io for live task synchronization
- **Modern UI**: React with responsive design
- **Secure Backend**: JWT authentication and rate limiting
- **Production Ready**: Deployed on Render (backend) and Vercel (frontend)

## 🚀 Live Deployment

- **Frontend**: https://katomaran-todo-josh.vercel.app
- **Backend**: https://katomaran-yy6g.onrender.com
- **Health Check**: https://katomaran-yy6g.onrender.com/api/health
 
## 📋 Features

### Authentication
- ✅ GitHub OAuth integration
- ✅ Google OAuth integration
- ✅ JWT-based authentication
- ✅ Secure session management

### Task Management
- ✅ Create, read, update, delete tasks
- ✅ Task prioritization and categorization
- ✅ Real-time updates across clients
- ✅ Responsive task dashboard

### Technical Features
- ✅ CORS properly configured for production
- ✅ Rate limiting and security middleware
- ✅ Error handling and logging
- ✅ Environment-based configuration
- ✅ MongoDB database integration

## 🛠️ Technology Stack

### Frontend
- **React 18** - Modern React with hooks
- **Vite** - Fast build tool and dev server
- **React Router** - Client-side routing
- **Axios** - HTTP client for API calls
- **Socket.io Client** - Real-time communication
- **CSS3** - Custom styling with responsive design

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **Socket.io** - Real-time bidirectional communication
- **Passport.js** - Authentication middleware
- **JWT** - JSON Web Tokens
- **Winston** - Logging library

## 🔐 OAuth Configuration

Both GitHub and Google OAuth are fully configured and production-ready:

### GitHub OAuth
- **Client ID**: Set in environment variables
- **Callback URL**: `https://katomaran-yy6g.onrender.com/api/auth/github/callback`
- **Scopes**: `user:email`

### Google OAuth
- **Client ID**: Set in environment variables
- **Callback URL**: `https://katomaran-yy6g.onrender.com/api/auth/google/callback`
- **Scopes**: `profile email`

> ⚠️ **Security Note**: OAuth credentials are stored securely in environment variables. See `SECURITY.md` for setup instructions.

## 🌐 CORS Configuration

CORS is properly configured to allow requests from:
- Production frontend: `https://katomaran-todo-josh.vercel.app`
- Local development: `http://localhost:5173`
- Additional origins: `http://localhost:3000`

## 📁 Project Structure

```
katomaran/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API service layer
│   │   └── utils/          # Utility functions
│   ├── public/             # Static assets
│   └── package.json
├── backend/                 # Node.js backend application
│   ├── config/             # Database and passport configuration
│   ├── controllers/        # Route controllers
│   ├── middleware/         # Custom middleware
│   ├── models/             # Mongoose models
│   ├── routes/             # API routes
│   ├── socket/             # Socket.io handlers
│   ├── utils/              # Utility functions
│   └── package.json
├── deployment-health-check.js # Deployment verification script
├── OAUTH_DEPLOYMENT_GUIDE.md  # Comprehensive deployment guide
└── README.md               # This file
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB database
- GitHub OAuth app
- Google OAuth app

### Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd katomaran
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Configure your environment variables
   npm start
   ```

3. **Setup Frontend**
   ```bash
   cd frontend
   npm install
   cp .env.example .env.local
   # Configure your environment variables
   npm run dev
   ```

4. **Access the application**
   - Frontend: http://localhost:5173
   - Backend: http://localhost:5000
   - Health Check: http://localhost:5000/api/health

## 🔧 Environment Variables

### Backend (.env)
```env
NODE_ENV=development
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
FRONTEND_URL=http://localhost:5173
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### Frontend (.env.local)
```env
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_SOCKET_URL=http://localhost:5000
```

## 🚀 Deployment

This application is deployed using:
- **Backend**: Render (https://render.com)
- **Frontend**: Vercel (https://vercel.com)

For detailed deployment instructions, see [OAUTH_DEPLOYMENT_GUIDE.md](./OAUTH_DEPLOYMENT_GUIDE.md)

## 🧪 Testing

Run the deployment health check:
```bash
node deployment-health-check.js
```

This will verify:
- ✅ Backend health endpoint
- ✅ OAuth endpoints functionality
- ✅ Frontend accessibility
- ✅ CORS configuration

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/github` - GitHub OAuth
- `GET /api/auth/google` - Google OAuth
- `GET /api/auth/me` - Get current user

### Tasks
- `GET /api/tasks` - Get all tasks
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

### Health
- `GET /api/health` - Health check endpoint

## 🔐 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Rate Limiting**: Prevents abuse and DDoS attacks
- **CORS Protection**: Properly configured for production
- **Input Validation**: Validates all user inputs
- **Error Handling**: Comprehensive error handling and logging
- **Environment Variables**: Sensitive data properly secured

## 🎨 UI/UX Features

- **Responsive Design**: Works on all device sizes
- **Modern UI**: Clean and intuitive interface
- **Real-time Updates**: Live task synchronization
- **OAuth Integration**: Easy social login
- **Error Handling**: User-friendly error messages
- **Loading States**: Proper loading indicators

## 📈 Performance

- **Vite**: Fast frontend build and development
- **Socket.io**: Efficient real-time communication
- **MongoDB**: Optimized database queries
- **CDN**: Static assets served via CDN
- **Caching**: Proper HTTP caching headers

## 🐛 Known Issues

All major issues have been resolved:
- ✅ CORS configuration fixed
- ✅ OAuth authentication working
- ✅ Environment variables properly configured
- ✅ Production deployment successful

## 📞 Support

For issues or questions:
1. Check the [deployment guide](./OAUTH_DEPLOYMENT_GUIDE.md)
2. Run the health check script
3. Check browser console for errors
4. Verify environment variables are set correctly

## 📝 License

This project is licensed under the MIT License.

## 🎯 Hackathon Achievements

- ✅ Full OAuth integration (GitHub + Google)
- ✅ Real-time task management
- ✅ Production-ready deployment
- ✅ Comprehensive error handling
- ✅ Modern UI/UX design
- ✅ Security best practices
- ✅ Complete documentation

---

**Built with ❤️ for the hackathon challenge**
