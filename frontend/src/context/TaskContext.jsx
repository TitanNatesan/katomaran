import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { taskService } from '../services/taskService';
import { useAuth } from './AuthContext';
import { toast } from 'react-toastify';

const TaskContext = createContext();

const taskReducer = (state, action) => {
    switch (action.type) {
        case 'SET_LOADING':
            return {
                ...state,
                loading: action.payload,
            };
        case 'SET_TASKS':
            return {
                ...state,
                tasks: action.payload.tasks,
                pagination: action.payload.pagination,
                loading: false,
            };
        case 'ADD_TASK':
            return {
                ...state,
                tasks: [action.payload, ...state.tasks],
            };
        case 'UPDATE_TASK':
            return {
                ...state,
                tasks: state.tasks.map(task =>
                    task._id === action.payload._id ? action.payload : task
                ),
            };
        case 'DELETE_TASK':
            return {
                ...state,
                tasks: state.tasks.filter(task => task._id !== action.payload),
            };
        case 'SET_FILTERS':
            return {
                ...state,
                filters: { ...state.filters, ...action.payload },
            };
        case 'SET_ERROR':
            return {
                ...state,
                error: action.payload,
                loading: false,
            };
        default:
            return state;
    }
};

const initialState = {
    tasks: [],
    pagination: null,
    filters: {
        status: '',
        priority: '',
        search: '',
        page: 1,
        limit: 10,
    },
    loading: false,
    error: null,
};

export const TaskProvider = ({ children }) => {
    const [state, dispatch] = useReducer(taskReducer, initialState);
    const { isAuthenticated } = useAuth();

    useEffect(() => {
        if (isAuthenticated) {
            fetchTasks();
        }
    }, [isAuthenticated, state.filters]);

    const fetchTasks = async () => {
        try {
            dispatch({ type: 'SET_LOADING', payload: true });
            const data = await taskService.getTasks(state.filters);
            dispatch({ type: 'SET_TASKS', payload: data });
        } catch (error) {
            dispatch({ type: 'SET_ERROR', payload: error.message });
            toast.error('Failed to fetch tasks');
        }
    };

    const createTask = async (taskData) => {
        try {
            const task = await taskService.createTask(taskData);
            dispatch({ type: 'ADD_TASK', payload: task });
            toast.success('Task created successfully');
            return task;
        } catch (error) {
            toast.error('Failed to create task');
            throw error;
        }
    };

    const updateTask = async (id, taskData) => {
        try {
            const task = await taskService.updateTask(id, taskData);
            dispatch({ type: 'UPDATE_TASK', payload: task });
            toast.success('Task updated successfully');
            return task;
        } catch (error) {
            toast.error('Failed to update task');
            throw error;
        }
    };

    const deleteTask = async (id) => {
        try {
            await taskService.deleteTask(id);
            dispatch({ type: 'DELETE_TASK', payload: id });
            toast.success('Task deleted successfully');
        } catch (error) {
            toast.error('Failed to delete task');
            throw error;
        }
    };

    const shareTask = async (id, userEmails) => {
        try {
            const task = await taskService.shareTask(id, userEmails);
            dispatch({ type: 'UPDATE_TASK', payload: task });
            toast.success('Task shared successfully');
            return task;
        } catch (error) {
            toast.error('Failed to share task');
            throw error;
        }
    };

    const setFilters = (filters) => {
        dispatch({ type: 'SET_FILTERS', payload: filters });
    };

    // Real-time task updates
    const handleTaskCreated = (task) => {
        dispatch({ type: 'ADD_TASK', payload: task });
        toast.info('New task received');
    };

    const handleTaskUpdated = (task) => {
        dispatch({ type: 'UPDATE_TASK', payload: task });
        toast.info('Task updated');
    };

    const handleTaskDeleted = (taskId) => {
        dispatch({ type: 'DELETE_TASK', payload: taskId });
        toast.info('Task deleted');
    };

    const value = {
        ...state,
        createTask,
        updateTask,
        deleteTask,
        shareTask,
        setFilters,
        fetchTasks,
        handleTaskCreated,
        handleTaskUpdated,
        handleTaskDeleted,
    };

    return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
};

export const useTasks = () => {
    const context = useContext(TaskContext);
    if (!context) {
        throw new Error('useTasks must be used within a TaskProvider');
    }
    return context;
};
