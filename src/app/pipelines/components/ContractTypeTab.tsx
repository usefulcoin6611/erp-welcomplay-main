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

/** Tombol Create Contract Type untuk action slot SmoothTab */
export function ContractTypeTabCreateButton() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" variant="blue" className="shadow-none h-7">
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
            <Input id="typeName" placeholder="Service Agreement" />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" className="shadow-none">
            Cancel
          </Button>
          <Button type="button" className="bg-blue-500 hover:bg-blue-600 shadow-none">
            Save Contract Type
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default function ContractTypeTab() {
  return (
    <div className="space-y-4">
      <Card className="rounded-lg border-0">
        <CardHeader className="px-4 py-3 border-b">
          <CardTitle className="text-base font-medium">Contract Type List</CardTitle>
          <CardDescription className="text-sm">
            Daftar tipe kontrak yang tersedia.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="px-4 py-3 font-medium">Name</TableHead>
                  <TableHead className="px-4 py-3 text-right w-[250px] font-medium">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contractTypes.map((type) => (
                  <TableRow key={type.id}>
                    <TableCell className="px-4 py-3 font-medium">
                      {type.name}
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
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0 shadow-none bg-red-50 text-red-700 hover:bg-red-100 border-red-100"
                      >
                        <IconTrash className="h-4 w-4" />
                      </Button>
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
