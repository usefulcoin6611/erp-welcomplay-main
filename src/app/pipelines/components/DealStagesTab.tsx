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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  IconPlus,
  IconGripVertical,
  IconPencil,
  IconTrash,
} from '@tabler/icons-react'

const pipelines = [
  {
    id: 1,
    name: 'Default Pipeline',
    stages: [
      { id: 1, name: 'Qualification', order: 0 },
      { id: 2, name: 'Needs Analysis', order: 1 },
      { id: 3, name: 'Proposal', order: 2 },
      { id: 4, name: 'Negotiation', order: 3 },
      { id: 5, name: 'Closed Won', order: 4 },
    ],
  },
  {
    id: 2,
    name: 'Enterprise Pipeline',
    stages: [
      { id: 6, name: 'Discovery', order: 0 },
      { id: 7, name: 'Proposal Sent', order: 1 },
      { id: 8, name: 'Approval', order: 2 },
    ],
  },
] as const

export default function DealStagesTab() {
  const [activeTab, setActiveTab] = React.useState(0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Deal Stages</h2>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button size="sm" variant="blue" className="shadow-none h-7">
              <IconPlus className="mr-2 h-4 w-4" />
              Create Deal Stage
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[480px]">
            <DialogHeader>
              <DialogTitle>Create Deal Stage</DialogTitle>
              <DialogDescription>
                Buat tahapan deal baru untuk pipeline yang dipilih.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="pipeline">Pipeline</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Pipeline" />
                  </SelectTrigger>
                  <SelectContent>
                    {pipelines.map((p) => (
                      <SelectItem key={p.id} value={p.id.toString()}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="stageName">Stage Name</Label>
                <Input
                  id="stageName"
                  placeholder="New Stage"
                  maxLength={20}
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
                Save Deal Stage
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        <Card>
          <CardContent className="p-3">
            <div className="flex gap-2">
              {pipelines.map((pipeline, idx) => (
                <button
                  key={pipeline.id}
                  onClick={() => setActiveTab(idx)}
                  className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                    activeTab === idx
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {pipeline.name}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-lg border border-gray-200 shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)]">
          <CardHeader>
            <CardTitle>Deal Stages</CardTitle>
            <CardDescription>
              Urutkan tahapan deal dengan drag & drop.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {pipelines[activeTab]?.stages.map((stage) => (
                <div
                  key={stage.id}
                  className="flex items-center justify-between rounded-md border p-3 hover:bg-accent"
                >
                  <div className="flex items-center gap-3">
                    <IconGripVertical className="h-5 w-5 text-muted-foreground cursor-move" />
                    <span className="font-medium">{stage.name}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0 shadow-none bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-100"
                    >
                      <IconPencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0 shadow-none bg-red-50 text-red-700 hover:bg-red-100 border-red-100"
                    >
                      <IconTrash className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              <strong>Note:</strong> You can easily change order of deal
              stage using drag & drop.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
