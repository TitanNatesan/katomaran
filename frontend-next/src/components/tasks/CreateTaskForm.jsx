'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import axios from 'axios'
import { toast } from 'react-toastify'
import Link from 'next/link'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'

export function CreateTaskForm() {
  const { data: session } = useSession()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm()

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true)
      
      const taskData = {
        ...data,
        dueDate: new Date(data.dueDate).toISOString(),
      }

      await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/tasks`,
        taskData,
        {
          headers: {
            Authorization: `Bearer ${session?.backendToken}`,
            'Content-Type': 'application/json',
          },
        }
      )

      toast.success('Task created successfully!')
      router.push('/dashboard')
    } catch (error) {
      console.error('Error creating task:', error)
      toast.error('Failed to create task')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex items-center mb-6">
        <Link
          href="/dashboard"
          className="mr-4 p-2 rounded-md hover:bg-gray-100"
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </Link>
        <h2 className="text-lg font-medium text-gray-900">Task Details</h2>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            Title *
          </label>
          <input
            {...register('title', { 
              required: 'Title is required',
              minLength: { value: 1, message: 'Title cannot be empty' }
            })}
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter task title"
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            {...register('description')}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter task description"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Priority */}
          <div>
            <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-2">
              Priority *
            </label>
            <select
              {...register('priority', { required: 'Priority is required' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select priority</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
            {errors.priority && (
              <p className="mt-1 text-sm text-red-600">{errors.priority.message}</p>
            )}
          </div>

          {/* Status */}
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
              Status *
            </label>
            <select
              {...register('status', { required: 'Status is required' })}
              defaultValue="pending"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
            {errors.status && (
              <p className="mt-1 text-sm text-red-600">{errors.status.message}</p>
            )}
          </div>
        </div>

        {/* Due Date */}
        <div>
          <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-2">
            Due Date *
          </label>
          <input
            {...register('dueDate', { 
              required: 'Due date is required',
              validate: (value) => {
                const selectedDate = new Date(value)
                const today = new Date()
                today.setHours(0, 0, 0, 0)
                return selectedDate >= today || 'Due date cannot be in the past'
              }
            })}
            type="date"
            min={new Date().toISOString().split('T')[0]}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {errors.dueDate && (
            <p className="mt-1 text-sm text-red-600">{errors.dueDate.message}</p>
          )}
        </div>

        {/* Share with (optional) */}
        <div>
          <label htmlFor="sharedWith" className="block text-sm font-medium text-gray-700 mb-2">
            Share with (email)
          </label>
          <input
            {...register('sharedWith', {
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Invalid email address'
              }
            })}
            type="email"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter email to share task (optional)"
          />
          {errors.sharedWith && (
            <p className="mt-1 text-sm text-red-600">{errors.sharedWith.message}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-6 border-t">
          <Link
            href="/dashboard"
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating...
              </span>
            ) : (
              'Create Task'
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
