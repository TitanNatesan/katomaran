'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useSocket } from '@/components/providers/SocketProvider'
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

export function TaskList({ filters }) {
  const { data: session } = useSession()
  const socket = useSocket()
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch tasks from backend
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true)
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/tasks`,
          {
            headers: {
              Authorization: `Bearer ${session?.backendToken}`,
            },
          }
        )
        setTasks(response.data.tasks || [])
        setError(null)
      } catch (error) {
        console.error('Error fetching tasks:', error)
        setError('Failed to load tasks')
        toast.error('Failed to load tasks')
      } finally {
        setLoading(false)
      }
    }

    if (session?.backendToken) {
      fetchTasks()
    }
  }, [session?.backendToken])

  // Socket.io real-time updates
  useEffect(() => {
    if (!socket) return

    const handleTaskCreated = (newTask) => {
      setTasks((prev) => [newTask, ...prev])
      toast.success('New task created!')
    }

    const handleTaskUpdated = (updatedTask) => {
      setTasks((prev) =>
        prev.map((task) =>
          task._id === updatedTask._id ? updatedTask : task
        )
      )
      toast.info('Task updated!')
    }

    const handleTaskDeleted = (taskId) => {
      setTasks((prev) => prev.filter((task) => task._id !== taskId))
      toast.info('Task deleted!')
    }

    socket.on('taskCreated', handleTaskCreated)
    socket.on('taskUpdated', handleTaskUpdated)
    socket.on('taskDeleted', handleTaskDeleted)

    return () => {
      socket.off('taskCreated', handleTaskCreated)
      socket.off('taskUpdated', handleTaskUpdated)
      socket.off('taskDeleted', handleTaskDeleted)
    }
  }, [socket])

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
      // Task will be removed via socket update
    } catch (error) {
      console.error('Error deleting task:', error)
      toast.error('Failed to delete task')
    }
  }

  const handleUpdateTaskStatus = async (taskId, newStatus) => {
    try {
      await axios.patch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/tasks/${taskId}`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${session?.backendToken}`,
          },
        }
      )
      // Task will be updated via socket update
    } catch (error) {
      console.error('Error updating task:', error)
      toast.error('Failed to update task')
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
      case 'in_progress':
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
          <div key={i} className="animate-pulse">
            <div className="bg-gray-200 h-24 rounded-lg"></div>
          </div>
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
    <div className="space-y-4">
      {filteredTasks.map((task) => (
        <div
          key={task._id}
          className={`bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow ${
            isOverdue(task.dueDate, task.status) ? 'border-red-200' : 'border-gray-200'
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
                className={`p-2 rounded-full hover:bg-gray-100 ${
                  task.status === 'completed' ? 'text-green-600' : 'text-gray-400'
                }`}
                title={task.status === 'completed' ? 'Mark as pending' : 'Mark as completed'}
              >
                <CheckCircleIcon className="h-5 w-5" />
              </button>
              
              <button
                onClick={() => {/* TODO: Implement edit */}}
                className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-blue-600"
                title="Edit task"
              >
                <PencilIcon className="h-5 w-5" />
              </button>
              
              <button
                onClick={() => handleDeleteTask(task._id)}
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
  )
}
