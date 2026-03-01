'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { usePathname } from 'next/navigation'
import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface MainContentWrapperProps {
  children: ReactNode
}

const pageVariants = {
  initial: {
    opacity: 0,
    y: 16,
  },
  animate: {
    opacity: 1,
    y: 0,
  },
  exit: {
    opacity: 0,
    y: -16,
  },
}

const pageTransition = {
  type: 'tween',
  ease: [0.4, 0, 0.2, 1],
  duration: 0.25,
}

export function MainContentWrapper({ children }: MainContentWrapperProps) {
  const pathname = usePathname()

  const isMessenger = pathname?.includes('/messenger')

  return (
    <div className={cn('flex flex-1 flex-col bg-gray-100', isMessenger && 'min-h-0 overflow-hidden')}>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={pathname}
          initial="initial"
          animate="animate"
          exit="exit"
          variants={pageVariants}
          transition={pageTransition}
          style={{
            width: '100%',
            minHeight: isMessenger ? 0 : '100%',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            ...(isMessenger && { overflow: 'hidden', maxHeight: '100%' }),
          }}
          data-slot="page-transition"
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
