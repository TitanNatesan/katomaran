'use client'

import { useSession } from 'next-auth/react'
import { useState } from 'react'
import axios from 'axios'

export function DebugSession() {
    const { data: session } = useSession()
    const [testResult, setTestResult] = useState('')

    const testConnection = async () => {
        try {
            setTestResult('Testing...')
            console.log('Session data:', session)

            if (!session?.backendToken) {
                setTestResult('❌ No backend token found in session')
                return
            }

            const response = await axios.get(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/tasks`,
                {
                    headers: {
                        Authorization: `Bearer ${session.backendToken}`,
                    },
                }
            )

            setTestResult(`✅ API connection successful! Found ${response.data.tasks.length} tasks`)
            console.log('API response:', response.data)

        } catch (error) {
            setTestResult(`❌ API connection failed: ${error.response?.status} - ${error.response?.data?.message || error.message}`)
            console.error('API error:', error.response?.data || error)
        }
    }

    return (
        <div className="p-4 border rounded-lg bg-gray-50">
            <h3 className="font-bold mb-2">Debug Session Information</h3>
            <div className="space-y-2 text-sm">
                <p><strong>Session Status:</strong> {session ? 'Authenticated' : 'Not authenticated'}</p>
                <p><strong>User Email:</strong> {session?.user?.email || 'N/A'}</p>
                <p><strong>Backend Token:</strong> {session?.backendToken ? '✅ Present' : '❌ Missing'}</p>
                <p><strong>Backend URL:</strong> {process.env.NEXT_PUBLIC_BACKEND_URL}</p>

                <button
                    onClick={testConnection}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    Test API Connection
                </button>

                {testResult && (
                    <div className="mt-2 p-2 bg-white border rounded">
                        {testResult}
                    </div>
                )}
            </div>
        </div>
    )
}
