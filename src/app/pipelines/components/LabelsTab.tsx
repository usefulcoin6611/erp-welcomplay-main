"use client"

import React from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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
  IconPencil,
  IconTrash,
} from '@tabler/icons-react'

const pipelines = [
  {
    id: 1,
    name: 'Default Pipeline',
    labels: [
      { id: 1, name: 'Hot', color: '#ef4444' },
      { id: 2, name: 'Warm', color: '#f59e0b' },
      { id: 3, name: 'Cold', color: '#3b82f6' },
    ],
  },
  {
    id: 2,
    name: 'Enterprise Pipeline',
    labels: [
      { id: 4, name: 'VIP', color: '#8b5cf6' },
      { id: 5, name: 'Standard', color: '#10b981' },
    ],
  },
] as const

const labelColors = [
  { value: '#ef4444', label: 'Red' },
  { value: '#f59e0b', label: 'Orange' },
  { value: '#3b82f6', label: 'Blue' },
  { value: '#10b981', label: 'Green' },
  { value: '#8b5cf6', label: 'Purple' },
  { value: '#ec4899', label: 'Pink' },
] as const

export default function LabelsTab() {
  const [activeTab, setActiveTab] = React.useState(0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Labels</h2>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button size="sm" variant="blue" className="shadow-none h-7">
              <IconPlus className="mr-2 h-4 w-4" />
              Create Label
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[480px]">
            <DialogHeader>
              <DialogTitle>Create Label</DialogTitle>
              <DialogDescription>
                Buat label baru dengan warna untuk pipeline yang dipilih.
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
                <Label htmlFor="labelName">Label Name</Label>
                <Input
                  id="labelName"
                  placeholder="Hot"
                  maxLength={20}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="labelColor">Color</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Color" />
                  </SelectTrigger>
                  <SelectContent>
                    {labelColors.map((color) => (
                      <SelectItem key={color.value} value={color.value}>
                        <div className="flex items-center gap-2">
                          <div
                            className="h-4 w-4 rounded-full"
                            style={{ backgroundColor: color.value }}
                          />
                          {color.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                Save Label
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
            <CardTitle>Labels</CardTitle>
            <CardDescription>
              Daftar label untuk mengkategorikan lead dan deal.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {pipelines[activeTab]?.labels.map((label) => (
                <div
                  key={label.id}
                  className="flex items-center justify-between rounded-md border p-3 hover:bg-accent"
                >
                  <Badge
                    className="border-none"
                    style={{
                      backgroundColor: `${label.color}20`,
                      color: label.color,
                    }}
                  >
                    {label.name}
                  </Badge>
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
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
