"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useTranslations } from "next-intl"

export function TopDueProjects() {
  const t = useTranslations('projectDashboard.topDueProjects')

  // Mock data
  const projects = [
    {
      name: 'Dashboard UI',
      budget: '$ 600.00',
      endDate: '20 Jul 2027',
      status: 'on_hold',
      statusLabel: 'On Hold',
      image: '/avatars/01.png'
    },
    {
      name: 'Bootstrap Framework',
      budget: '$ 900.00',
      endDate: '20 Jul 2026',
      status: 'complete',
      statusLabel: 'Complete',
      image: '/avatars/02.png'
    },
    {
      name: 'dadadsdad',
      budget: '$ 0.00',
      endDate: '30 Oct 2025',
      status: 'on_going',
      statusLabel: 'In Progress',
      image: '/avatars/03.png'
    },
    {
      name: 'Application UI',
      budget: '$ 800.00',
      endDate: '20 Jul 2025',
      status: 'on_going',
      statusLabel: 'In Progress',
      image: '/avatars/04.png'
    },
    {
      name: 'Website Redesign',
      budget: '$ 600.00',
      endDate: '20 Jul 2025',
      status: 'on_going',
      statusLabel: 'In Progress',
      image: '/avatars/05.png'
    }
  ]

  const getStatusColor = (status: string) => {
    const statusMap: Record<string, string> = {
      'on_going': 'bg-blue-500',
      'on_hold': 'bg-yellow-500',
      'complete': 'bg-green-500',
      'cancelled': 'bg-red-500',
    }
    return statusMap[status] || 'bg-gray-500'
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
                  projects.map((project, index) => (
                    <tr key={index} className="border-b transition-colors hover:bg-muted/50">
                      <td className="p-4 align-middle">
                        <div className="flex items-center gap-3">
                          <img 
                            src={project.image || '/placeholder-project.png'} 
                            alt={project.name}
                            className="w-10 h-10 rounded border-2 border-primary"
                          />
                          <div>
                            <h6 className="font-semibold mb-0">{project.name}</h6>
                            <p className="text-sm text-green-600 mb-0">{project.budget}</p>
                          </div>
                        </div>
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
