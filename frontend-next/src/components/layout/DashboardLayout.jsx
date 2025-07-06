'use client'

import { useState } from 'react'
import { signOut, useSession } from 'next-auth/react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import {
    Bars3Icon,
    XMarkIcon,
    HomeIcon,
    ClipboardDocumentListIcon,
    ChartBarIcon,
    CogIcon,
    ArrowRightOnRectangleIcon,
    BellIcon,
    MagnifyingGlassIcon
} from '@heroicons/react/24/outline'

const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon, current: true },
    { name: 'Tasks', href: '/tasks', icon: ClipboardDocumentListIcon, current: false },
    { name: 'Analytics', href: '/analytics', icon: ChartBarIcon, current: false },
    { name: 'Settings', href: '/settings', icon: CogIcon, current: false },
]

export function DashboardLayout({ children }) {
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const { data: session } = useSession()
    const router = useRouter()

    const handleSignOut = async () => {
        try {
            console.log('Starting logout process...');

            // 1. Import the clearAuthToken function to clean client-side storage
            const { clearAuthToken } = await import('@/utils/authUtils');

            // 2. Clear all client-side tokens and storage first
            clearAuthToken();

            // 3. Call the backend logout API to clear server-side session and cookies
            try {
                const response = await fetch('/api/auth/logout', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    credentials: 'include' // Important to include cookies
                });

                if (!response.ok) {
                    console.warn('Backend logout endpoint returned non-OK status:', response.status);
                }
            } catch (apiError) {
                console.error('Error calling logout endpoint:', apiError);
                // Continue with signOut even if this fails
            }

            // 4. Finally use NextAuth signOut as the last step
            // The callbackUrl ensures we redirect to login page after signOut completes
            console.log('Calling NextAuth signOut...');
            await signOut({
                callbackUrl: '/login?logout=success',
                redirect: true
            });

            // 5. If for some reason the redirect doesn't happen, force it
            setTimeout(() => {
                console.log('Fallback redirect timer triggered');
                window.location.href = '/login?logout=timeout';
            }, 1000);

        } catch (error) {
            console.error('Error during sign out:', error);

            // Force redirect to login on error
            window.location.href = '/login?error=logout_failed';
        }
    }

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Mobile sidebar */}
            <div className={`fixed inset-0 z-40 lg:hidden ${sidebarOpen ? '' : 'hidden'}`}>
                <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
                <div className="relative flex flex-col w-full max-w-xs bg-white">
                    <div className="absolute top-0 right-0 -mr-12 pt-2">
                        <button
                            type="button"
                            className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                            onClick={() => setSidebarOpen(false)}
                        >
                            <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
                        </button>
                    </div>
                    <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
                        <div className="flex-shrink-0 flex items-center px-4">
                            <span className="text-2xl font-bold text-blue-600">Katomaran</span>
                        </div>
                        <nav className="mt-5 px-2 space-y-1">
                            {navigation.map((item, i) => (
                                <Link
                                    key={i}
                                    href={item.href}
                                    className={`${item.current
                                        ? 'bg-gray-100 text-gray-900'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                        } group flex items-center px-2 py-2 text-base font-medium rounded-md`}
                                >
                                    <item.icon
                                        className={`${item.current ? 'text-gray-500' : 'text-gray-400 group-hover:text-gray-500'
                                            } mr-4 h-6 w-6`}
                                        aria-hidden="true"
                                    />
                                    {item.name}
                                </Link>
                            ))}
                        </nav>
                    </div>
                    <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <Image
                                    className="h-8 w-8 rounded-full"
                                    src={session?.user?.image || '/default-avatar.png'}
                                    alt="User avatar"
                                    width={32}
                                    height={32}
                                />
                            </div>
                            <div className="ml-3">
                                <p className="text-base font-medium text-gray-700 group-hover:text-gray-900">
                                    {session?.user?.name}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Static sidebar for desktop */}
            <div className="hidden lg:flex lg:flex-shrink-0">
                <div className="flex flex-col w-64">
                    <div className="flex flex-col h-0 flex-1 bg-white border-r border-gray-200">
                        <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
                            <div className="flex items-center flex-shrink-0 px-4">
                                <span className="text-2xl font-bold text-blue-600">Katomaran</span>
                            </div>
                            <nav className="mt-5 flex-1 px-2 space-y-1">
                                {navigation.map((item, i) => (
                                    <Link
                                        key={i}
                                        href={item.href}
                                        className={`${item.current
                                            ? 'bg-gray-100 text-gray-900'
                                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                            } group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
                                    >
                                        <item.icon
                                            className={`${item.current ? 'text-gray-500' : 'text-gray-400 group-hover:text-gray-500'
                                                } mr-3 h-6 w-6`}
                                            aria-hidden="true"
                                        />
                                        {item.name}
                                    </Link>
                                ))}
                            </nav>
                        </div>
                        <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
                            <div className="flex items-center w-full">
                                <div className="flex-shrink-0">
                                    <Image
                                        className="h-8 w-8 rounded-full"
                                        src={session?.user?.image || '/default-avatar.png'}
                                        alt="User avatar"
                                        width={32}
                                        height={32}
                                    />
                                </div>
                                <div className="ml-3 flex-1">
                                    <p className="text-sm font-medium text-gray-700">
                                        {session?.user?.name}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {session?.user?.email}
                                    </p>
                                </div>
                                <button
                                    onClick={handleSignOut}
                                    className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    <ArrowRightOnRectangleIcon className="h-5 w-5" aria-hidden="true" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main content */}
            <div className="flex flex-col w-0 flex-1 overflow-hidden">
                {/* Top bar */}
                <div className="relative z-10 flex-shrink-0 flex h-16 bg-white shadow">
                    <button
                        type="button"
                        className="px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 lg:hidden"
                        onClick={() => setSidebarOpen(true)}
                    >
                        <Bars3Icon className="h-6 w-6" aria-hidden="true" />
                    </button>
                    <div className="flex-1 px-4 flex justify-between">
                        <div className="flex-1 flex">
                            <div className="w-full flex md:ml-0">
                                <label htmlFor="search-field" className="sr-only">
                                    Search
                                </label>
                                <div className="relative w-full text-gray-400 focus-within:text-gray-600">
                                    <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none">
                                        <MagnifyingGlassIcon className="h-5 w-5" aria-hidden="true" />
                                    </div>
                                    <input
                                        id="search-field"
                                        className="block w-full h-full pl-8 pr-3 py-2 border-transparent text-gray-900 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-0 focus:border-transparent sm:text-sm"
                                        placeholder="Search tasks..."
                                        type="search"
                                        name="search"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="ml-4 flex items-center md:ml-6">
                            <button
                                type="button"
                                className="bg-white p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                <BellIcon className="h-6 w-6" aria-hidden="true" />
                            </button>

                            <button
                                onClick={handleSignOut}
                                type="button"
                                className="ml-3 bg-white p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                aria-label="Sign out"
                            >
                                <ArrowRightOnRectangleIcon className="h-6 w-6" aria-hidden="true" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Main content area */}
                <main className="flex-1 relative overflow-y-auto focus:outline-none">
                    <div className="py-6">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                            {children}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    )
}
