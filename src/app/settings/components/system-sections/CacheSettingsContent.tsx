"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export function CacheSettingsContent() {
  const [cacheSize, setCacheSize] = useState('0.00')

  const handleClearCache = (e: React.FormEvent) => {
    e.preventDefault()
    // Mock clearing
    toast.success('Cache cleared successfully!')
  }

  return (
    <Card className="rounded-lg shadow-none">
      <CardHeader className="px-6 py-4 rounded-t-lg">
        <CardTitle className="text-base font-medium leading-none">Cache Settings</CardTitle>
        <p className="text-sm text-muted-foreground">
          This is a page meant for more advanced users, simply ignore it if you don't understand what cache is.
        </p>
      </CardHeader>
      <CardContent className="px-6 py-4">
        <form onSubmit={handleClearCache} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cache_size" className="text-sm font-medium text-gray-700 dark:text-gray-300">Current cache size</Label>
            <div className="flex">
              <Input
                id="cache_size"
                value={cacheSize}
                readOnly
                variant="modern"
                className="rounded-r-none"
              />
              <div className="px-4 py-2 bg-muted border border-l-0 rounded-r-lg flex items-center">
                <span className="text-sm">MB</span>
              </div>
            </div>
          </div>
          <div className="flex justify-end pt-4 border-t">
            <Button type="submit" variant="blue" className="shadow-none">
              Cache Clear
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
