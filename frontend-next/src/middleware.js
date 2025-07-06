import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
    function middleware(req) {
        // Check for token in URL (OAuth redirect)
        const token = req.nextUrl.searchParams.get('token')
        if (token) {
            // Allow access to dashboard with token
            return NextResponse.next()
        }

        // Check if user is authenticated
        if (!req.nextauth.token) {
            // Redirect to login if not authenticated
            return NextResponse.redirect(new URL('/login', req.url))
        }

        return NextResponse.next()
    },
    {
        callbacks: {
            authorized: ({ token, req }) => {
                // 1. Check for token in URL (GitHub OAuth redirect)
                const urlToken = req.nextUrl.searchParams.get('token')
                if (urlToken) return true

                // 2. Check for Next-Auth session token
                if (token) return true

                // If we get here, not authorized
                return false
            },
        },
    }
)

export const config = {
    matcher: ['/dashboard/:path*']
}
