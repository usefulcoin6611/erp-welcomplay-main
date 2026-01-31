"use client"

import { useState } from 'react'
import { AppSidebar } from '@/components/app-sidebar'
import { SiteHeader } from '@/components/site-header'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { MainContentWrapper } from '@/components/main-content-wrapper'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Eye, Pencil, Trash, RefreshCw } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

// Types
interface Coupon {
  id: string
  name: string
  code: string
  discount: number
  limit: number
  used: number
}

// Mock data
const mockCoupons: Coupon[] = [
  {
    id: '1',
    name: 'New Year Special',
    code: 'NEWYEAR2024',
    discount: 20,
    limit: 100,
    used: 45,
  },
  {
    id: '2',
    name: 'Summer Sale',
    code: 'SUMMER50',
    discount: 50,
    limit: 50,
    used: 32,
  },
  {
    id: '3',
    name: 'Welcome Bonus',
    code: 'WELCOME10',
    discount: 10,
    limit: 200,
    used: 120,
  },
]

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>(mockCoupons)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null)
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null)
  const [couponToDelete, setCouponToDelete] = useState<string | null>(null)
  const [codeType, setCodeType] = useState<'manual' | 'auto'>('manual')
  const [formData, setFormData] = useState({
    name: '',
    discount: '',
    limit: '',
    manualCode: '',
    autoCode: '',
  })

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const code = codeType === 'manual' ? formData.manualCode.toUpperCase() : formData.autoCode
    if (!code) {
      alert('Coupon code is required')
      return
    }
    console.log('Form data:', { ...formData, code })
    setDialogOpen(false)
    setFormData({
      name: '',
      discount: '',
      limit: '',
      manualCode: '',
      autoCode: '',
    })
    setCodeType('manual')
  }

  const generateCode = () => {
    const length = 10
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let result = ''
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length))
    }
    setFormData({ ...formData, autoCode: result })
  }

  const handleView = (coupon: Coupon) => {
    setSelectedCoupon(coupon)
    setViewDialogOpen(true)
  }

  const handleEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon)
    setFormData({
      name: coupon.name,
      discount: coupon.discount.toString(),
      limit: coupon.limit.toString(),
      manualCode: coupon.code,
      autoCode: '',
    })
    setCodeType('manual')
    setEditDialogOpen(true)
  }

  const handleUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingCoupon) return

    const code = codeType === 'manual' ? formData.manualCode.toUpperCase() : formData.autoCode
    if (!code) {
      alert('Coupon code is required')
      return
    }

    // Update coupon in state
    setCoupons(
      coupons.map((c) =>
        c.id === editingCoupon.id
          ? {
              ...c,
              name: formData.name,
              code: code,
              discount: parseFloat(formData.discount),
              limit: parseInt(formData.limit),
            }
          : c
      )
    )

    setEditDialogOpen(false)
    setEditingCoupon(null)
    setFormData({
      name: '',
      discount: '',
      limit: '',
      manualCode: '',
      autoCode: '',
    })
    setCodeType('manual')
  }

  const handleDeleteClick = (id: string) => {
    setCouponToDelete(id)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = () => {
    if (couponToDelete) {
      setCoupons(coupons.filter((c) => c.id !== couponToDelete))
      setDeleteDialogOpen(false)
      setCouponToDelete(null)
    }
  }

  return (
    <SidebarProvider
      style={
        {
          '--sidebar-width': 'calc(var(--spacing) * 72)',
          '--header-height': 'calc(var(--spacing) * 12)',
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <MainContentWrapper>
          <div className="@container/main flex flex-1 flex-col gap-4 p-4 bg-gray-50">
            {/* Header */}
            <div className="flex items-center justify-end">
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="blue" className="shadow-none">
                    <Plus className="mr-2 h-4 w-4" /> Create Coupon
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Create New Coupon</DialogTitle>
                    <DialogDescription>
                      Add a new discount coupon to your system.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCreateSubmit}>
                    <div className="grid gap-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="Enter Name"
                          required
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="discount" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Discount (%) <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="discount"
                            type="number"
                            step="0.01"
                            value={formData.discount}
                            onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                            placeholder="Enter Discount"
                            required
                          />
                          <p className="text-xs text-muted-foreground">Note: Discount in Percentage</p>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="limit" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Limit <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="limit"
                            type="number"
                            value={formData.limit}
                            onChange={(e) => setFormData({ ...formData, limit: e.target.value })}
                            placeholder="Enter Limit"
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Code <span className="text-red-500">*</span></Label>
                        <RadioGroup
                          value={codeType}
                          onValueChange={(value) => {
                            setCodeType(value as 'manual' | 'auto')
                            if (value === 'manual') {
                              setFormData({ ...formData, autoCode: '' })
                            } else {
                              setFormData({ ...formData, manualCode: '' })
                            }
                          }}
                          className="flex gap-6"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="manual" id="manual_code" />
                            <Label htmlFor="manual_code" className="text-sm font-medium text-gray-700 dark:text-gray-300">Manual</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="auto" id="auto_code" />
                            <Label htmlFor="auto_code" className="text-sm font-medium text-gray-700 dark:text-gray-300">Auto Generate</Label>
                          </div>
                        </RadioGroup>
                      </div>
                      {codeType === 'manual' ? (
                        <div className="space-y-2">
                          <Input
                            id="manual-code"
                            value={formData.manualCode}
                            onChange={(e) =>
                              setFormData({ ...formData, manualCode: e.target.value.toUpperCase() })
                            }
                            placeholder="Enter Code"
                            className="uppercase"
                            required
                          />
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <Input
                            id="auto-code"
                            value={formData.autoCode}
                            onChange={(e) => setFormData({ ...formData, autoCode: e.target.value })}
                            placeholder="Enter Code"
                            className="flex-1"
                            required
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={generateCode}
                            className="shadow-none"
                          >
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                    <DialogFooter>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setDialogOpen(false)
                          setFormData({
                            name: '',
                            discount: '',
                            limit: '',
                            manualCode: '',
                            autoCode: '',
                          })
                          setCodeType('manual')
                        }}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" variant="blue" className="shadow-none">
                        Create Coupon
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {/* Coupons Table */}
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-white">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium">Name</th>
                        <th className="px-4 py-3 text-left text-xs font-medium">Code</th>
                        <th className="px-4 py-3 text-left text-xs font-medium">Discount (%)</th>
                        <th className="px-4 py-3 text-left text-xs font-medium">Limit</th>
                        <th className="px-4 py-3 text-left text-xs font-medium">Used</th>
                        <th className="px-4 py-3 text-center text-xs font-medium">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {coupons.map((coupon) => (
                        <tr key={coupon.id} className="border-t hover:bg-muted/50">
                          <td className="px-4 py-3">{coupon.name}</td>
                          <td className="px-4 py-3">
                            <code className="px-2 py-1 bg-muted rounded text-sm">{coupon.code}</code>
                          </td>
                          <td className="px-4 py-3">{coupon.discount}%</td>
                          <td className="px-4 py-3">{coupon.limit}</td>
                          <td className="px-4 py-3">{coupon.used}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="shadow-none h-7 bg-yellow-50 text-yellow-700 hover:bg-yellow-100 border-yellow-100"
                                onClick={() => handleView(coupon)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="shadow-none h-7 bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-100"
                                onClick={() => handleEdit(coupon)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="shadow-none h-7 bg-red-50 text-red-700 hover:bg-red-100 border-red-100"
                                onClick={() => handleDeleteClick(coupon.id)}
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* View Coupon Dialog */}
            <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Coupon Details</DialogTitle>
                  <DialogDescription>
                    View users who have used this coupon
                  </DialogDescription>
                </DialogHeader>
                {selectedCoupon && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Coupon Name</Label>
                        <p className="font-normal">{selectedCoupon.name}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Coupon Code</Label>
                        <p className="font-medium">
                          <code className="px-2 py-1 bg-muted rounded">{selectedCoupon.code}</code>
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Discount</Label>
                        <p className="font-medium">{selectedCoupon.discount}%</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Used / Limit</Label>
                        <p className="font-normal">
                          {selectedCoupon.used} / {selectedCoupon.limit}
                        </p>
                      </div>
                    </div>
                    <div className="border-t pt-4">
                      <Label className="text-muted-foreground mb-2 block">Users</Label>
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">
                          No users have used this coupon yet.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                <DialogFooter>
                  <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
                    Close
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Edit Coupon Dialog */}
            {editingCoupon && (
              <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Edit Coupon</DialogTitle>
                    <DialogDescription>
                      Update discount coupon information.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleUpdateSubmit}>
                    <div className="grid gap-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="edit_name" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="edit_name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="Enter Name"
                          required
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="edit_discount" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Discount (%) <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="edit_discount"
                            type="number"
                            step="0.01"
                            value={formData.discount}
                            onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                            placeholder="Enter Discount"
                            required
                          />
                          <p className="text-xs text-muted-foreground">Note: Discount in Percentage</p>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit_limit" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Limit <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="edit_limit"
                            type="number"
                            value={formData.limit}
                            onChange={(e) => setFormData({ ...formData, limit: e.target.value })}
                            placeholder="Enter Limit"
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Code <span className="text-red-500">*</span></Label>
                        <RadioGroup
                          value={codeType}
                          onValueChange={(value) => {
                            setCodeType(value as 'manual' | 'auto')
                            if (value === 'manual') {
                              setFormData({ ...formData, autoCode: '' })
                            } else {
                              setFormData({ ...formData, manualCode: '' })
                            }
                          }}
                          className="flex gap-6"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="manual" id="edit_manual_code" />
                            <Label htmlFor="edit_manual_code" className="text-sm font-medium text-gray-700 dark:text-gray-300">Manual</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="auto" id="edit_auto_code" />
                            <Label htmlFor="edit_auto_code" className="text-sm font-medium text-gray-700 dark:text-gray-300">Auto Generate</Label>
                          </div>
                        </RadioGroup>
                      </div>
                      {codeType === 'manual' ? (
                        <div className="space-y-2">
                          <Input
                            id="edit_manual-code"
                            value={formData.manualCode}
                            onChange={(e) =>
                              setFormData({ ...formData, manualCode: e.target.value.toUpperCase() })
                            }
                            placeholder="Enter Code"
                            className="uppercase"
                            required
                          />
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <Input
                            id="edit_auto-code"
                            value={formData.autoCode}
                            onChange={(e) => setFormData({ ...formData, autoCode: e.target.value })}
                            placeholder="Enter Code"
                            className="flex-1"
                            required
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={generateCode}
                            className="shadow-none"
                          >
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                    <DialogFooter>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setEditDialogOpen(false)
                          setEditingCoupon(null)
                          setFormData({
                            name: '',
                            discount: '',
                            limit: '',
                            manualCode: '',
                            autoCode: '',
                          })
                          setCodeType('manual')
                        }}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" variant="blue" className="shadow-none">
                        Update Coupon
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            )}

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Coupon</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this coupon? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setCouponToDelete(null)}>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleConfirmDelete}
                    className="bg-red-500 hover:bg-red-600"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </MainContentWrapper>
      </SidebarInset>
    </SidebarProvider>
  )
}


