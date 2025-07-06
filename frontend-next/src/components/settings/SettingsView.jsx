'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import {
    UserIcon,
    EnvelopeIcon,
    CalendarDaysIcon,
    ShieldCheckIcon,
    BellIcon,
    EyeIcon,
    KeyIcon,
    TrashIcon
} from '@heroicons/react/24/outline'

export function SettingsView() {
    const { data: session } = useSession()
    const [activeTab, setActiveTab] = useState('profile')

    // Generate a consistent avatar URL using robohash.org
    const getAvatarUrl = (user) => {
        if (user?.image) {
            return user.image;
        }
        // Use user email or ID to generate consistent robot avatar
        const identifier = user?.email || user?.id || 'default';
        return `https://robohash.org/${encodeURIComponent(identifier)}?set=set1&size=200x200`;
    }

    const tabs = [
        { id: 'profile', name: 'Profile', icon: UserIcon },
        { id: 'notifications', name: 'Notifications', icon: BellIcon },
        { id: 'privacy', name: 'Privacy', icon: EyeIcon },
        { id: 'security', name: 'Security', icon: ShieldCheckIcon }
    ]

    const renderProfileTab = () => (
        <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Profile Information</h3>

                <div className="flex items-center space-x-6 mb-6">
                    <div className="flex-shrink-0">
                        <Image
                            className="h-20 w-20 rounded-full"
                            src={getAvatarUrl(session?.user)}
                            alt="Profile avatar"
                            width={80}
                            height={80}
                        />
                    </div>
                    <div className="flex-1">
                        <h4 className="text-xl font-medium text-gray-900">{session?.user?.name}</h4>
                        <p className="text-gray-500">{session?.user?.email}</p>
                        <p className="text-sm text-gray-400 mt-1">
                            Member since {new Date().getFullYear()}
                        </p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Name</label>
                        <div className="mt-1 relative">
                            <input
                                type="text"
                                value={session?.user?.name || ''}
                                disabled
                                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                            />
                            <UserIcon className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            Profile information is managed through your OAuth provider (GitHub)
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <div className="mt-1 relative">
                            <input
                                type="email"
                                value={session?.user?.email || ''}
                                disabled
                                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                            />
                            <EnvelopeIcon className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Account Type</label>
                        <div className="mt-1 relative">
                            <input
                                type="text"
                                value="GitHub OAuth"
                                disabled
                                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                            />
                            <ShieldCheckIcon className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )

    const renderNotificationsTab = () => (
        <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Notification Preferences</h3>

                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="text-sm font-medium text-gray-900">Task Reminders</h4>
                            <p className="text-sm text-gray-500">Get notified about upcoming due dates</p>
                        </div>
                        <input type="checkbox" defaultChecked className="h-4 w-4 text-blue-600 rounded" />
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="text-sm font-medium text-gray-900">Shared Task Updates</h4>
                            <p className="text-sm text-gray-500">Notifications when shared tasks are updated</p>
                        </div>
                        <input type="checkbox" defaultChecked className="h-4 w-4 text-blue-600 rounded" />
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="text-sm font-medium text-gray-900">Weekly Summary</h4>
                            <p className="text-sm text-gray-500">Weekly overview of your task progress</p>
                        </div>
                        <input type="checkbox" className="h-4 w-4 text-blue-600 rounded" />
                    </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200">
                    <p className="text-sm text-gray-500">
                        <BellIcon className="inline h-4 w-4 mr-1" />
                        Notification settings will be implemented in a future update
                    </p>
                </div>
            </div>
        </div>
    )

    const renderPrivacyTab = () => (
        <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Privacy Settings</h3>

                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="text-sm font-medium text-gray-900">Profile Visibility</h4>
                            <p className="text-sm text-gray-500">Control who can see your profile information</p>
                        </div>
                        <select className="px-3 py-2 border border-gray-300 rounded-md text-sm">
                            <option>Private</option>
                            <option>Public</option>
                        </select>
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="text-sm font-medium text-gray-900">Task Sharing</h4>
                            <p className="text-sm text-gray-500">Allow others to share tasks with you</p>
                        </div>
                        <input type="checkbox" defaultChecked className="h-4 w-4 text-blue-600 rounded" />
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="text-sm font-medium text-gray-900">Analytics Data</h4>
                            <p className="text-sm text-gray-500">Help improve the service with anonymous usage data</p>
                        </div>
                        <input type="checkbox" defaultChecked className="h-4 w-4 text-blue-600 rounded" />
                    </div>
                </div>
            </div>
        </div>
    )

    const renderSecurityTab = () => (
        <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Security Settings</h3>

                <div className="space-y-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center space-x-2">
                            <ShieldCheckIcon className="h-5 w-5 text-green-600" />
                            <h4 className="text-sm font-medium text-green-900">Account Security</h4>
                        </div>
                        <p className="text-sm text-green-700 mt-1">
                            Your account is secured with GitHub OAuth authentication
                        </p>
                    </div>

                    <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Authentication Method</h4>
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center">
                                    <span className="text-white text-xs font-bold">GH</span>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900">GitHub OAuth</p>
                                    <p className="text-xs text-gray-500">Connected account</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Session Management</h4>
                        <p className="text-sm text-gray-500 mb-3">
                            Sessions are automatically managed through GitHub OAuth
                        </p>
                        <button
                            onClick={() => {
                                if (typeof window !== 'undefined' && window.handleKatomaranLogout) {
                                    window.handleKatomaranLogout();
                                } else {
                                    window.location.href = '/';
                                }
                            }}
                            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
                        >
                            Sign Out All Sessions
                        </button>
                    </div>
                </div>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <h3 className="text-lg font-medium text-red-900 mb-4 flex items-center">
                    <TrashIcon className="h-5 w-5 mr-2" />
                    Danger Zone
                </h3>
                <p className="text-sm text-red-700 mb-4">
                    Account deletion will permanently remove all your tasks and data. This action cannot be undone.
                </p>
                <button className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm">
                    Delete Account
                </button>
            </div>
        </div>
    )

    const renderTabContent = () => {
        switch (activeTab) {
            case 'profile': return renderProfileTab()
            case 'notifications': return renderNotificationsTab()
            case 'privacy': return renderPrivacyTab()
            case 'security': return renderSecurityTab()
            default: return renderProfileTab()
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Settings</h2>
                <p className="text-gray-600">Manage your account preferences and security settings</p>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="border-b border-gray-200">
                    <nav className="flex space-x-8 px-6" aria-label="Tabs">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`${activeTab === tab.id
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
                            >
                                <tab.icon className="h-4 w-4" />
                                <span>{tab.name}</span>
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="p-6">
                    {renderTabContent()}
                </div>
            </div>
        </div>
    )
}
