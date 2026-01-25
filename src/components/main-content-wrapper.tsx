'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { usePathname } from 'next/navigation'
import { ReactNode } from 'react'

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

  return (
    <div className="flex flex-1 flex-col">
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
            minHeight: '100%',
            flex: 1,
            display: 'flex',
            flexDirection: 'column'
          }}
          data-slot="page-transition"
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
