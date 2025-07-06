'use client'

import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState, useRef, Suspense } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { TaskList } from '@/components/tasks/TaskList'
import { TaskFilters } from '@/components/tasks/TaskFilters'
import { TaskStats } from '@/components/tasks/TaskStats'
import { CreateTaskModal } from '@/components/tasks/CreateTaskModal'
import { useKeyboardShortcuts } from '@/components/common/KeyboardShortcuts'
import { PlusIcon } from '@heroicons/react/24/outline'
import { storeAuthToken } from '@/utils/authUtils'

// Loading component for Suspense fallback
function DashboardLoading() {
    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
    );
}

// The actual Dashboard content with useSearchParams
function DashboardContent() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const searchParams = useSearchParams()
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [taskListKey, setTaskListKey] = useState(0) // For forcing re-render
    const [filters, setFilters] = useState({
        status: 'all',
        priority: 'all',
        search: '',
        dueDate: 'all'
    })
    const searchInputRef = useRef(null)

    // Debug session
    useEffect(() => {
        if (session) {
            console.log('Dashboard Session:', {
                user: session.user,
                backendToken: session.backendToken ? 'Present' : 'Missing',
                tokenLength: session.backendToken?.length || 0
            })
        }
    }, [session])

    useKeyboardShortcuts({
        onNewTask: () => setIsCreateModalOpen(true),
        onSearch: () => searchInputRef.current?.focus(),
        onEscape: () => {
            setIsCreateModalOpen(false)
            searchInputRef.current?.blur()
        }
    })

    // Function to refresh task list
    const refreshTasks = () => {
        setTaskListKey(prev => prev + 1)
    }

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login')
        }
    }, [status, router])

    // Handle token from URL (for OAuth redirects)
    useEffect(() => {
        const token = searchParams.get('token')
        if (token) {
            console.log('Token found in URL, storing in localStorage')
            storeAuthToken(token)
            router.replace('/dashboard') // Clean URL
        }
    }, [searchParams, router])

    if (status === 'loading') {
        return <DashboardLoading />;
    }

    if (status === 'unauthenticated') {
        return null // Will redirect to login
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Welcome back, {session?.user?.name?.split(' ')[0] || 'User'}!
                    </h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Here's what's happening with your tasks today.
                    </p>
                </div>
                <div className="mt-4 sm:mt-0">
                    <button
                        type="button"
                        onClick={() => setIsCreateModalOpen(true)}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        <PlusIcon className="h-5 w-5 mr-2" /> New Task
                    </button>
                </div>
            </div>

            {/* Stats */}
            <TaskStats refreshStatsTrigger={taskListKey} />

            {/* Filters */}
            <TaskFilters
                filters={filters}
                onFiltersChange={setFilters}
                searchInputRef={searchInputRef}
            />

            {/* Task List */}
            <TaskList
                key={taskListKey}
                filters={filters}
                onTaskUpdate={refreshTasks}
            />

            {/* Create Task Modal */}
            <CreateTaskModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onTaskCreated={() => {
                    setIsCreateModalOpen(false)
                    refreshTasks() // Refresh tasks after creating
                }}
            />
        </div>
    );
}

export default function Dashboard() {
    return (
        <DashboardLayout>
            <Suspense fallback={<DashboardLoading />}>
                <DashboardContent />
            </Suspense>
        </DashboardLayout>
    );
}
