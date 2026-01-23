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
      const shouldSuppressMessage = (msg: string) => {
        // Preload warnings
        if (msg.includes('preload') || msg.includes('preloaded')) return true

        // Performance measure errors (common with immediate redirects)
        if (
          msg.includes("Failed to execute 'measure'") ||
          msg.includes('cannot have a negative time stamp') ||
          msg.includes('RootPage')
        ) {
          return true
        }

        // Next.js/Turbopack sourcemap noise (doesn't affect runtime)
        if (
          msg.includes('Invalid source map') ||
          msg.includes('Only conformant source maps') ||
          msg.includes('sourceMapURL could not be parsed')
        ) {
          return true
        }

        return false
      }

      // Suppress console warnings
      const originalWarn = console.warn
      console.warn = function (...args: any[]) {
        // Suppress preload-related warnings
        const first = args?.[0]
        if (typeof first === 'string' && shouldSuppressMessage(first)) return
        try {
          if (typeof originalWarn === 'function') {
            originalWarn.call(console, ...args)
          }
        } catch {
          // Never let console plumbing break the app/dev overlay
        }
      }

      // Suppress Performance API errors (RootPage negative timestamp)
      const originalError = console.error
      console.error = function (...args: any[]) {
        const first = args?.[0]
        if (typeof first === 'string' && shouldSuppressMessage(first)) return
        try {
          if (typeof originalError === 'function') {
            originalError.call(console, ...args)
          }
        } catch {
          // Never let console plumbing break the app/dev overlay
        }
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
