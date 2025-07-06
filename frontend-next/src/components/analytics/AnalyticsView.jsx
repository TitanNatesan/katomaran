'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { getAuthToken, getAuthHeaders } from '@/utils/authUtils'
import axios from 'axios'
import {
    ChartBarIcon,
    CalendarDaysIcon,
    CheckCircleIcon,
    ClockIcon,
    ExclamationTriangleIcon,
    TrophyIcon
} from '@heroicons/react/24/outline'

export function AnalyticsView() {
    const { data: session } = useSession()
    const [analytics, setAnalytics] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                setLoading(true)
                const backendToken = getAuthToken(session)

                if (!backendToken) {
                    setError('Authentication required')
                    return
                }

                const response = await axios.get(
                    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/tasks`,
                    {
                        headers: getAuthHeaders(backendToken)
                    }
                )

                const tasks = response.data.tasks || []

                // Calculate analytics
                const totalTasks = tasks.length
                const completedTasks = tasks.filter(task => task.status === 'completed').length
                const pendingTasks = tasks.filter(task => task.status === 'pending').length
                const inProgressTasks = tasks.filter(task => task.status === 'in progress').length
                const overdueTasks = tasks.filter(task =>
                    new Date(task.dueDate) < new Date() && task.status !== 'completed'
                ).length

                const priorityBreakdown = {
                    high: tasks.filter(task => task.priority === 'high').length,
                    medium: tasks.filter(task => task.priority === 'medium').length,
                    low: tasks.filter(task => task.priority === 'low').length
                }

                const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

                setAnalytics({
                    totalTasks,
                    completedTasks,
                    pendingTasks,
                    inProgressTasks,
                    overdueTasks,
                    priorityBreakdown,
                    completionRate
                })

                setError(null)
            } catch (error) {
                console.error('Error fetching analytics:', error)
                setError('Failed to load analytics')
            } finally {
                setLoading(false)
            }
        }

        if (session?.user || getAuthToken(session)) {
            fetchAnalytics()
        }
    }, [session])

    if (loading) {
        return (
            <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-500 mt-4">Loading analytics...</p>
            </div>
        )
    }

    if (error) {
        return (
            <div className="text-center py-12">
                <div className="text-red-600 mb-4">{error}</div>
            </div>
        )
    }

    const statsCards = [
        {
            title: 'Total Tasks',
            value: analytics.totalTasks,
            icon: ChartBarIcon,
            color: 'blue'
        },
        {
            title: 'Completed',
            value: analytics.completedTasks,
            icon: CheckCircleIcon,
            color: 'green'
        },
        {
            title: 'In Progress',
            value: analytics.inProgressTasks,
            icon: ClockIcon,
            color: 'yellow'
        },
        {
            title: 'Overdue',
            value: analytics.overdueTasks,
            icon: ExclamationTriangleIcon,
            color: 'red'
        }
    ]

    const getColorClasses = (color) => {
        const colors = {
            blue: 'bg-blue-50 text-blue-600 border-blue-200',
            green: 'bg-green-50 text-green-600 border-green-200',
            yellow: 'bg-yellow-50 text-yellow-600 border-yellow-200',
            red: 'bg-red-50 text-red-600 border-red-200'
        }
        return colors[color] || colors.blue
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Task Analytics</h2>
                <p className="text-gray-600">Overview of your task management progress</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statsCards.map((stat, index) => (
                    <div key={index} className={`rounded-lg border p-6 ${getColorClasses(stat.color)}`}>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium opacity-75">{stat.title}</p>
                                <p className="text-3xl font-bold">{stat.value}</p>
                            </div>
                            <stat.icon className="h-8 w-8 opacity-75" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Completion Rate */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Completion Rate</h3>
                    <TrophyIcon className="h-6 w-6 text-yellow-500" />
                </div>
                <div className="flex items-center space-x-4">
                    <div className="flex-1 bg-gray-200 rounded-full h-4">
                        <div
                            className="bg-blue-600 h-4 rounded-full transition-all duration-500"
                            style={{ width: `${analytics.completionRate}%` }}
                        ></div>
                    </div>
                    <span className="text-2xl font-bold text-blue-600">{analytics.completionRate}%</span>
                </div>
                <p className="text-gray-500 text-sm mt-2">
                    {analytics.completedTasks} out of {analytics.totalTasks} tasks completed
                </p>
            </div>

            {/* Priority Breakdown */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Tasks by Priority</h3>
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 rounded-full bg-red-500"></div>
                            <span className="text-sm font-medium">High Priority</span>
                        </div>
                        <span className="text-sm text-gray-600">{analytics.priorityBreakdown.high} tasks</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                            <span className="text-sm font-medium">Medium Priority</span>
                        </div>
                        <span className="text-sm text-gray-600">{analytics.priorityBreakdown.medium} tasks</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                            <span className="text-sm font-medium">Low Priority</span>
                        </div>
                        <span className="text-sm text-gray-600">{analytics.priorityBreakdown.low} tasks</span>
                    </div>
                </div>
            </div>

            {/* Productivity Tips */}
            {analytics.overdueTasks > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                    <div className="flex items-center space-x-2 mb-2">
                        <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
                        <h3 className="text-lg font-medium text-red-900">Attention Needed</h3>
                    </div>
                    <p className="text-red-700">
                        You have {analytics.overdueTasks} overdue task{analytics.overdueTasks !== 1 ? 's' : ''}.
                        Consider reviewing your task priorities and deadlines.
                    </p>
                </div>
            )}

            {analytics.completionRate >= 80 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                    <div className="flex items-center space-x-2 mb-2">
                        <TrophyIcon className="h-5 w-5 text-green-600" />
                        <h3 className="text-lg font-medium text-green-900">Great Work!</h3>
                    </div>
                    <p className="text-green-700">
                        Excellent job! You have a {analytics.completionRate}% completion rate. Keep up the great work!
                    </p>
                </div>
            )}
        </div>
    )
}
