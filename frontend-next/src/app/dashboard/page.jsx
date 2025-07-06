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
import { storeAuthToken, getAuthToken, isAuthenticated } from '@/utils/authUtils'

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
    const [refreshStatsTrigger, setRefreshStatsTrigger] = useState(0) // For TaskStats refresh
    const [isTokenReady, setIsTokenReady] = useState(false)
    const [filters, setFilters] = useState({
        status: 'all',
        priority: 'all',
        search: '',
        dueDate: 'all'
    })
    const searchInputRef = useRef(null)

    // Enhanced token handling from URL parameters
    useEffect(() => {
        const token = searchParams.get('token')
        if (token) {
            console.log('OAuth token found in URL, storing...')
            storeAuthToken(token)
            setIsTokenReady(true)

            // Clean URL without losing the token
            const newUrl = window.location.pathname
            window.history.replaceState({}, '', newUrl)
        } else {
            // Check if token exists in storage
            const existingToken = getAuthToken(session)
            if (existingToken) {
                setIsTokenReady(true)
            }
        }
    }, [searchParams, session])

    // Listen for token storage events
    useEffect(() => {
        const handleTokenStored = () => {
            setIsTokenReady(true)
        }

        const handleTokenCleared = () => {
            setIsTokenReady(false)
        }

        if (typeof window !== 'undefined') {
            window.addEventListener('tokenStored', handleTokenStored)
            window.addEventListener('tokenCleared', handleTokenCleared)

            return () => {
                window.removeEventListener('tokenStored', handleTokenStored)
                window.removeEventListener('tokenCleared', handleTokenCleared)
            }
        }
    }, [])

    // Enhanced authentication check
    useEffect(() => {
        if (status === 'loading') return // Wait for session to load

        if (status === 'unauthenticated' && !isTokenReady) {
            console.log('User not authenticated, redirecting to login')
            router.push('/login')
            return
        }

        // Check if we have either session or stored token
        if (status === 'authenticated' || isTokenReady) {
            console.log('Authentication confirmed', {
                session: !!session,
                token: !!getAuthToken(session),
                tokenReady: isTokenReady
            })
        }
    }, [status, session, isTokenReady, router])

    // Debug logging
    useEffect(() => {
        if (session || isTokenReady) {
            console.log('Dashboard Auth State:', {
                sessionStatus: status,
                hasSession: !!session,
                sessionUser: session?.user?.email,
                hasBackendToken: !!session?.backendToken,
                hasStoredToken: !!getAuthToken(session),
                isTokenReady
            })
        }
    }, [session, status, isTokenReady])

    useKeyboardShortcuts({
        onNewTask: () => setIsCreateModalOpen(true),
        onSearch: () => searchInputRef.current?.focus(),
        onEscape: () => {
            setIsCreateModalOpen(false)
            searchInputRef.current?.blur()
        }
    })

    // Function to refresh task list and stats
    const refreshTasks = () => {
        setRefreshStatsTrigger(prev => prev + 1)
    }

    // Show loading while checking authentication
    if (status === 'loading' || (!session && !isTokenReady)) {
        return <DashboardLoading />;
    }

    // Redirect if not authenticated
    if (status === 'unauthenticated' && !isTokenReady) {
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
            <TaskStats refreshStatsTrigger={refreshStatsTrigger} />

            {/* Filters */}
            <TaskFilters
                filters={filters}
                onFiltersChange={setFilters}
                searchInputRef={searchInputRef}
            />

            {/* Task List */}
            <TaskList
                filters={filters}
                onTaskUpdate={refreshTasks}
                onTaskDelete={refreshTasks}
            />

            {/* Create Task Modal */}
            <CreateTaskModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onTaskCreated={refreshTasks}
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
