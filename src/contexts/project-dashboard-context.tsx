'use client'

import { createContext, useCallback, useContext, useEffect, useState } from 'react'

export type ProjectDashboardData = {
  stats: {
    totalProjects: number
    totalTasks: number
    totalExpense: number
    projectCompletionPercent: number
    taskCompletionPercent: number
  }
  projectStatuses: Array<{ status: string; total: number; percentage: number }>
  tasksOverview: Array<{ day: string; tasks: number }>
  timesheetLoggedHours: Array<{ day: string; hours: number; minutes: number }>
  topDueProjects: Array<{
    id: string
    name: string
    budget: number
    endDate: string
    status: string
  }>
  topDueTasks: Array<{
    id: string
    taskKey: string
    task: string
    project: string
    stage: string
    completion: string
    endDate: string
  }>
}

const defaultData: ProjectDashboardData = {
  stats: {
    totalProjects: 0,
    totalTasks: 0,
    totalExpense: 0,
    projectCompletionPercent: 0,
    taskCompletionPercent: 0,
  },
  projectStatuses: [],
  tasksOverview: [],
  timesheetLoggedHours: [],
  topDueProjects: [],
  topDueTasks: [],
}

type ContextValue = {
  data: ProjectDashboardData
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

const ProjectDashboardContext = createContext<ContextValue>({
  data: defaultData,
  loading: true,
  error: null,
  refetch: async () => {},
})

export function ProjectDashboardProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<ProjectDashboardData>(defaultData)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/project-dashboard')
      const json = await res.json()
      if (json.success && json.data) setData(json.data)
      else setData(defaultData)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load')
      setData(defaultData)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refetch()
  }, [refetch])

  return (
    <ProjectDashboardContext.Provider value={{ data, loading, error, refetch }}>
      {children}
    </ProjectDashboardContext.Provider>
  )
}

export function useProjectDashboard() {
  const ctx = useContext(ProjectDashboardContext)
  if (!ctx) throw new Error('useProjectDashboard must be used within ProjectDashboardProvider')
  return ctx
}
