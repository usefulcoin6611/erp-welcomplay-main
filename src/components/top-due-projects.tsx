"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"
import { useTranslations } from "next-intl"
import { useProjectDashboard } from "@/contexts/project-dashboard-context"

const statusLabelMap: Record<string, string> = {
  on_going: 'In Progress',
  on_hold: 'On Hold',
  complete: 'Complete',
  cancelled: 'Cancelled',
}

export function TopDueProjects() {
  const t = useTranslations('projectDashboard.topDueProjects')
  const { data, loading } = useProjectDashboard()
  const projects = data.topDueProjects.map((p) => ({
    id: p.id,
    name: p.name,
    budget: new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(p.budget),
    endDate: p.endDate ? new Date(p.endDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '-',
    status: p.status,
    statusLabel: statusLabelMap[p.status] ?? p.status,
  }))

  const getStatusColor = (status: string) => {
    const statusMap: Record<string, string> = {
      'on_going': 'bg-blue-500',
      'on_hold': 'bg-yellow-500',
      'complete': 'bg-green-500',
      'cancelled': 'bg-red-500',
    }
    return statusMap[status] || 'bg-gray-500'
  }

  if (loading) {
    return (
      <Card>
        <CardHeader><CardTitle>{t('title')}</CardTitle></CardHeader>
        <CardContent><Skeleton className="h-[200px] w-full" /></CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <div className="relative w-full overflow-auto">
            <table className="w-full caption-bottom text-sm">
              <thead className="[&_tr]:border-b">
                <tr className="border-b transition-colors hover:bg-muted/50">
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    {t('name')}
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    {t('endDate')}
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    {t('status')}
                  </th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {projects.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="h-24 text-center text-muted-foreground">
                      {t('noProjects')}
                    </td>
                  </tr>
                ) : (
                  projects.map((project) => (
                    <tr key={project.id} className="border-b transition-colors hover:bg-muted/50">
                      <td className="p-4 align-middle">
                        <Link href={`/projects/project/${project.id}`} className="flex items-center gap-3 hover:opacity-80">
                          <div className="w-10 h-10 rounded border-2 border-primary bg-muted flex items-center justify-center text-muted-foreground text-xs font-medium">
                            {project.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <h6 className="font-semibold mb-0">{project.name}</h6>
                            <p className="text-sm text-green-600 mb-0">{project.budget}</p>
                          </div>
                        </Link>
                      </td>
                      <td className="p-4 align-middle">{project.endDate}</td>
                      <td className="p-4 align-middle">
                        <Badge className={`${getStatusColor(project.status)} text-white`}>
                          {project.statusLabel}
                        </Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
