import NextAuth from 'next-auth'
import GitHubProvider from 'next-auth/providers/github'
import CredentialsProvider from 'next-auth/providers/credentials'
import axios from 'axios'

export const authOptions = {
    providers: [
        GitHubProvider({
            clientId: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
        }),
        CredentialsProvider({
            name: 'credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null
                }

                try {
                    const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/login`, {
                        email: credentials.email,
                        password: credentials.password
                    })

                    if (response.data.success && response.data.user) {
                        return {
                            id: response.data.user.id,
                            email: response.data.user.email,
                            name: response.data.user.name,
                            backendToken: response.data.token
                        }
                    }
                    return null
                } catch (error) {
                    console.error('Login error:', error)
                    return null
                }
            }
        })
    ],
    callbacks: {
        async jwt({ token, user, account }) {
            if (account && user) {
                try {
                    let backendEndpoint = ''
                    let requestData = {}

                    // Handle different OAuth providers
                    if (account.provider === 'github') {
                        backendEndpoint = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/github`
                        requestData = {
                            accessToken: account.access_token,
                            user: {
                                email: user.email,
                                name: user.name,
                                image: user.image,
                                githubId: user.id
                            }
                        }
                    } else if (account.provider === 'credentials') {
                        // For credentials, we already have the backend token
                        token.backendToken = user.backendToken
                        token.user = {
                            id: user.id,
                            email: user.email,
                            name: user.name
                        }
                        return token
                    }

                    // Send user data to backend for authentication (OAuth only)
                    if (backendEndpoint) {
                        try {
                            console.log('Sending OAuth data to backend:', backendEndpoint);
                            const response = await axios.post(backendEndpoint, requestData);

                            if (response.data.success && response.data.token) {
                                console.log('Received token from backend OAuth endpoint');
                                token.backendToken = response.data.token;
                                token.user = response.data.user || {
                                    email: user.email,
                                    name: user.name,
                                    image: user.image
                                };

                                // Ensure token is also stored in localStorage (for client-side)
                                if (typeof window !== 'undefined') {
                                    localStorage.setItem('backendToken', response.data.token);
                                    console.log('Token stored in localStorage from NextAuth');
                                }
                            } else {
                                console.error('Backend OAuth request succeeded but no token returned');
                            }
                        } catch (oauthError) {
                            console.error('OAuth backend authentication error:', oauthError);
                            throw oauthError; // Re-throw to be handled by the outer try/catch
                        }
                    }
                } catch (error) {
                    console.error('Backend authentication error:', error)
                    // Fallback to basic user info
                    token.user = {
                        email: user.email,
                        name: user.name,
                        image: user.image,
                        provider: account.provider
                    }
                }
            }
            return token
        },
        async session({ session, token }) {
            // Add user info from the token to the session
            session.user = token.user || session.user;

            // Add the backend token to the session if it exists
            if (token.backendToken) {
                session.backendToken = token.backendToken;
                console.log('Adding backend token to session from JWT token');
            } else {
                // Try to get token from localStorage as fallback
                try {
                    if (typeof window !== 'undefined') {
                        const storedToken = localStorage.getItem('backendToken');
                        if (storedToken) {
                            console.log('Retrieved token from localStorage for session');
                            session.backendToken = storedToken;
                        }
                    }
                } catch (storageError) {
                    console.error('Error accessing localStorage:', storageError);
                }
            }

            return session;
        },
        async redirect({ url, baseUrl }) {
            // Enhanced redirect logic for OAuth flows
            if (url.startsWith('/api/auth/signin')) {
                return baseUrl + '/dashboard'
            }

            if (url.startsWith(baseUrl)) {
                return url
            }

            return baseUrl + '/dashboard'
        }
    },
    pages: {
        signIn: '/login',
        signOut: '/login',
        error: '/login',
    },
    session: {
        strategy: 'jwt',
    },
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
