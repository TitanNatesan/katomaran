import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import axios from 'axios'

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (account && user) {
        try {
          // Send user data to backend for authentication
          const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/google`, {
            token: account.id_token,
            user: {
              email: user.email,
              name: user.name,
              image: user.image
            }
          })
          
          token.backendToken = response.data.token
          token.user = response.data.user
        } catch (error) {
          console.error('Backend authentication error:', error)
          // Fallback to basic user info
          token.user = {
            email: user.email,
            name: user.name,
            image: user.image
          }
        }
      }
      return token
    },
    async session({ session, token }) {
      session.user = token.user
      session.backendToken = token.backendToken
      return session
    },
    async redirect({ url, baseUrl }) {
      return url.startsWith(baseUrl) ? url : baseUrl + '/dashboard'
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
