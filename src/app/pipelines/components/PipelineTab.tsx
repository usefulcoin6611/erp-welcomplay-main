"use client"

import React, { useState, useMemo } from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  IconPlus,
  IconPencil,
  IconTrash,
} from '@tabler/icons-react'
import { Search, X } from 'lucide-react'

const pipelines = [
  {
    id: 1,
    name: 'Default Pipeline',
    deals: 12,
    value: 820_000_000,
  },
  {
    id: 2,
    name: 'Enterprise Deals',
    deals: 5,
    value: 1_250_000_000,
  },
] as const

/** Tombol Create Pipeline untuk action slot SmoothTab (inline dengan tab bar) */
export function PipelineTabCreateButton() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" variant="blue" className="shadow-none h-7">
          <IconPlus className="mr-2 h-4 w-4" />
          Create Pipeline
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Create Pipeline</DialogTitle>
          <DialogDescription>
            Tambahkan pipeline baru seperti di modul Pipeline ERP.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="pipelineName">Pipeline Name</Label>
            <Input
              id="pipelineName"
              placeholder="Default Pipeline"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" className="shadow-none">
            Cancel
          </Button>
          <Button type="button" className="bg-blue-500 hover:bg-blue-600 shadow-none">
            Save Pipeline
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default function PipelineTab() {
  const [search, setSearch] = useState('')
  const filteredPipelines = useMemo(() => {
    if (!search.trim()) return pipelines
    const q = search.trim().toLowerCase()
    return pipelines.filter((p) => p.name.toLowerCase().includes(q))
  }, [search])

  return (
    <div className="space-y-4">
      <Card className="rounded-lg border-0">
        <CardHeader className="px-4 py-3 border-b w-full">
          <div className="flex w-full items-center justify-between gap-4">
            <CardTitle className="text-base font-medium shrink-0">Pipeline List</CardTitle>
            <div className="shrink-0">
              <div className="relative w-64 sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search pipelines..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 pr-9 h-9 bg-gray-50 hover:bg-gray-100 focus-visible:ring-0 border-0 focus-visible:border-0 shadow-none transition-colors"
                />
                {search.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                    onClick={() => setSearch('')}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="px-4 py-3 font-medium">Pipeline</TableHead>
                  <TableHead className="px-4 py-3 text-right w-[250px] font-medium">
                    Action
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPipelines.length > 0 ? (
                  filteredPipelines.map((pipeline) => (
                    <TableRow key={pipeline.id}>
                      <TableCell className="px-4 py-3 font-medium">
                        {pipeline.name}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0 shadow-none bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-100"
                          >
                            <IconPencil className="h-4 w-4" />
                          </Button>
                          {pipelines.length > 1 && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0 shadow-none bg-red-50 text-red-700 hover:bg-red-100 border-red-100"
                            >
                              <IconTrash className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={2} className="px-4 py-8 text-center text-muted-foreground">
                      No pipelines found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
