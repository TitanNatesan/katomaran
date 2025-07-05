'use client'

import Link from 'next/link'
import {
    CheckCircleIcon,
    BoltIcon,
    UserGroupIcon,
    ShieldCheckIcon,
    ChartBarIcon,
    DevicePhoneMobileIcon
} from '@heroicons/react/24/outline'

const features = [
    {
        name: 'Real-time Collaboration',
        description: 'Work together with your team in real-time with instant updates and notifications.',
        icon: BoltIcon,
    },
    {
        name: 'Task Management',
        description: 'Create, organize, and track tasks with priorities, due dates, and status updates.',
        icon: CheckCircleIcon,
    },
    {
        name: 'Team Sharing',
        description: 'Share tasks and projects with team members via email or username.',
        icon: UserGroupIcon,
    },
    {
        name: 'Secure Authentication',
        description: 'Secure login with Google OAuth and enterprise-grade security.',
        icon: ShieldCheckIcon,
    },
    {
        name: 'Analytics & Reports',
        description: 'Track productivity and progress with comprehensive analytics.',
        icon: ChartBarIcon,
    },
    {
        name: 'Mobile Responsive',
        description: 'Access your tasks anywhere with our fully responsive mobile design.',
        icon: DevicePhoneMobileIcon,
    },
]

export function LandingPage() {
    return (
        <div className="bg-white">
            {/* Header */}
            <header className="absolute inset-x-0 top-0 z-50">
                <nav className="flex items-center justify-between p-6 lg:px-8" aria-label="Global">
                    <div className="flex lg:flex-1">
                        <Link href="/" className="-m-1.5 p-1.5">
                            <span className="text-2xl font-bold text-blue-600">Katomaran</span>
                        </Link>
                    </div>
                    <div className="flex lg:flex-1 lg:justify-end">
                        <Link
                            href="/login"
                            className="text-sm font-semibold leading-6 text-gray-900 hover:text-blue-600"
                        >
                            Log in <span aria-hidden="true">&rarr;</span>
                        </Link>
                    </div>
                </nav>
            </header>

            {/* Hero section */}
            <div className="relative isolate px-6 pt-14 lg:px-8">
                <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
                    <div
                        className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
                        style={{
                            clipPath:
                                'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
                        }}
                    />
                </div>
                <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
                    <div className="text-center">
                        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
                            Streamline Your Team's
                            <span className="text-blue-600"> Task Management</span>
                        </h1>
                        <p className="mt-6 text-lg leading-8 text-gray-600">
                            Professional task management with real-time collaboration, smart filtering,
                            and seamless team coordination. Built for teams that get things done.
                        </p>
                        <div className="mt-10 flex items-center justify-center gap-x-6">
                            <Link
                                href="/login"
                                className="rounded-md bg-blue-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                            >
                                Get started with Google
                            </Link>
                            <Link
                                href="#features"
                                className="text-sm font-semibold leading-6 text-gray-900 hover:text-blue-600"
                            >
                                Learn more <span aria-hidden="true">→</span>
                            </Link>
                        </div>
                    </div>
                </div>
                <div className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]">
                    <div
                        className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"
                        style={{
                            clipPath:
                                'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
                        }}
                    />
                </div>
            </div>

            {/* Features section */}
            <div id="features" className="bg-white py-24 sm:py-32">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="mx-auto max-w-2xl lg:text-center">
                        <h2 className="text-base font-semibold leading-7 text-blue-600">Deploy faster</h2>
                        <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                            Everything you need to manage tasks effectively
                        </p>
                        <p className="mt-6 text-lg leading-8 text-gray-600">
                            Built for modern teams with powerful features that scale with your business.
                            From startups to enterprises, Katomaran adapts to your workflow.
                        </p>
                    </div>
                    <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
                        <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-2 lg:gap-y-16">
                            {features.map((feature) => (
                                <div key={feature.name} className="relative pl-16">
                                    <dt className="text-base font-semibold leading-7 text-gray-900">
                                        <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
                                            <feature.icon className="h-6 w-6 text-white" aria-hidden="true" />
                                        </div>
                                        {feature.name}
                                    </dt>
                                    <dd className="mt-2 text-base leading-7 text-gray-600">{feature.description}</dd>
                                </div>
                            ))}
                        </dl>
                    </div>
                </div>
            </div>

            {/* CTA section */}
            <div className="bg-blue-600">
                <div className="px-6 py-24 sm:px-6 sm:py-32 lg:px-8">
                    <div className="mx-auto max-w-2xl text-center">
                        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                            Ready to boost your productivity?
                        </h2>
                        <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-blue-200">
                            Join thousands of teams already using Katomaran to streamline their workflow
                            and achieve more together.
                        </p>
                        <div className="mt-10 flex items-center justify-center gap-x-6">
                            <Link
                                href="/login"
                                className="rounded-md bg-white px-3.5 py-2.5 text-sm font-semibold text-blue-600 shadow-sm hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                            >
                                Start for free
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="bg-white border-t border-gray-200">
                <div className="mx-auto max-w-7xl px-6 py-12 md:flex md:items-center md:justify-between lg:px-8">
                    <div className="flex justify-center space-x-6 md:order-2">
                        <p className="text-xs leading-5 text-gray-500">
                            This project is part of a hackathon run by{' '}
                            <a href="https://www.katomaran.com" className="text-blue-600 hover:text-blue-500">
                                katomaran.com
                            </a>
                        </p>
                    </div>
                    <div className="mt-8 md:order-1 md:mt-0">
                        <p className="text-center text-xs leading-5 text-gray-500">
                            &copy; 2025 Katomaran Task Management. Built with Next.js and Tailwind CSS.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    )
}
