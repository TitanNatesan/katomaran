'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import io from 'socket.io-client'

const SocketContext = createContext()

export function useSocket() {
  const context = useContext(SocketContext)
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider')
  }
  return context
}

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null)
  const [connected, setConnected] = useState(false)
  const { data: session } = useSession()

  useEffect(() => {
    if (session?.backendToken) {
      const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000'
      
      const newSocket = io(socketUrl, {
        auth: {
          token: session.backendToken
        },
        transports: ['websocket', 'polling']
      })

      newSocket.on('connect', () => {
        console.log('Socket connected')
        setConnected(true)
      })

      newSocket.on('disconnect', () => {
        console.log('Socket disconnected')
        setConnected(false)
      })

      newSocket.on('connect_error', (error) => {
        console.error('Socket connection error:', error)
        setConnected(false)
      })

      setSocket(newSocket)

      return () => {
        newSocket.close()
      }
    }
  }, [session?.backendToken])

  const value = {
    socket,
    connected
  }

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  )
}
