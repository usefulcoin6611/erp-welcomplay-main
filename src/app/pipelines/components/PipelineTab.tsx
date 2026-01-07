"use client"

import React from "react"
import {
  Card,
  CardContent,
  CardDescription,
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

export default function PipelineTab() {
  const totalPipelines = pipelines.length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Pipeline</h2>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="h-9 px-4 bg-blue-500 hover:bg-blue-600 shadow-none">
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
              <Button
                type="button"
                variant="outline"
                className="shadow-none"
              >
                Cancel
              </Button>
              <Button
                type="button"
                className="bg-blue-500 hover:bg-blue-600 shadow-none"
              >
                Save Pipeline
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pipeline List</CardTitle>
          <CardDescription>
            Daftar pipeline CRM.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pipeline</TableHead>
                  <TableHead className="text-right w-[250px]">
                    Action
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pipelines.map((pipeline) => (
                  <TableRow key={pipeline.id}>
                    <TableCell className="font-medium">
                      {pipeline.name}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0 shadow-none"
                        >
                          <IconPencil className="h-4 w-4" />
                        </Button>
                        {pipelines.length > 1 && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 shadow-none"
                          >
                            <IconTrash className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
