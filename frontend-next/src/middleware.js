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
                // Allow access if user has token or if there's a token in URL
                const urlToken = req.nextUrl.searchParams.get('token')
                return !!token || !!urlToken
            },
        },
    }
)

export const config = {
    matcher: ['/dashboard/:path*']
}
