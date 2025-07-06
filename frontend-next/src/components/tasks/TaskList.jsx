'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { EditTaskModal } from './EditTaskModal'
import { ConfirmationDialog } from '@/components/common/ConfirmationDialog'
import { LoadingCard } from '@/components/common/LoadingComponents'
import axios from 'axios'
import { toast } from 'react-toastify'
import {
    PencilIcon,
    TrashIcon,
    CheckCircleIcon,
    XCircleIcon,
    ClockIcon,
    ExclamationCircleIcon
} from '@heroicons/react/24/outline'
import { getAuthToken, getAuthHeaders } from '@/utils/authUtils'

export function TaskList({ filters, onTaskUpdate, onTaskDelete }) {
    const { data: session } = useSession()
    const [tasks, setTasks] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [editingTask, setEditingTask] = useState(null)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [taskToDelete, setTaskToDelete] = useState(null)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [refreshTrigger, setRefreshTrigger] = useState(0)

    // Simple refresh trigger function
    const triggerRefresh = () => {
        console.log('Manually refreshing tasks via trigger');
        setRefreshTrigger(prev => prev + 1);
    };

    // Listen for token storage events
    useEffect(() => {
        const handleTokenStored = () => {
            console.log('Token stored event detected in TaskList');
            triggerRefresh();
        };

        if (typeof window !== 'undefined') {
            window.addEventListener('tokenStored', handleTokenStored);

            return () => {
                window.removeEventListener('tokenStored', handleTokenStored);
            };
        }
    }, []);

    // Fetch tasks from backend
    useEffect(() => {
        const fetchTasks = async () => {
            try {
                setLoading(true)

                // Get token using our utility function
                const backendToken = getAuthToken(session);
                console.log('TaskList - Token status:', !!backendToken);

                if (!backendToken) {
                    console.error('No backend token available for task fetch');
                    setError('Authentication required. Please try logging in again.');
                    setLoading(false);
                    setTasks([]);
                    return;
                }

                // Ensure we have a valid token format before making the request
                if (typeof backendToken !== 'string' || backendToken.trim() === '') {
                    console.error('Invalid token format');
                    setError('Invalid authentication token. Please log in again.');
                    setLoading(false);
                    setTasks([]);
                    return;
                }

                console.log(`Making request to ${process.env.NEXT_PUBLIC_BACKEND_URL}/api/tasks with token`);

                const response = await axios.get(
                    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/tasks`,
                    {
                        headers: getAuthHeaders(backendToken)
                    }
                )
                setTasks(response.data.tasks || [])
                console.log('Fetched tasks:', response.data.tasks)
                setError(null)
            } catch (error) {
                console.error('Error fetching tasks:', error)
                if (error.response?.status === 401) {
                    setError('Authentication failed. Please login again.')
                    toast.error('Authentication failed. Redirecting to login...');
                    // If token exists but is invalid, clear it and redirect
                    if (backendToken) {
                        // Import and use the clearAuthToken utility
                        const { clearAuthToken } = require('@/utils/authUtils');
                        clearAuthToken();
                        // Redirect after a brief delay to show the toast
                        setTimeout(() => {
                            window.location.href = '/login?error=token_expired';
                        }, 1500);
                    }
                } else {
                    setError('Failed to load tasks')
                    toast.error('Failed to load tasks')
                }
            } finally {
                setLoading(false)
            }
        }

        if (session?.user || getAuthToken(session)) {
            fetchTasks()
        }
    }, [session, filters, refreshTrigger])

    // Refresh tasks function for manual updates
    const refreshTasks = async () => {
        try {
            // Get token using our utility function
            const backendToken = getAuthToken(session);

            if (!backendToken) {
                console.error('No authentication token available');
                return;
            }

            const response = await axios.get(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/tasks`,
                {
                    headers: getAuthHeaders(backendToken)
                }
            )
            setTasks(response.data.tasks || [])
            if (onTaskUpdate) onTaskUpdate()
        } catch (error) {
            console.error('Error refreshing tasks:', error)
        }
    }

    // Filter tasks based on filters
    const filteredTasks = tasks.filter((task) => {
        const matchesSearch = !filters.search ||
            task.title.toLowerCase().includes(filters.search.toLowerCase()) ||
            task.description.toLowerCase().includes(filters.search.toLowerCase())

        const matchesStatus = filters.status === 'all' || task.status === filters.status
        const matchesPriority = filters.priority === 'all' || task.priority === filters.priority

        let matchesDueDate = true
        if (filters.dueDate !== 'all') {
            const today = new Date()
            const dueDate = new Date(task.dueDate)

            switch (filters.dueDate) {
                case 'today':
                    matchesDueDate = dueDate.toDateString() === today.toDateString()
                    break
                case 'overdue':
                    matchesDueDate = dueDate < today && task.status !== 'completed'
                    break
                case 'week':
                    const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
                    matchesDueDate = dueDate <= weekFromNow && dueDate >= today
                    break
                default:
                    matchesDueDate = true
            }
        }

        return matchesSearch && matchesStatus && matchesPriority && matchesDueDate
    })

    const handleDeleteTask = async (taskId) => {
        try {
            await axios.delete(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/tasks/${taskId}`,
                {
                    headers: {
                        Authorization: `Bearer ${session?.backendToken}`,
                    },
                }
            )
            toast.success('Task deleted successfully')
            setIsDeleteDialogOpen(false)
            setTaskToDelete(null)
            // Refresh the task list after deletion
            await refreshTasks()
        } catch (error) {
            console.error('Error deleting task:', error)
            toast.error('Failed to delete task')
        }
    }

    const handleDeleteClick = (task) => {
        setTaskToDelete(task)
        setIsDeleteDialogOpen(true)
    }

    const handleConfirmDelete = () => {
        if (taskToDelete) {
            handleDeleteTask(taskToDelete._id)
        }
    }

    const handleEditTask = (task) => {
        setEditingTask(task)
        setIsEditModalOpen(true)
    }

    const handleTaskUpdated = async (updatedTask) => {
        // Refresh the task list after update
        await refreshTasks()
        setEditingTask(null)
        setIsEditModalOpen(false)
        toast.success('Task updated successfully')
    }

    const handleUpdateTaskStatus = async (taskId, newStatus) => {
        try {
            if (!session?.backendToken) {
                toast.error('Please login with email/password to update tasks')
                return
            }

            await axios.patch(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/tasks/${taskId}`,
                { status: newStatus },
                {
                    headers: {
                        Authorization: `Bearer ${session.backendToken}`,
                        'Content-Type': 'application/json'
                    },
                }
            )
            // Refresh the task list after update
            await refreshTasks()
            toast.success('Task status updated!')
        } catch (error) {
            console.error('Error updating task:', error)
            if (error.response?.status === 401) {
                toast.error('Authentication failed. Please login again.')
            } else {
                toast.error('Failed to update task')
            }
        }
    }

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high':
                return 'bg-red-100 text-red-800'
            case 'medium':
                return 'bg-yellow-100 text-yellow-800'
            case 'low':
                return 'bg-green-100 text-green-800'
            default:
                return 'bg-gray-100 text-gray-800'
        }
    }

    const getStatusIcon = (status) => {
        switch (status) {
            case 'completed':
                return <CheckCircleIcon className="h-5 w-5 text-green-500" />
            case 'in progress':
                return <ClockIcon className="h-5 w-5 text-blue-500" />
            case 'pending':
                return <ExclamationCircleIcon className="h-5 w-5 text-yellow-500" />
            default:
                return <XCircleIcon className="h-5 w-5 text-gray-500" />
        }
    }

    const isOverdue = (dueDate, status) => {
        return new Date(dueDate) < new Date() && status !== 'completed'
    }

    if (loading) {
        return (
            <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                    <LoadingCard key={i} />
                ))}
            </div>
        )
    }

    if (error) {
        return (
            <div className="text-center py-8">
                <div className="text-red-600 mb-4">{error}</div>
                <button
                    onClick={() => window.location.reload()}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                    Try Again
                </button>
            </div>
        )
    }

    if (filteredTasks.length === 0) {
        return (
            <div className="text-center py-8">
                <div className="text-gray-500 mb-4">
                    {tasks.length === 0 ? 'No tasks yet' : 'No tasks match your filters'}
                </div>
                <p className="text-gray-400">
                    {tasks.length === 0 ? 'Create your first task to get started!' : 'Try adjusting your filters'}
                </p>
            </div>
        )
    }

    return (
        <>
            <div className="space-y-4">
                {filteredTasks.map((task, i) => (
                    <div
                        key={i}
                        className={`bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow ${isOverdue(task.dueDate, task.status) ? 'border-red-200' : 'border-gray-200'
                            }`}
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <div className="flex items-center space-x-3 mb-2">
                                    {getStatusIcon(task.status)}
                                    <h3 className="text-lg font-medium text-gray-900">
                                        {task.title}
                                    </h3>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                                        {task.priority}
                                    </span>
                                </div>

                                {task.description && (
                                    <p className="text-gray-600 mb-3">{task.description}</p>
                                )}

                                <div className="flex items-center space-x-4 text-sm text-gray-500">
                                    <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                                    <span>Status: {task.status.replace('_', ' ')}</span>
                                    {isOverdue(task.dueDate, task.status) && (
                                        <span className="text-red-600 font-medium">Overdue</span>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => handleUpdateTaskStatus(
                                        task._id,
                                        task.status === 'completed' ? 'pending' : 'completed'
                                    )}
                                    className={`p-2 rounded-full hover:bg-gray-100 ${task.status === 'completed' ? 'text-green-600' : 'text-gray-400'
                                        }`}
                                    title={task.status === 'completed' ? 'Mark as pending' : 'Mark as completed'}
                                >
                                    <CheckCircleIcon className="h-5 w-5" />
                                </button>

                                <button
                                    onClick={() => handleEditTask(task)}
                                    className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-blue-600"
                                    title="Edit task"
                                >
                                    <PencilIcon className="h-5 w-5" />
                                </button>

                                <button
                                    onClick={() => handleDeleteClick(task)}
                                    className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-red-600"
                                    title="Delete task"
                                >
                                    <TrashIcon className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Edit Task Modal */}
            <EditTaskModal
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false)
                    setEditingTask(null)
                }}
                task={editingTask}
                onTaskUpdated={handleTaskUpdated}
            />

            {/* Delete Confirmation Dialog */}
            <ConfirmationDialog
                isOpen={isDeleteDialogOpen}
                onClose={() => {
                    setIsDeleteDialogOpen(false)
                    setTaskToDelete(null)
                }}
                onConfirm={handleConfirmDelete}
                title="Delete Task"
                message={`Are you sure you want to delete "${taskToDelete?.title}"? This action cannot be undone.`}
                confirmText="Delete"
                cancelText="Cancel"
                isDangerous={true}
            />
        </>
    )
}
