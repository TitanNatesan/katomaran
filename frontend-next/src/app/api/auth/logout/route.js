import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
    try {
        // Clear all potential auth cookies
        const cookieStore = cookies();
        const authCookies = [
            'next-auth.session-token',
            'next-auth.callback-url',
            'next-auth.csrf-token',
            'backendToken',
            '__Secure-next-auth.session-token',
            '__Host-next-auth.csrf-token',
            'next-auth.pkce.code_verifier',
            'next-auth.state'
        ];

        // Clear each cookie
        for (const cookieName of authCookies) {
            cookieStore.delete(cookieName);
        }

        // Create a response that also includes instructions to clear client-side cookies
        const response = NextResponse.json({
            success: true,
            message: 'Logged out successfully'
        });

        // Also set cookie clearing headers in the response
        for (const cookieName of authCookies) {
            response.cookies.delete(cookieName);
        }

        return response;
    } catch (error) {
        console.error('Logout API route error:', error);
        return NextResponse.json({
            success: false,
            message: 'Error during logout'
        }, { status: 500 });
    }
}

export async function GET() {
    // Handle GET requests to the logout route as well
    const response = NextResponse.redirect(new URL('/login', process.env.NEXTAUTH_URL || 'http://localhost:3000'));

    // Clear cookies on redirect too
    const authCookies = [
        'next-auth.session-token',
        'next-auth.callback-url',
        'next-auth.csrf-token',
        'backendToken',
        '__Secure-next-auth.session-token',
        '__Host-next-auth.csrf-token',
        'next-auth.pkce.code_verifier',
        'next-auth.state'
    ];

    for (const cookieName of authCookies) {
        response.cookies.delete(cookieName);
    }

    return response;
}
