import { useEffect } from 'react';
import { socketService } from '../services/socketService';
import { useAuth } from '../context/AuthContext';
import { useTasks } from '../context/TaskContext';

export const useSocket = () => {
    const { token, isAuthenticated } = useAuth();
    const { handleTaskCreated, handleTaskUpdated, handleTaskDeleted } = useTasks();

    useEffect(() => {
        if (isAuthenticated && token) {
            // Connect to socket
            const socket = socketService.connect(token);

            // Listen for task events
            socket.on('taskCreated', handleTaskCreated);
            socket.on('taskUpdated', handleTaskUpdated);
            socket.on('taskDeleted', ({ taskId }) => handleTaskDeleted(taskId));

            return () => {
                socket.off('taskCreated', handleTaskCreated);
                socket.off('taskUpdated', handleTaskUpdated);
                socket.off('taskDeleted', handleTaskDeleted);
                socketService.disconnect();
            };
        }
    }, [isAuthenticated, token, handleTaskCreated, handleTaskUpdated, handleTaskDeleted]);

    return socketService;
};
