'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import axios from 'axios'
import {
    ClipboardDocumentListIcon,
    ClockIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon
} from '@heroicons/react/24/outline'

export function TaskStats() {
    const { data: session } = useSession()
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        inProgress: 0,
        completed: 0,
        overdue: 0
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchStats = async () => {
            if (!session?.backendToken) return

            try {
                const response = await axios.get(
                    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/tasks`,
                    {
                        headers: {
                            Authorization: `Bearer ${session.backendToken}`
                        }
                    }
                )

                const tasks = response.data.tasks || []
                const now = new Date()

                const newStats = {
                    total: tasks.length,
                    pending: tasks.filter(task => task.status === 'pending').length,
                    inProgress: tasks.filter(task => task.status === 'in progress').length,
                    completed: tasks.filter(task => task.status === 'completed').length,
                    overdue: tasks.filter(task =>
                        task.dueDate &&
                        new Date(task.dueDate) < now &&
                        task.status !== 'completed'
                    ).length
                }

                setStats(newStats)
            } catch (error) {
                console.error('Error fetching task stats:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchStats()
    }, [session?.backendToken])

    if (loading) {
        return (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-white overflow-hidden shadow rounded-lg animate-pulse">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <div className="h-8 w-8 bg-gray-200 rounded"></div>
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <div className="h-4 bg-gray-200 rounded w-16 mb-2"></div>
                                    <div className="h-6 bg-gray-200 rounded w-12"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        )
    }

    const statItems = [
        {
            name: 'Total Tasks',
            stat: stats.total,
            icon: ClipboardDocumentListIcon,
            color: 'text-blue-600',
            bgColor: 'bg-blue-100',
        },
        {
            name: 'In Progress',
            stat: stats.inProgress,
            icon: ClockIcon,
            color: 'text-yellow-600',
            bgColor: 'bg-yellow-100',
        },
        {
            name: 'Completed',
            stat: stats.completed,
            icon: CheckCircleIcon,
            color: 'text-green-600',
            bgColor: 'bg-green-100',
        },
        {
            name: 'Overdue',
            stat: stats.overdue,
            icon: ExclamationTriangleIcon,
            color: 'text-red-600',
            bgColor: 'bg-red-100',
        },
    ]

    return (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {statItems.map((item) => (
                <div key={item.name} className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className={`p-2 ${item.bgColor} rounded-lg`}>
                                    <item.icon className={`h-6 w-6 ${item.color}`} aria-hidden="true" />
                                </div>
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">{item.name}</dt>
                                    <dd className="text-2xl font-semibold text-gray-900">{item.stat}</dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}
