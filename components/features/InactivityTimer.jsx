'use client'

import { useEffect, useRef } from 'react'
import { useUser, useClerk } from '@clerk/nextjs'
import { INACTIVITY_TIMEOUT } from '@/config/constants'

export default function InactivityTimer() {
  const { isSignedIn } = useUser()
  const { signOut } = useClerk()
  const timeoutRef = useRef(null)
  const lastActivityRef = useRef(Date.now())

  // Reset the inactivity timer
  const resetTimer = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    lastActivityRef.current = Date.now()

    // Set a new timeout
    timeoutRef.current = setTimeout(() => {
      // Check if user is still inactive
      const timeSinceLastActivity = Date.now() - lastActivityRef.current
      
      if (timeSinceLastActivity >= INACTIVITY_TIMEOUT && isSignedIn) {
        // Sign out the user
        signOut({ redirectUrl: '/' })
      }
    }, INACTIVITY_TIMEOUT)
  }

  useEffect(() => {
    // Only set up timer if user is signed in
    if (!isSignedIn) {
      // Clear any existing timer if user is not signed in
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
      return
    }

    // Set initial timer
    resetTimer()

    // Activity event handlers
    const activityEvents = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click',
    ]

    // Add event listeners
    activityEvents.forEach((event) => {
      document.addEventListener(event, resetTimer, true)
    })

    // Cleanup function
    return () => {
      // Clear timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }

      // Remove event listeners
      activityEvents.forEach((event) => {
        document.removeEventListener(event, resetTimer, true)
      })
    }
  }, [isSignedIn, signOut])

  // This component doesn't render anything
  return null
}

