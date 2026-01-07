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

const sources = [
  { id: 1, name: 'Website' },
  { id: 2, name: 'Social Media' },
  { id: 3, name: 'Referral' },
  { id: 4, name: 'Email Campaign' },
  { id: 5, name: 'Cold Call' },
] as const

export default function SourcesTab() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Sources</h2>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="h-9 px-4 bg-blue-500 hover:bg-blue-600 shadow-none">
              <IconPlus className="mr-2 h-4 w-4" />
              Create Source
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[480px]">
            <DialogHeader>
              <DialogTitle>Create Source</DialogTitle>
              <DialogDescription>
                Tambahkan sumber baru untuk lead dan deal.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="sourceName">Source Name</Label>
                <Input
                  id="sourceName"
                  placeholder="Website"
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
                Save Source
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Source List</CardTitle>
          <CardDescription>
            Daftar sumber lead dan deal yang tersedia.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Source</TableHead>
                <TableHead className="text-right w-[250px]">
                  Action
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sources.map((source) => (
                <TableRow key={source.id}>
                  <TableCell className="font-medium">
                    {source.name}
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
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 shadow-none"
                      >
                        <IconTrash className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
