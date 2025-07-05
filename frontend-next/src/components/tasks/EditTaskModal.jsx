'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useForm } from 'react-hook-form'
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import axios from 'axios'
import { toast } from 'react-toastify'

export function EditTaskModal({ isOpen, onClose, task, onTaskUpdated }) {
    const { data: session } = useSession()
    const [loading, setLoading] = useState(false)

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        setValue
    } = useForm({
        defaultValues: {
            title: '',
            description: '',
            priority: 'medium',
            dueDate: '',
            sharedWith: ''
        }
    })

    // Update form values when task changes
    useEffect(() => {
        if (task) {
            setValue('title', task.title || '')
            setValue('description', task.description || '')
            setValue('priority', task.priority || 'medium')
            setValue('dueDate', task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '')
            setValue('sharedWith', task.sharedWith || '')
        }
    }, [task, setValue])

    const onSubmit = async (data) => {
        try {
            setLoading(true)

            // Format the data for the backend
            const taskData = {
                title: data.title,
                description: data.description,
                priority: data.priority,
                dueDate: data.dueDate || null,
                sharedWith: data.sharedWith || null
            }

            const response = await axios.put(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/tasks/${task.id}`,
                taskData,
                {
                    headers: {
                        Authorization: `Bearer ${session?.backendToken}`,
                        'Content-Type': 'application/json',
                    },
                }
            )

            // If sharing with someone, make a separate share request
            if (data.sharedWith && data.sharedWith !== task.sharedWith) {
                try {
                    await axios.post(
                        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/tasks/${task.id}/share`,
                        { email: data.sharedWith },
                        {
                            headers: {
                                Authorization: `Bearer ${session?.backendToken}`,
                                'Content-Type': 'application/json',
                            },
                        }
                    )
                } catch (shareError) {
                    console.error('Error sharing task:', shareError)
                    toast.warn('Task updated but sharing failed')
                }
            }

            toast.success('Task updated successfully!')
            onTaskUpdated(response.data.task)
            onClose()
        } catch (error) {
            console.error('Error updating task:', error)
            if (error.response?.data?.message) {
                toast.error(error.response.data.message)
            } else {
                toast.error('Failed to update task')
            }
        } finally {
            setLoading(false)
        }
    }

    const handleClose = () => {
        reset()
        onClose()
    }

    if (!task) return null

    return (
        <Dialog open={isOpen} onClose={handleClose} className="relative z-50">
            <div className="fixed inset-0 bg-black/25" />

            <div className="fixed inset-0 flex items-center justify-center p-4">
                <DialogPanel className="mx-auto max-w-lg w-full bg-white rounded-lg shadow-lg">
                    <div className="flex items-center justify-between p-6 border-b">
                        <DialogTitle as="h3" className="text-lg font-semibold text-gray-900">
                            Edit Task
                        </DialogTitle>
                        <button
                            onClick={handleClose}
                            className="text-gray-400 hover:text-gray-500 transition-colors"
                        >
                            <XMarkIcon className="h-6 w-6" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
                        {/* Title */}
                        <div>
                            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                                Title *
                            </label>
                            <input
                                type="text"
                                id="title"
                                {...register('title', {
                                    required: 'Title is required',
                                    minLength: { value: 1, message: 'Title must be at least 1 character' },
                                    maxLength: { value: 200, message: 'Title must be less than 200 characters' }
                                })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Enter task title"
                            />
                            {errors.title && (
                                <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                            )}
                        </div>

                        {/* Description */}
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                                Description
                            </label>
                            <textarea
                                id="description"
                                rows={3}
                                {...register('description', {
                                    maxLength: { value: 1000, message: 'Description must be less than 1000 characters' }
                                })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Enter task description"
                            />
                            {errors.description && (
                                <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                            )}
                        </div>

                        {/* Priority */}
                        <div>
                            <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
                                Priority
                            </label>
                            <select
                                id="priority"
                                {...register('priority')}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                            </select>
                        </div>

                        {/* Due Date */}
                        <div>
                            <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-1">
                                Due Date
                            </label>
                            <input
                                type="date"
                                id="dueDate"
                                {...register('dueDate')}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        {/* Share with */}
                        <div>
                            <label htmlFor="sharedWith" className="block text-sm font-medium text-gray-700 mb-1">
                                Share with (email)
                            </label>
                            <input
                                type="email"
                                id="sharedWith"
                                {...register('sharedWith', {
                                    pattern: {
                                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                        message: 'Please enter a valid email address'
                                    }
                                })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Enter email to share task"
                            />
                            {errors.sharedWith && (
                                <p className="mt-1 text-sm text-red-600">{errors.sharedWith.message}</p>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end space-x-3 pt-4">
                            <button
                                type="button"
                                onClick={handleClose}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {loading ? 'Updating...' : 'Update Task'}
                            </button>
                        </div>
                    </form>
                </DialogPanel>
            </div>
        </Dialog>
    )
}
