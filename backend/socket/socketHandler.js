const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const winston = require('winston');

const initializeSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: process.env.FRONTEND_URL,
            methods: ['GET', 'POST']
        }
    });

    // Socket authentication middleware
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth.token;

            if (!token) {
                return next(new Error('Authentication error'));
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.userId).select('-password');

            if (!user) {
                return next(new Error('User not found'));
            }

            socket.userId = user._id.toString();
            socket.userEmail = user.email;
            next();
        } catch (error) {
            winston.error(`Socket authentication error: ${error.message}`);
            next(new Error('Authentication error'));
        }
    });

    io.on('connection', (socket) => {
        winston.info(`User connected: ${socket.userEmail} (ID: ${socket.userId})`);

        // Join user to their personal room
        socket.join(socket.userId);

        // Send welcome message
        socket.emit('connected', {
            message: 'Connected to Katomaran',
            userId: socket.userId
        });

        // Handle task events
        socket.on('joinTaskRoom', (taskId) => {
            socket.join(`task_${taskId}`);
            winston.info(`User ${socket.userEmail} joined task room: ${taskId}`);
        });

        socket.on('leaveTaskRoom', (taskId) => {
            socket.leave(`task_${taskId}`);
            winston.info(`User ${socket.userEmail} left task room: ${taskId}`);
        });

        // Handle real-time task updates
        socket.on('taskUpdate', (data) => {
            socket.to(`task_${data.taskId}`).emit('taskUpdated', data);
        });

        // Handle typing indicators
        socket.on('startTyping', (data) => {
            socket.to(`task_${data.taskId}`).emit('userTyping', {
                userId: socket.userId,
                userEmail: socket.userEmail,
                taskId: data.taskId
            });
        });

        socket.on('stopTyping', (data) => {
            socket.to(`task_${data.taskId}`).emit('userStoppedTyping', {
                userId: socket.userId,
                taskId: data.taskId
            });
        });

        // Handle user presence
        socket.on('userActive', () => {
            socket.broadcast.emit('userOnline', {
                userId: socket.userId,
                userEmail: socket.userEmail
            });
        });

        socket.on('disconnect', () => {
            winston.info(`User disconnected: ${socket.userEmail}`);

            // Notify other users about disconnection
            socket.broadcast.emit('userOffline', {
                userId: socket.userId,
                userEmail: socket.userEmail
            });
        });
    });

    return io;
};

module.exports = initializeSocket;
