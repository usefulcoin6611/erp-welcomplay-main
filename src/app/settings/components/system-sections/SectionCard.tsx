"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { ReactNode } from 'react'

interface SectionCardProps {
  title: string
  description?: string
  children: ReactNode
}

export function SectionCard({ title, description, children }: SectionCardProps) {
  return (
    <Card className="rounded-lg shadow-none">
      <CardHeader className="px-6 py-4 rounded-t-lg">
        <CardTitle className="text-base font-medium leading-none">{title}</CardTitle>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </CardHeader>
      <CardContent className="px-6 py-4">{children}</CardContent>
    </Card>
  )
}
