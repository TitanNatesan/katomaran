'use client'

import { useState, useEffect } from 'react'
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
    MagnifyingGlassIcon,
    UserGroupIcon,
    ChartPieIcon
} from '@heroicons/react/24/outline'

const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon, key: 'dashboard' },
    { name: 'Analytics', href: '/dashboard?view=analytics', icon: ChartPieIcon, key: 'analytics' },
]

export function DashboardLayout({ children, currentView = 'dashboard' }) {
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const { data: session } = useSession()
    const router = useRouter()

    // Generate a consistent avatar URL using robohash.org
    const getAvatarUrl = (user) => {
        if (user?.image) {
            return user.image;
        }
        // Use user email or ID to generate consistent robot avatar
        const identifier = user?.email || user?.id || 'default';
        return `https://robohash.org/${encodeURIComponent(identifier)}?set=set1&size=200x200`;
    }

    const handleSignOut = async () => {
        try {
            console.log('Starting simplified logout process...');

            // For GitHub users, just clear everything and redirect to home
            const { clearAuthToken } = await import('@/utils/authUtils');

            // Clear all client-side data
            clearAuthToken();

            // Clear all site data (more aggressive cleanup)
            if (typeof window !== 'undefined') {
                try {
                    // Clear all localStorage
                    localStorage.clear();
                    // Clear all sessionStorage
                    sessionStorage.clear();
                    // Clear all cookies by setting them to expire
                    document.cookie.split(";").forEach(function (c) {
                        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
                    });
                } catch (error) {
                    console.warn('Error clearing site data:', error);
                }
            }

            // Use NextAuth signOut but redirect to home page
            await signOut({
                callbackUrl: '/',
                redirect: true
            });

        } catch (error) {
            console.error('Error during logout:', error);
            // Force redirect to home page on any error
            window.location.href = '/';
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
                            {navigation.map((item, i) => {
                                const isActive = item.key === currentView
                                return (
                                    <Link
                                        key={i}
                                        href={item.href}
                                        className={`${isActive
                                            ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                            } group flex items-center px-2 py-2 text-base font-medium rounded-md transition-colors duration-200`}
                                    >
                                        <item.icon
                                            className={`${isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500'
                                                } mr-4 h-6 w-6`}
                                            aria-hidden="true"
                                        />
                                        {item.name}
                                    </Link>
                                )
                            })}
                        </nav>
                    </div>
                    <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <Image
                                    className="h-8 w-8 rounded-full"
                                    src={getAvatarUrl(session?.user)}
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
                                {navigation.map((item, i) => {
                                    const isActive = item.key === currentView
                                    return (
                                        <Link
                                            key={i}
                                            href={item.href}
                                            className={`${isActive
                                                ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                                } group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors duration-200`}
                                        >
                                            <item.icon
                                                className={`${isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500'
                                                    } mr-3 h-6 w-6`}
                                                aria-hidden="true"
                                            />
                                            {item.name}
                                        </Link>
                                    )
                                })}
                            </nav>
                        </div>
                        <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
                            <div className="flex items-center w-full">
                                <div className="flex-shrink-0">
                                    <Image
                                        className="h-8 w-8 rounded-full"
                                        src={getAvatarUrl(session?.user)}
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
