'use client'

import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState, useRef, Suspense, useCallback } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { TaskList } from '@/components/tasks/TaskList'
import { TaskFilters } from '@/components/tasks/TaskFilters'
import { TaskStats } from '@/components/tasks/TaskStats'
import { CreateTaskModal } from '@/components/tasks/CreateTaskModal'
import { AnalyticsView } from '@/components/analytics/AnalyticsView'
import { SettingsView } from '@/components/settings/SettingsView'
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
    const [currentView, setCurrentView] = useState('dashboard')
    const searchInputRef = useRef(null)

    // Handle view changes from URL parameters
    useEffect(() => {
        const view = searchParams.get('view') || 'dashboard'
        setCurrentView(view)
    }, [searchParams])

    // Create a shared logout handler that can be passed to components
    const handleLogout = useCallback(async () => {
        console.log('Dashboard: Starting complete logout process');

        try {
            // 1. Clear all token storage first
            const { clearAuthToken } = await import('@/utils/authUtils');
            clearAuthToken();

            // 2. Set local state
            setIsTokenReady(false);

            // 3. Force clear cookies with server-side help
            // This fetch will hit our API route that clears cookies
            try {
                await fetch('/api/auth/logout', { method: 'POST' });
                console.log('Called server-side logout endpoint');
            } catch (error) {
                console.error('Error calling logout endpoint:', error);
            }

            // 4. Wait a moment to ensure tokens are cleared
            await new Promise(resolve => setTimeout(resolve, 200));

            // 5. Redirect to login page
            router.push('/login?logout=success');
        } catch (error) {
            console.error('Error during logout:', error);
            router.push('/login?error=logout_failed');
        }
    }, [router]);

    // Share the logout handler with the DashboardLayout
    useEffect(() => {
        // Add the handler to window so DashboardLayout can access it
        if (typeof window !== 'undefined') {
            window.handleKatomaranLogout = handleLogout;
        }

        return () => {
            // Clean up when unmounting
            if (typeof window !== 'undefined') {
                delete window.handleKatomaranLogout;
            }
        };
    }, [handleLogout]);

    // Enhanced token handling from URL parameters
    useEffect(() => {
        const token = searchParams.get('token')
        if (token) {
            console.log('OAuth token found in URL, storing...', token.substring(0, 10) + '...');
            storeAuthToken(token);
            setIsTokenReady(true);

            // Clean URL without losing the token
            const newUrl = window.location.pathname;
            window.history.replaceState({}, '', newUrl);

            // Force a refresh of components after token is stored
            setTimeout(() => {
                setRefreshStatsTrigger(prev => prev + 1);

                // Force re-fetch session to include the token
                const event = new Event('visibilitychange');
                document.dispatchEvent(event);
            }, 500);
        } else {
            // Check if token exists in storage
            const existingToken = getAuthToken(session);
            if (existingToken) {
                console.log('Existing token found in storage or session');
                setIsTokenReady(true);

                // Ensure token is synced with the session
                if (session && !session.backendToken && typeof window !== 'undefined') {
                    console.log('Token found in storage but not in session, triggering refresh');
                    const event = new Event('visibilitychange');
                    document.dispatchEvent(event);
                }
            } else if (session?.backendToken) {
                console.log('Token found in session');
                // Save the session token to localStorage for redundancy
                storeAuthToken(session.backendToken);
                setIsTokenReady(true);
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
    }, [])    // Enhanced authentication check
    useEffect(() => {
        if (status === 'loading') return // Wait for session to load

        const token = getAuthToken(session);
        console.log('Authentication check:', {
            status,
            hasSession: !!session,
            hasToken: !!token,
            isTokenReady
        });

        if (status === 'unauthenticated' && !isTokenReady && !token) {
            console.log('User not authenticated, redirecting to login');
            router.push('/login');
            return;
        }

        // Check if we have either session or stored token
        if (status === 'authenticated' || isTokenReady || token) {
            console.log('Authentication confirmed', {
                session: !!session,
                hasToken: !!token,
                tokenReady: isTokenReady
            });

            // If we have a token but session doesn't, sync them
            if (token && session && !session.backendToken) {
                console.log('Token exists but not in session, refreshing session');
                const event = new Event('visibilitychange');
                document.dispatchEvent(event);
            }
        }
    }, [status, session, isTokenReady, router])

    // Render different content based on current view
    const renderViewContent = () => {
        switch (currentView) {
            case 'my-tasks':
                return (
                    <>
                        {/* Task Filters for My Tasks */}
                        <TaskFilters
                            filters={filters}
                            onFiltersChange={setFilters}
                            searchInputRef={searchInputRef}
                        />
                        {/* My Tasks List */}
                        <TaskList
                            filters={filters}
                            viewType="my-tasks"
                            onTaskUpdate={refreshTasks}
                            onTaskDelete={refreshTasks}
                        />
                    </>
                );
            case 'shared-tasks':
                return (
                    <>
                        {/* Task Filters for Shared Tasks */}
                        <TaskFilters
                            filters={filters}
                            onFiltersChange={setFilters}
                            searchInputRef={searchInputRef}
                        />
                        {/* Shared Tasks List */}
                        <TaskList
                            filters={filters}
                            viewType="shared-tasks"
                            onTaskUpdate={refreshTasks}
                            onTaskDelete={refreshTasks}
                        />
                    </>
                );
            case 'analytics':
                return <AnalyticsView />;
            case 'settings':
                return <SettingsView />;
            default: // dashboard
                return (
                    <>
                        {/* Stats */}
                        <TaskStats refreshStatsTrigger={refreshStatsTrigger} />

                        {/* Filters */}
                        <TaskFilters
                            filters={filters}
                            onFiltersChange={setFilters}
                            searchInputRef={searchInputRef}
                        />

                        {/* All Tasks List */}
                        <TaskList
                            filters={filters}
                            viewType="all"
                            onTaskUpdate={refreshTasks}
                            onTaskDelete={refreshTasks}
                        />
                    </>
                );
        }
    };

    const getPageTitle = () => {
        switch (currentView) {
            case 'my-tasks':
                return 'My Tasks';
            case 'shared-tasks':
                return 'Shared Tasks';
            case 'analytics':
                return 'Analytics';
            case 'settings':
                return 'Settings';
            default:
                return 'Dashboard';
        }
    };

    const shouldShowCreateButton = currentView === 'dashboard' || currentView === 'my-tasks';

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

    // Function to handle token validation issues
    const handleAuthFailure = () => {
        console.log('Auth failure detected, redirecting to login');
        const { clearAuthToken } = require('@/utils/authUtils');
        clearAuthToken();
        router.push('/login?error=auth_required');
        return null;
    };

    // Ensure we have a token from any source
    const hasToken = isTokenReady || getAuthToken(session);

    // Show loading while checking authentication
    if (status === 'loading' && !hasToken) {
        return <DashboardLoading />;
    }

    // Redirect if not authenticated
    if (status === 'unauthenticated' && !hasToken) {
        return handleAuthFailure();
    }

    // Double-check token validity if we have a token but no session
    if (!session && hasToken) {
        console.log('Token found but no session, using token-based auth');
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="sm:flex sm:items-center sm:justify-between">
                <div className="sm:flex-auto">
                    <h1 className="text-2xl font-semibold text-gray-900">{getPageTitle()}</h1>
                    <p className="mt-2 text-sm text-gray-700">
                        {currentView === 'shared-tasks'
                            ? 'Tasks that have been shared with you by other users'
                            : currentView === 'my-tasks'
                                ? 'Tasks that you have created'
                                : currentView === 'analytics'
                                    ? 'View your task completion statistics and insights'
                                    : currentView === 'settings'
                                        ? 'Manage your account and application preferences'
                                        : `Welcome back, ${session?.user?.name?.split(' ')[0] || 'User'}! Here's what's happening with your tasks today.`
                        }
                    </p>
                </div>
                {shouldShowCreateButton && (
                    <div className="mt-4 sm:mt-0">
                        <button
                            type="button"
                            onClick={() => setIsCreateModalOpen(true)}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            <PlusIcon className="h-5 w-5 mr-2" /> New Task
                        </button>
                    </div>
                )}
            </div>

            {/* Main Content */}
            {renderViewContent()}

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
        <Suspense fallback={<DashboardLoading />}>
            <DashboardWithSearchParams />
        </Suspense>
    );
}

function DashboardWithSearchParams() {
    const searchParams = useSearchParams()
    const currentView = searchParams.get('view') || 'dashboard'

    return (
        <DashboardLayout currentView={currentView}>
            <DashboardContent />
        </DashboardLayout>
    );
}
