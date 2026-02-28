"use client"

import { useState, useEffect, useCallback } from 'react'
import { AppSidebar } from '@/components/app-sidebar'
import { SiteHeader } from '@/components/site-header'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { MainContentWrapper } from '@/components/main-content-wrapper'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Eye, Pencil, Trash, RefreshCw, Search } from 'lucide-react'
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
import { toast } from 'sonner'

interface Coupon {
  id: string
  name: string
  code: string
  discount: number
  limit: number
  used: number
  isActive: boolean
  createdAt: string
}

const defaultFormData = {
  name: '',
  discount: '',
  limit: '',
  manualCode: '',
  autoCode: '',
}

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')

  const [dialogOpen, setDialogOpen] = useState(false)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null)
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null)
  const [couponToDelete, setCouponToDelete] = useState<Coupon | null>(null)

  const [codeType, setCodeType] = useState<'manual' | 'auto'>('manual')
  const [formData, setFormData] = useState(defaultFormData)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  const loadCoupons = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      const res = await fetch(`/api/coupons?${params.toString()}`, { cache: 'no-store' })
      const json = await res.json()
      if (json.success && Array.isArray(json.data)) {
        setCoupons(json.data)
      } else {
        toast.error(json.message || 'Failed to load coupons')
      }
    } catch {
      toast.error('Failed to load coupons')
    } finally {
      setLoading(false)
    }
  }, [search])

  useEffect(() => {
    loadCoupons()
  }, [loadCoupons])

  const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let result = ''
    for (let i = 0; i < 10; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setFormData({ ...formData, autoCode: result })
  }

  const validateForm = () => {
    const errors: Record<string, string> = {}
    if (!formData.name.trim()) errors.name = 'Coupon name is required'
    if (!formData.discount || isNaN(Number(formData.discount))) errors.discount = 'Valid discount is required'
    else if (Number(formData.discount) < 0 || Number(formData.discount) > 100) errors.discount = 'Discount must be between 0 and 100'
    if (!formData.limit || isNaN(Number(formData.limit))) errors.limit = 'Valid limit is required'
    else if (Number(formData.limit) < 0) errors.limit = 'Limit must be non-negative'
    const code = codeType === 'manual' ? formData.manualCode : formData.autoCode
    if (!code.trim()) errors.code = 'Coupon code is required'
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const resetForm = () => {
    setFormData(defaultFormData)
    setCodeType('manual')
    setFormErrors({})
  }

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return
    const code = (codeType === 'manual' ? formData.manualCode : formData.autoCode).toUpperCase()
    setSaving(true)
    try {
      const res = await fetch('/api/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          code,
          discount: Number(formData.discount),
          limit: Number(formData.limit),
        }),
      })
      const json = await res.json()
      if (!res.ok || !json.success) {
        toast.error(json.message || 'Failed to create coupon')
        return
      }
      toast.success('Coupon created successfully')
      setDialogOpen(false)
      resetForm()
      await loadCoupons()
    } catch {
      toast.error('Failed to create coupon')
    } finally {
      setSaving(false)
    }
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
    setFormErrors({})
    setEditDialogOpen(true)
  }

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingCoupon || !validateForm()) return
    const code = (codeType === 'manual' ? formData.manualCode : formData.autoCode).toUpperCase()
    setSaving(true)
    try {
      const res = await fetch(`/api/coupons/${editingCoupon.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          code,
          discount: Number(formData.discount),
          limit: Number(formData.limit),
        }),
      })
      const json = await res.json()
      if (!res.ok || !json.success) {
        toast.error(json.message || 'Failed to update coupon')
        return
      }
      toast.success('Coupon updated successfully')
      setEditDialogOpen(false)
      setEditingCoupon(null)
      resetForm()
      await loadCoupons()
    } catch {
      toast.error('Failed to update coupon')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteClick = (coupon: Coupon) => {
    setCouponToDelete(coupon)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!couponToDelete) return
    setSaving(true)
    try {
      const res = await fetch(`/api/coupons/${couponToDelete.id}`, { method: 'DELETE' })
      const json = await res.json()
      if (!res.ok || !json.success) {
        toast.error(json.message || 'Failed to delete coupon')
        return
      }
      toast.success('Coupon deleted successfully')
      setDeleteDialogOpen(false)
      setCouponToDelete(null)
      await loadCoupons()
    } catch {
      toast.error('Failed to delete coupon')
    } finally {
      setSaving(false)
    }
  }

  const CouponFormFields = () => (
    <div className="grid gap-4 py-4">
      <div className="space-y-1.5">
        <Label className="text-sm font-medium">Name <span className="text-red-500">*</span></Label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="e.g. New Year Special"
          className={`bg-gray-50 ${formErrors.name ? 'border-red-500' : 'border-0'}`}
        />
        {formErrors.name && <p className="text-xs text-red-500">{formErrors.name}</p>}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-sm font-medium">Discount (%) <span className="text-red-500">*</span></Label>
          <Input
            type="number"
            step="0.01"
            min="0"
            max="100"
            value={formData.discount}
            onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
            placeholder="e.g. 10, 20, 50"
            className={`bg-gray-50 ${formErrors.discount ? 'border-red-500' : 'border-0'}`}
          />
          {formErrors.discount && <p className="text-xs text-red-500">{formErrors.discount}</p>}
          <p className="text-xs text-muted-foreground">Percentage (0-100)</p>
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-medium">Limit <span className="text-red-500">*</span></Label>
          <Input
            type="number"
            min="0"
            value={formData.limit}
            onChange={(e) => setFormData({ ...formData, limit: e.target.value })}
            placeholder="e.g. 100 (0 = unlimited)"
            className={`bg-gray-50 ${formErrors.limit ? 'border-red-500' : 'border-0'}`}
          />
          {formErrors.limit && <p className="text-xs text-red-500">{formErrors.limit}</p>}
          <p className="text-xs text-muted-foreground">0 = Unlimited</p>
        </div>
      </div>
      <div className="space-y-2">
        <Label className="text-sm font-medium">Code <span className="text-red-500">*</span></Label>
        <RadioGroup
          value={codeType}
          onValueChange={(value) => {
            setCodeType(value as 'manual' | 'auto')
            if (value === 'manual') setFormData({ ...formData, autoCode: '' })
            else setFormData({ ...formData, manualCode: '' })
          }}
          className="flex gap-6"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="manual" id="manual_code" />
            <Label htmlFor="manual_code" className="text-sm cursor-pointer">Manual</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="auto" id="auto_code" />
            <Label htmlFor="auto_code" className="text-sm cursor-pointer">Auto Generate</Label>
          </div>
        </RadioGroup>
      </div>
      {codeType === 'manual' ? (
        <div className="space-y-1.5">
          <Input
            value={formData.manualCode}
            onChange={(e) => setFormData({ ...formData, manualCode: e.target.value.toUpperCase() })}
            placeholder="e.g. SUMMER50"
            className={`uppercase bg-gray-50 ${formErrors.code ? 'border-red-500' : 'border-0'}`}
          />
          {formErrors.code && <p className="text-xs text-red-500">{formErrors.code}</p>}
        </div>
      ) : (
        <div className="space-y-1.5">
          <div className="flex gap-2">
            <Input
              value={formData.autoCode}
              onChange={(e) => setFormData({ ...formData, autoCode: e.target.value.toUpperCase() })}
              placeholder="Click generate or enter manually"
              className={`flex-1 uppercase bg-gray-50 ${formErrors.code ? 'border-red-500' : 'border-0'}`}
            />
            <Button
              type="button"
              variant="outline"
              onClick={generateCode}
              className="shadow-none bg-gray-50 border-0 hover:bg-gray-100"
              title="Generate random code"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
          {formErrors.code && <p className="text-xs text-red-500">{formErrors.code}</p>}
        </div>
      )}
    </div>
  )

  return (
    <SidebarProvider
      style={{ '--sidebar-width': 'calc(var(--spacing) * 72)', '--header-height': 'calc(var(--spacing) * 12)' } as React.CSSProperties}
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <MainContentWrapper>
          <div className="@container/main flex flex-1 flex-col gap-4 p-4 bg-gray-100 min-h-screen">

            {/* Page Header */}
            <div className="bg-white rounded-2xl px-6 py-4 flex items-center justify-between gap-4 shadow-sm">
              <div>
                <h1 className="text-lg font-semibold text-gray-900">Coupons</h1>
                <p className="text-sm text-muted-foreground">{coupons.length} coupons available</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search coupons..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9 h-9 w-56 bg-gray-50 border-0 shadow-none rounded-lg"
                  />
                </div>
                <Dialog open={dialogOpen} onOpenChange={(open) => {
                  setDialogOpen(open)
                  if (!open) resetForm()
                }}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="blue" className="shadow-none rounded-lg h-9 px-4">
                      <Plus className="mr-1.5 h-4 w-4" /> Create Coupon
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl">
                    <DialogHeader>
                      <DialogTitle>Create New Coupon</DialogTitle>
                      <DialogDescription>Add a new discount coupon to your system.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreateSubmit}>
                      <CouponFormFields />
                      <DialogFooter className="gap-2">
                        <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="rounded-lg">Cancel</Button>
                        <Button type="submit" variant="blue" disabled={saving} className="rounded-lg">
                          {saving ? 'Creating...' : 'Create Coupon'}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Coupons Table */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="text-center">
                    <div className="h-8 w-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">Loading coupons...</p>
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Code</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Discount</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Limit</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Used</th>
                        <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {coupons.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                            No coupons found. Create your first coupon.
                          </td>
                        </tr>
                      ) : (
                        coupons.map((coupon) => (
                          <tr key={coupon.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 text-sm font-medium text-gray-900">{coupon.name}</td>
                            <td className="px-6 py-4">
                              <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-mono font-semibold">
                                {coupon.code}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="px-2.5 py-1 bg-green-50 text-green-700 rounded-lg text-xs font-semibold">
                                {coupon.discount}%
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                              {coupon.limit === 0 ? (
                                <span className="text-muted-foreground">Unlimited</span>
                              ) : coupon.limit}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                              <div className="flex items-center gap-2">
                                <span>{coupon.used}</span>
                                {coupon.limit > 0 && (
                                  <div className="flex-1 max-w-[60px] bg-gray-100 rounded-full h-1.5">
                                    <div
                                      className="bg-blue-500 h-1.5 rounded-full"
                                      style={{ width: `${Math.min(100, (coupon.used / coupon.limit) * 100)}%` }}
                                    />
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center justify-center gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="shadow-none h-7 bg-amber-50 text-amber-700 hover:bg-amber-100 border-0 rounded-lg"
                                  onClick={() => handleView(coupon)}
                                  title="View"
                                >
                                  <Eye className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="shadow-none h-7 bg-blue-50 text-blue-700 hover:bg-blue-100 border-0 rounded-lg"
                                  onClick={() => handleEdit(coupon)}
                                  title="Edit"
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="shadow-none h-7 bg-red-50 text-red-700 hover:bg-red-100 border-0 rounded-lg"
                                  onClick={() => handleDeleteClick(coupon)}
                                  title="Delete"
                                >
                                  <Trash className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* View Coupon Dialog */}
            <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
              <DialogContent className="max-w-lg rounded-2xl">
                <DialogHeader>
                  <DialogTitle>Coupon Details</DialogTitle>
                  <DialogDescription>View coupon information and usage</DialogDescription>
                </DialogHeader>
                {selectedCoupon && (
                  <div className="space-y-4 py-2">
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: 'Coupon Name', value: selectedCoupon.name },
                        { label: 'Coupon Code', value: selectedCoupon.code, mono: true },
                        { label: 'Discount', value: `${selectedCoupon.discount}%` },
                        { label: 'Limit', value: selectedCoupon.limit === 0 ? 'Unlimited' : selectedCoupon.limit.toString() },
                        { label: 'Used', value: selectedCoupon.used.toString() },
                        { label: 'Status', value: selectedCoupon.isActive ? 'Active' : 'Inactive' },
                      ].map((item) => (
                        <div key={item.label} className="bg-gray-50 rounded-xl px-4 py-3">
                          <p className="text-xs text-muted-foreground mb-1">{item.label}</p>
                          <p className={`text-sm font-semibold ${item.mono ? 'font-mono text-blue-700' : 'text-gray-900'}`}>
                            {item.value}
                          </p>
                        </div>
                      ))}
                    </div>
                    {selectedCoupon.limit > 0 && (
                      <div className="bg-gray-50 rounded-xl px-4 py-3">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs text-muted-foreground">Usage Progress</p>
                          <p className="text-xs font-medium">{selectedCoupon.used}/{selectedCoupon.limit}</p>
                        </div>
                        <div className="bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full transition-all"
                            style={{ width: `${Math.min(100, (selectedCoupon.used / selectedCoupon.limit) * 100)}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
                <DialogFooter>
                  <Button variant="outline" onClick={() => setViewDialogOpen(false)} className="rounded-lg">Close</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Edit Coupon Dialog */}
            <Dialog open={editDialogOpen} onOpenChange={(open) => {
              setEditDialogOpen(open)
              if (!open) { setEditingCoupon(null); resetForm() }
            }}>
              <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl">
                <DialogHeader>
                  <DialogTitle>Edit Coupon</DialogTitle>
                  <DialogDescription>Update discount coupon information.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleUpdateSubmit}>
                  <CouponFormFields />
                  <DialogFooter className="gap-2">
                    <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)} className="rounded-lg">Cancel</Button>
                    <Button type="submit" variant="blue" disabled={saving} className="rounded-lg">
                      {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
              <AlertDialogContent className="rounded-2xl">
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Coupon?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete coupon <strong>"{couponToDelete?.name}"</strong> ({couponToDelete?.code})?
                    This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setCouponToDelete(null)} className="rounded-lg">Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleConfirmDelete}
                    className="bg-red-600 hover:bg-red-700 rounded-lg"
                    disabled={saving}
                  >
                    {saving ? 'Deleting...' : 'Delete'}
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
