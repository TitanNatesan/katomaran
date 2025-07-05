# 🚀 Katomaran Task Management Application

A **professional-grade**, full-stack task management application built with modern technologies and best practices.

## ✨ Features

### 🔐 **Authentication**
- **Local Authentication** with JWT tokens
- **Google OAuth** integration ready
- **Secure password** requirements and validation
- **Protected routes** and automatic token refresh

### 📝 **Task Management**
- **Full CRUD operations** (Create, Read, Update, Delete)
- **Task sharing** between multiple users
- **Priority levels** (Low, Medium, High)
- **Status tracking** (Pending, In Progress, Completed)
- **Due date management** with overdue notifications
- **Search and filtering** capabilities
- **Real-time updates** via WebSocket

### 🎨 **User Interface**
- **Modern, responsive design** with Tailwind CSS
- **Shadcn UI components** for professional appearance
- **Mobile-friendly** interface
- **Toast notifications** for user feedback
- **Loading states** and error handling
- **Dark/light theme** support ready

### ⚡ **Real-time Features**
- **Socket.io integration** for live updates
- **Instant notifications** when tasks are created, updated, or deleted
- **Multi-user collaboration** with real-time synchronization

## 🛠️ **Technology Stack**

### **Backend**
- **Node.js** with Express.js framework
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **Socket.io** for real-time communication
- **Winston** for logging
- **Jest** for testing
- **Rate limiting** and security middleware

### **Frontend**
- **React 19** with Vite
- **Tailwind CSS** for styling
- **Shadcn UI** component library
- **React Router** for navigation
- **Axios** for API calls
- **Socket.io-client** for real-time updates
- **React Toastify** for notifications
- **Google OAuth** integration

## 🚀 **Getting Started**

### **Prerequisites**
- Node.js (v16 or higher)
- MongoDB (local or cloud)
- Git

### **Backend Setup**

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment variables:**
   Create a `.env` file in the backend directory:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_super_secret_jwt_key
   GOOGLE_CLIENT_ID=your_google_client_id
   FRONTEND_URL=http://localhost:5173
   ```

4. **Start the backend server:**
   ```bash
   npm start          # Production
   npm run dev        # Development with nodemon
   npm test          # Run tests
   ```

### **Frontend Setup**

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment variables:**
   Create a `.env` file in the frontend directory:
   ```env
   VITE_API_URL=http://localhost:5000/api
   VITE_GOOGLE_CLIENT_ID=your_google_client_id
   VITE_SOCKET_URL=http://localhost:5000
   ```

4. **Start the frontend development server:**
   ```bash
   npm run dev        # Development server
   npm run build      # Production build
   npm run preview    # Preview production build
   ```

## 📁 **Project Structure**

```
katomaran/
├── backend/                 # Backend API server
│   ├── config/             # Database and logger configuration
│   ├── controllers/        # Route handlers and business logic
│   ├── middleware/         # Authentication, validation, error handling
│   ├── models/            # MongoDB schemas
│   ├── routes/            # API route definitions
│   ├── socket/            # Socket.io handlers
│   ├── tests/             # Test suites
│   ├── utils/             # Utility functions
│   └── validators/        # Input validation rules
│
├── frontend/               # React frontend application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Main application pages
│   │   ├── context/       # React Context for state management
│   │   ├── hooks/         # Custom React hooks
│   │   ├── services/      # API and WebSocket services
│   │   └── utils/         # Utility functions
│   └── public/            # Static assets
```

## 🔌 **API Endpoints**

### **Authentication**
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/google` - Google OAuth login
- `GET /api/auth/me` - Get current user

### **Tasks**
- `GET /api/tasks` - Get user tasks (with filtering)
- `POST /api/tasks` - Create new task
- `GET /api/tasks/:id` - Get specific task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `POST /api/tasks/:id/share` - Share task with users

### **Health Check**
- `GET /api/health` - Server health status

## 🧪 **Testing**

### **Backend Tests**
```bash
cd backend
npm test
```

**Test Coverage:**
- ✅ Authentication flow
- ✅ Task CRUD operations
- ✅ Input validation
- ✅ Rate limiting
- ✅ Error handling
- ✅ Real-time functionality

## 🔒 **Security Features**

- **JWT authentication** with secure token handling
- **Password hashing** with bcrypt (12 rounds)
- **Rate limiting** (100 requests per 15 minutes)
- **Input validation** and sanitization
- **CORS configuration** for secure cross-origin requests
- **Environment variable** protection
- **Error handling** without information leakage

## 🌐 **Deployment**

### **Backend Deployment**
1. Set environment variables in production
2. Configure MongoDB connection
3. Enable HTTPS
4. Set up process management (PM2)
5. Configure reverse proxy (Nginx)

### **Frontend Deployment**
1. Build for production: `npm run build`
2. Deploy to static hosting (Vercel, Netlify)
3. Configure environment variables
4. Set up custom domain

## 📊 **Performance**

- **Database indexing** for optimal queries
- **Pagination** for large datasets
- **Efficient MongoDB** queries
- **Real-time updates** without polling
- **Optimized bundle** size with Vite
- **Lazy loading** components

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 **License**

This project is licensed under the MIT License.

## 🆘 **Support**

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Review the test files for examples

---

## 🎯 **Current Status**

✅ **Backend API** - Fully functional with all endpoints  
✅ **Frontend Interface** - Modern React application  
✅ **Real-time Features** - Socket.io integration complete  
✅ **Authentication** - JWT and Google OAuth ready  
✅ **Database** - MongoDB with proper indexing  
✅ **Testing** - Comprehensive test suite  
✅ **Documentation** - Complete setup and API docs  

**The application is production-ready and fully functional!** 🚀
