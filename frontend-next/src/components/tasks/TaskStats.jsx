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


export function TaskStats({ refreshStatsTrigger }) {
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
            // Get token from session or localStorage
            const backendToken = session?.backendToken || (typeof window !== 'undefined' ? localStorage.getItem('backendToken') : null);

            if (!backendToken) return;

            try {
                const response = await axios.get(
                    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/tasks`,
                    {
                        headers: {
                            Authorization: `Bearer ${backendToken}`
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
    }, [session?.backendToken, refreshStatsTrigger])

    if (loading) {
        return (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-white overflow-hidden shadow-lg rounded-xl animate-pulse">
                        <div className="p-6">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <div className="h-12 w-12 bg-gray-200 rounded-lg"></div>
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <div className="h-5 bg-gray-200 rounded w-20 mb-3"></div>
                                    <div className="h-8 bg-gray-200 rounded w-16"></div>
                                </div>
                            </div>
                            <div className="mt-4 h-2 bg-gray-200 rounded-full w-full"></div>
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
            iconColor: 'text-blue-50',
            bgGradient: 'bg-gradient-to-br from-blue-400 to-blue-600',
            borderColor: 'border-blue-200',
            shadowColor: 'shadow-blue-100',
            progressColor: 'bg-blue-500',
        },
        {
            name: 'In Progress',
            stat: stats.inProgress,
            icon: ClockIcon,
            iconColor: 'text-amber-50',
            bgGradient: 'bg-gradient-to-br from-amber-400 to-amber-600',
            borderColor: 'border-amber-200',
            shadowColor: 'shadow-amber-100',
            progressColor: 'bg-amber-500',
        },
        {
            name: 'Completed',
            stat: stats.completed,
            icon: CheckCircleIcon,
            iconColor: 'text-emerald-50',
            bgGradient: 'bg-gradient-to-br from-emerald-400 to-emerald-600',
            borderColor: 'border-emerald-200',
            shadowColor: 'shadow-emerald-100',
            progressColor: 'bg-emerald-500',
        },
        {
            name: 'Overdue',
            stat: stats.overdue,
            icon: ExclamationTriangleIcon,
            iconColor: 'text-rose-50',
            bgGradient: 'bg-gradient-to-br from-rose-400 to-rose-600',
            borderColor: 'border-rose-200',
            shadowColor: 'shadow-rose-100',
            progressColor: 'bg-rose-500',
        },
    ]

    return (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {statItems.map((item, i) => (
                <div
                    key={i}
                    className={`bg-white overflow-hidden rounded-xl border ${item.borderColor} ${item.shadowColor} shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}
                >
                    <div className="p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className={`p-3 ${item.bgGradient} rounded-xl shadow-md`}>
                                    <item.icon className={`h-8 w-8 ${item.iconColor}`} aria-hidden="true" />
                                </div>
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <p className="text-sm font-medium text-gray-600 uppercase tracking-wider">{item.name}</p>
                                <p className="text-3xl font-extrabold text-gray-900 backdrop-blur-sm">{item.stat}</p>
                            </div>
                        </div>
                        <div className="mt-4 pt-2">
                            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                <div
                                    className={`h-full ${item.progressColor} rounded-full`}
                                    style={{ width: `${Math.min(100, (item.stat / Math.max(stats.total, 1)) * 100)}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}
