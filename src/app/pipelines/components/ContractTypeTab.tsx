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

const contractTypes = [
  { id: 1, name: 'Service Agreement' },
  { id: 2, name: 'Maintenance Contract' },
  { id: 3, name: 'Support Contract' },
  { id: 4, name: 'License Agreement' },
  { id: 5, name: 'Consulting Agreement' },
] as const

export default function ContractTypeTab() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Contract Type</h2>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="h-9 px-4 bg-blue-500 hover:bg-blue-600 shadow-none">
              <IconPlus className="mr-2 h-4 w-4" />
              Create Contract Type
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[480px]">
            <DialogHeader>
              <DialogTitle>Create Contract Type</DialogTitle>
              <DialogDescription>
                Tambahkan tipe kontrak baru.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="typeName">Contract Type Name</Label>
                <Input
                  id="typeName"
                  placeholder="Service Agreement"
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
                Save Contract Type
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Contract Type List</CardTitle>
          <CardDescription>
            Daftar tipe kontrak yang tersedia.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contractTypes.map((type) => (
                <TableRow key={type.id}>
                  <TableCell className="font-medium">
                    {type.name}
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
