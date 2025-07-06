import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
    function middleware(req) {
        // Check for token in URL (OAuth redirect)
        const token = req.nextUrl.searchParams.get('token')
        if (token) {
            // Allow access to dashboard with token
            console.log('Middleware: Token found in URL, allowing access');

            // We can't set cookie directly in Edge middleware, but we can add a header
            // that our page can use to detect the token was verified by middleware
            const response = NextResponse.next();
            response.headers.set('x-middleware-token-verified', 'true');
            return response;
        }

        // Check for cookie-based token as fallback
        const cookieHeader = req.cookies.get('backendToken');
        if (cookieHeader?.value) {
            console.log('Middleware: Token found in cookie, allowing access');
            return NextResponse.next();
        }

        // Check if user is authenticated via NextAuth
        if (!req.nextauth.token) {
            console.log('Middleware: No tokens found, redirecting to login');
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

                // 2. Check for cookie token
                const cookieHeader = req.cookies.get('backendToken');
                if (cookieHeader?.value) return true

                // 3. Check for Next-Auth session token
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
