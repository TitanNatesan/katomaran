'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useForm } from 'react-hook-form'
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react'
import { Fragment } from 'react'
import { XMarkIcon, PlusCircleIcon, CalendarIcon, ChevronUpIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline'
import axios from 'axios'
import { toast } from 'react-toastify'
import { getAuthToken, getAuthHeaders } from '@/utils/authUtils'

export function CreateTaskModal({ isOpen, onClose, onTaskCreated }) {
    const { data: session } = useSession()
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
                title: data.title,
                description: data.description,
                priority: data.priority,
                status: data.status,
                dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : null,
            };

            // Get token using our utility function once at the beginning
            const backendToken = getAuthToken(session);

            if (!backendToken) {
                toast.error('Authentication token is missing. Please log in again.');
                // Force logout for re-authentication
                window.location.href = '/login?error=token_missing';
                return;
            }

            // Handle sharedWith email
            if (data.sharedWith && data.sharedWith.trim() !== '') {
                try {
                    const userResponse = await axios.get(
                        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/email/${data.sharedWith.trim()}`,
                        {
                            headers: getAuthHeaders(backendToken)
                        }
                    );

                    if (userResponse.data.success) {
                        taskData.sharedWith = [userResponse.data.user._id]; // Set as an array of IDs
                    } else {
                        toast.error(userResponse.data.message || 'User to share with not found.');
                        setIsSubmitting(false);
                        return;
                    }
                } catch (error) {
                    console.error('Error finding user to share with:', error);
                    toast.error(error.response?.data?.message || 'Could not find the user to share with.');
                    setIsSubmitting(false);
                    return;
                }
            }


            await axios.post(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/tasks`,
                taskData,
                {
                    headers: getAuthHeaders(backendToken)
                }
            )

            toast.success('Task created successfully!')
            reset()
            onClose()
            // Notify parent component to refresh tasks
            if (onTaskCreated) {
                onTaskCreated()
            }
        } catch (error) {
            console.error('Error creating task:', error)

            if (error.response?.status === 401) {
                toast.error('Authentication failed. Please login again.')
                // Clear invalid token and redirect
                const { clearAuthToken } = require('@/utils/authUtils');
                clearAuthToken();
                setTimeout(() => {
                    window.location.href = '/login?error=token_expired';
                }, 1500);
            } else if (error.response?.status === 403) {
                toast.error('You are not authorized to create tasks')
            } else if (error.response?.data?.message) {
                toast.error(`Creation failed: ${error.response.data.message}`)
            } else if (error.message === 'Authentication token is missing') {
                toast.error('Please log in to create tasks')
            } else {
                toast.error(`Failed to create task: ${error.message}`)
            }

            // Display validation errors if any
            if (error.response?.data?.errors) {
                error.response.data.errors.forEach(err => {
                    toast.error(`${err.path ? `${err.path}: ` : ''}${err.msg}`)
                });
            }
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleClose = () => {
        reset()
        onClose()
    }

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={handleClose}>
                <TransitionChild
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-blue-50/60 backdrop-blur-sm" />
                </TransitionChild>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <TransitionChild
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <DialogPanel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-7 text-left align-middle shadow-2xl transition-all border border-blue-100">
                                <div className="flex items-center justify-between mb-6 border-b border-blue-100 pb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full shadow-sm">
                                            <PlusCircleIcon className="h-6 w-6 text-blue-600" />
                                        </div>
                                        <DialogTitle
                                            as="h3"
                                            className="text-xl font-semibold leading-6 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"
                                        >
                                            Create New Task
                                        </DialogTitle>
                                    </div>
                                    <button
                                        onClick={handleClose}
                                        className="rounded-full p-2 hover:bg-red-50 transition-colors duration-200 group"
                                    >
                                        <XMarkIcon className="h-5 w-5 text-gray-400 group-hover:text-red-500 transition-colors duration-200" />
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                                    {/* Title */}
                                    <div className="group">
                                        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1.5">
                                            Title <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            {...register('title', {
                                                required: 'Title is required',
                                                minLength: { value: 1, message: 'Title cannot be empty' }
                                            })}
                                            type="text"
                                            className="w-full px-4 py-3 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm hover:border-blue-300 transition-all duration-200"
                                            placeholder="Enter task title"
                                        />
                                        {errors.title && (
                                            <p className="mt-1.5 text-sm text-red-600">{errors.title.message}</p>
                                        )}
                                    </div>

                                    {/* Description */}
                                    <div>
                                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1.5">
                                            Description
                                        </label>
                                        <textarea
                                            {...register('description')}
                                            rows={3}
                                            className="w-full px-4 py-3 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm hover:border-blue-300 transition-all duration-200"
                                            placeholder="Enter task description"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Priority */}
                                        <div>
                                            <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1.5">
                                                Priority <span className="text-red-500">*</span>
                                            </label>
                                            <div className="relative">
                                                <select
                                                    {...register('priority', { required: 'Priority is required' })}
                                                    className="w-full px-4 py-3 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm hover:border-blue-300 transition-all duration-200 appearance-none"
                                                >
                                                    <option value="">Select priority</option>
                                                    <option value="low">Low</option>
                                                    <option value="medium">Medium</option>
                                                    <option value="high">High</option>
                                                </select>
                                                <ChevronUpIcon className="h-5 w-5 text-blue-500 absolute top-1/2 right-3 transform -translate-y-1/2 rotate-180 pointer-events-none" />
                                            </div>
                                            {errors.priority && (
                                                <p className="mt-1.5 text-sm text-red-600">{errors.priority.message}</p>
                                            )}
                                        </div>

                                        {/* Status */}
                                        <div>
                                            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1.5">
                                                Status <span className="text-red-500">*</span>
                                            </label>
                                            <div className="relative">
                                                <select
                                                    {...register('status', { required: 'Status is required' })}
                                                    defaultValue="pending"
                                                    className="w-full px-4 py-3 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm hover:border-blue-300 transition-all duration-200 appearance-none"
                                                >
                                                    <option value="pending">Pending</option>
                                                    <option value="in progress">In Progress</option>
                                                    <option value="completed">Completed</option>
                                                </select>
                                                <ChevronUpIcon className="h-5 w-5 text-blue-500 absolute top-1/2 right-3 transform -translate-y-1/2 rotate-180 pointer-events-none" />
                                            </div>
                                            {errors.status && (
                                                <p className="mt-1.5 text-sm text-red-600">{errors.status.message}</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Due Date */}
                                    <div>
                                        <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-1.5">
                                            Due Date <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
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
                                                className="w-full px-4 py-3 pl-11 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm hover:border-blue-300 transition-all duration-200"
                                            />
                                            <CalendarIcon className="h-5 w-5 text-blue-500 absolute top-1/2 left-3 transform -translate-y-1/2" />
                                        </div>
                                        {errors.dueDate && (
                                            <p className="mt-1.5 text-sm text-red-600">{errors.dueDate.message}</p>
                                        )}
                                    </div>

                                    {/* Share with */}
                                    <div>
                                        <label htmlFor="sharedWith" className="block text-sm font-medium text-gray-700 mb-1.5">
                                            Share with (email)
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="email"
                                                id="sharedWith"
                                                {...register('sharedWith', {
                                                    pattern: {
                                                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                                        message: 'Please enter a valid email address'
                                                    }
                                                })}
                                                className="w-full px-4 py-3 pl-11 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm hover:border-blue-300 transition-all duration-200"
                                                placeholder="Enter email to share task"
                                            />
                                            <PaperAirplaneIcon className="h-5 w-5 text-blue-500 absolute top-1/2 left-3 transform -translate-y-1/2" />
                                        </div>
                                        {errors.sharedWith && (
                                            <p className="mt-1.5 text-sm text-red-600">{errors.sharedWith.message}</p>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex justify-end space-x-3 pt-5 mt-3 border-t border-blue-100">
                                        <button
                                            type="button"
                                            onClick={handleClose}
                                            className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all duration-200"
                                            disabled={isSubmitting}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                                        >
                                            {isSubmitting ? (
                                                <span className="flex items-center">
                                                    <svg className="animate-spin mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
                            </DialogPanel>
                        </TransitionChild>
                    </div>
                </div>
            </Dialog>
        </Transition>
    )
}
