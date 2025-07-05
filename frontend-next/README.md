# Katomaran Task Management - Next.js Frontend

A professional-grade, scalable, and user-friendly task management application built with Next.js, featuring real-time collaboration, OAuth authentication, and modern UI design.

> **This project is a part of a hackathon run by https://www.katomaran.com**

## 🚀 Live Demo

- **Frontend**: https://katomaran-todo-josh.vercel.app
- **Backend**: https://katomaran-yy6g.onrender.com

## ✨ Features

### 🔐 Authentication
- ✅ Google OAuth integration with NextAuth.js
- ✅ Secure session management
- ✅ Protected routes and middleware

### 📋 Task Management
- ✅ Create, read, update, delete tasks
- ✅ Task prioritization (Low, Medium, High)
- ✅ Status tracking (Pending, In Progress, Completed)
- ✅ Due date management with overdue detection
- ✅ Task sharing via email

### 🎨 User Interface
- ✅ Responsive design for desktop and mobile
- ✅ Modern UI with Tailwind CSS
- ✅ Interactive dashboard with task statistics
- ✅ Advanced filtering and search
- ✅ Toast notifications for user feedback

### ⚡ Real-time Features
- ✅ WebSocket integration with Socket.io
- ✅ Real-time task updates without page refresh
- ✅ Live collaboration across multiple clients

### 🛡️ Reliability
- ✅ Error boundaries for graceful error handling
- ✅ Loading states and skeleton screens
- ✅ Offline support with PWA capabilities

## 🛠️ Technology Stack

- **Next.js 15** - React framework with App Router
- **React 19** - UI library with latest features
- **NextAuth.js** - Authentication library
- **Tailwind CSS** - Utility-first CSS framework
- **Headless UI** - Accessible UI components
- **Heroicons** - Beautiful SVG icons
- **Axios** - HTTP client for API requests
- **Socket.io Client** - Real-time communication
- **React Hook Form** - Form validation and handling
- **next-pwa** - Progressive Web App features

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Google OAuth credentials

### 1. Clone and Install

```bash
git clone https://github.com/TitanNatesan/katomaran.git
cd katomaran/frontend-next
npm install
```

### 2. Environment Setup

Create `.env.local` file:

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_key_here
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

### 3. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🏗️ Deploy to Vercel

1. **Connect Repository**:
   - Connect your GitHub repository to Vercel
   - Set root directory to `frontend-next`

2. **Environment Variables**:
   Set these in Vercel dashboard:
   ```env
   NEXTAUTH_URL=https://your-domain.vercel.app
   NEXTAUTH_SECRET=your_production_secret
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   NEXT_PUBLIC_BACKEND_URL=https://katomaran-yy6g.onrender.com
   NEXT_PUBLIC_SOCKET_URL=https://katomaran-yy6g.onrender.com
   ```

3. **Deploy**:
   ```bash
   git push origin main
   ```

## 🎯 Hackathon Submission

### Completed Requirements
- ✅ Social Media Login (Google OAuth)
- ✅ Responsive UI (Mobile & Desktop)
- ✅ Task Dashboard with Filters
- ✅ Task Forms (Create/Edit/Share)
- ✅ Real-time Updates (Socket.io)
- ✅ Toast Messages
- ✅ Error Boundaries
- ✅ Basic Offline Support (PWA)
- ✅ Vercel Deployment
- ✅ GitHub Repository
- ✅ Documentation

---

**Built with ❤️ for the Katomaran hackathon challenge**
