'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { ChevronRight } from 'lucide-react'
import { LeadGeneralReport } from './LeadGeneralReport'
import { LeadStaffReport } from './LeadStaffReport'
import { LeadPipelineReport } from './LeadPipelineReport'

export function LeadTab() {
  const [activeSection, setActiveSection] = useState('general-report')
  const observerRef = useRef<IntersectionObserver | null>(null)

  // Setup intersection observer for automatic active section detection
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '-20% 0px -70% 0px',
      threshold: 0
    }

    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id)
        }
      })
    }, observerOptions)

    // Observe all sections
    const sections = ['general-report', 'staff-report', 'pipeline-report']
    sections.forEach(id => {
      const element = document.getElementById(id)
      if (element && observerRef.current) {
        observerRef.current.observe(element)
      }
    })

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [])

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      const offset = 100 // Header offset
      const elementPosition = element.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.pageYOffset - offset

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      })
    }
  }

  return (
    <div className="w-full min-w-0">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6">
        {/* Left Sidebar Navigation */}
        <aside className="col-span-1 lg:col-span-3 min-w-0">
          <Card className="sticky top-24 overflow-hidden shadow-[0_1px_2px_0_rgba(0,0,0,0.04)] border-0 bg-white">
            <CardContent className="p-0">
              <nav className="flex flex-col" aria-label="Report sections">
                <button
                  onClick={() => scrollToSection('general-report')}
                  className={`group flex items-center justify-between px-4 py-3.5 text-left border-b hover:bg-muted/50 transition-all duration-200 ${
                    activeSection === 'general-report' ? 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 font-medium' : ''
                  }`}
                  aria-current={activeSection === 'general-report' ? 'true' : 'false'}
                >
                  <span className="flex-1 text-sm">General Report</span>
                  <ChevronRight className={`h-4 w-4 transition-transform group-hover:translate-x-1 ${
                    activeSection === 'general-report' ? 'text-blue-500' : ''
                  }`} />
                </button>
                <button
                  onClick={() => scrollToSection('staff-report')}
                  className={`group flex items-center justify-between px-4 py-3.5 text-left border-b hover:bg-muted/50 transition-all duration-200 ${
                    activeSection === 'staff-report' ? 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 font-medium' : ''
                  }`}
                  aria-current={activeSection === 'staff-report' ? 'true' : 'false'}
                >
                  <span className="flex-1 text-sm">Staff Report</span>
                  <ChevronRight className={`h-4 w-4 transition-transform group-hover:translate-x-1 ${
                    activeSection === 'staff-report' ? 'text-blue-500' : ''
                  }`} />
                </button>
                <button
                  onClick={() => scrollToSection('pipeline-report')}
                  className={`group flex items-center justify-between px-4 py-3.5 text-left hover:bg-muted/50 transition-all duration-200 ${
                    activeSection === 'pipeline-report' ? 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 font-medium' : ''
                  }`}
                  aria-current={activeSection === 'pipeline-report' ? 'true' : 'false'}
                >
                  <span className="flex-1 text-sm">Pipeline Report</span>
                  <ChevronRight className={`h-4 w-4 transition-transform group-hover:translate-x-1 ${
                    activeSection === 'pipeline-report' ? 'text-blue-500' : ''
                  }`} />
                </button>
              </nav>
            </CardContent>
          </Card>
        </aside>

        {/* Main Content Area */}
        <main className="col-span-1 lg:col-span-9 space-y-6 min-w-0">
          {/* General Report Section */}
          <section id="general-report" className="scroll-mt-28">
            <LeadGeneralReport />
          </section>

          {/* Staff Report Section */}
          <section id="staff-report" className="scroll-mt-28">
            <LeadStaffReport />
          </section>

          {/* Pipeline Report Section */}
          <section id="pipeline-report" className="scroll-mt-28">
            <LeadPipelineReport />
          </section>
        </main>
      </div>
    </div>
  )
}
