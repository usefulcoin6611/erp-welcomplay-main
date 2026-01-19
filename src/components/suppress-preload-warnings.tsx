"use client"

import { useEffect } from 'react'

/**
 * Suppresses preload warnings and performance errors in development mode
 * These warnings/errors are common in Next.js and don't affect functionality
 * 
 * Fixed: Suppress "RootPage cannot have a negative time stamp" error
 * This occurs when Next.js tries to measure performance for pages with immediate redirects
 */
export function SuppressPreloadWarnings() {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      // Suppress console warnings
      const originalWarn = console.warn
      console.warn = function (...args: any[]) {
        // Suppress preload-related warnings
        if (
          args[0] &&
          typeof args[0] === 'string' &&
          (args[0].includes('preload') || args[0].includes('preloaded'))
        ) {
          return
        }
        originalWarn.apply(console, args)
      }

      // Suppress Performance API errors (RootPage negative timestamp)
      const originalError = console.error
      console.error = function (...args: any[]) {
        // Suppress performance measure errors
        if (
          args[0] &&
          typeof args[0] === 'string' &&
          (args[0].includes('Failed to execute \'measure\'') ||
           args[0].includes('cannot have a negative time stamp') ||
           args[0].includes('RootPage'))
        ) {
          return
        }
        originalError.apply(console, args)
      }

      // Wrap performance.measure to catch errors silently
      let originalMeasure: typeof window.performance.measure | null = null
      if (typeof window !== 'undefined' && window.performance) {
        originalMeasure = window.performance.measure.bind(window.performance)
        window.performance.measure = function(...args: any[]) {
          try {
            return originalMeasure!(...args)
          } catch (error: any) {
            // Silently ignore "negative time stamp" errors (common with immediate redirects)
            if (error && error.message && error.message.includes('negative time stamp')) {
              return undefined as any
            }
            // Re-throw other errors
            throw error
          }
        }
      }

      // Cleanup on unmount
      return () => {
        console.warn = originalWarn
        console.error = originalError
        // Restore original performance.measure if it was wrapped
        if (typeof window !== 'undefined' && window.performance && originalMeasure) {
          window.performance.measure = originalMeasure
        }
      }
    }
  }, [])

  return null
}
