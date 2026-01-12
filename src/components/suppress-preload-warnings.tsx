"use client"

import { useEffect } from 'react'

/**
 * Suppresses preload warnings in development mode
 * These warnings are common in Next.js and don't affect functionality
 */
export function SuppressPreloadWarnings() {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const originalWarn = console.warn
      console.warn = function (...args: any[]) {
        // Suppress only preload-related warnings
        if (
          args[0] &&
          typeof args[0] === 'string' &&
          (args[0].includes('preload') || args[0].includes('preloaded'))
        ) {
          return
        }
        originalWarn.apply(console, args)
      }

      // Cleanup on unmount
      return () => {
        console.warn = originalWarn
      }
    }
  }, [])

  return null
}
