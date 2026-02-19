'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Upload, Eye, Trash2, FileText, Image as ImageIcon, Loader2 } from 'lucide-react'
import Image from 'next/image'
import { useDropzone } from 'react-dropzone'
import { toast } from 'sonner'

interface BillPaymentModalProps {
  bill: {
    id: string
    billId: string
    vendorId: string | null
    vendorName: string
    total: number
    status: string
  }
}

export function BillPaymentModal({ bill }: BillPaymentModalProps) {
  const [open, setOpen] = useState(false)
  const [loadingData, setLoadingData] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Data Master
  const [accounts, setAccounts] = useState<{ id: string; name: string }[]>([])
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([])
  const [vendors, setVendors] = useState<{ id: string; name: string }[]>([])

  const [formData, setFormData] = useState<{
    vendor: string
    date: string
    amount: string
    category: string
    account: string
    reference: string
    description: string
    paymentReceipt: File | null
  }>({
    vendor: '',
    date: new Date().toISOString().split('T')[0],
    amount: '',
    category: '',
    account: '',
    reference: '',
    description: '',
    paymentReceipt: null,
  })

  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      // Pre-fill form
      setFormData(prev => ({
        ...prev,
        vendor: bill.vendorId || '',
        amount: String(bill.total),
        reference: bill.billId,
        description: `Payment for bill #${bill.billId}`
      }))
      fetchMasterData()
    }
  }, [open, bill])

  const fetchMasterData = async () => {
    setLoadingData(true)
    try {
      const [resAccounts, resCategories, resVendors] = await Promise.all([
        fetch('/api/bank-accounts'),
        fetch('/api/categories'),
        fetch('/api/vendors')
      ])

      const jsonAccounts = await resAccounts.json()
      if (jsonAccounts.success) {
        setAccounts(jsonAccounts.data.map((a: any) => ({ 
          id: a.id, 
          name: `${a.bank} - ${a.name}` 
        })))
      }

      const jsonCategories = await resCategories.json()
      if (jsonCategories.success) {
        // Filter Expense categories
        const expenseCats = jsonCategories.data.filter((c: any) => c.type === 'Expense')
        setCategories(expenseCats.map((c: any) => ({ id: c.id, name: c.name })))
      }

      const jsonVendors = await resVendors.json()
      if (jsonVendors.success) {
        setVendors(jsonVendors.data.map((v: any) => ({ id: v.id, name: v.name })))
      }

    } catch (error) {
      console.error('Failed to load master data', error)
      toast.error('Gagal memuat data master')
    } finally {
      setLoadingData(false)
    }
  }

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      setFormData((prev) => ({ ...prev, paymentReceipt: file }))
      const objectUrl = URL.createObjectURL(file)
      setPreviewUrl(objectUrl)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg'],
      'application/pdf': ['.pdf'],
    },
    maxFiles: 1,
    multiple: false,
  })

  const handleRemoveReceipt = () => {
    setFormData((prev) => ({ ...prev, paymentReceipt: null }))
    setPreviewUrl(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Resolve names for API (since API currently takes names)
    // NOTE: Ideally API should take IDs. Following current PaymentTab pattern.
    const vendorName = vendors.find(v => v.id === formData.vendor)?.name || ''
    const accountName = accounts.find(a => a.id === formData.account)?.name || ''
    const categoryName = categories.find(c => c.id === formData.category)?.name || ''

    const submitData = new FormData()
    submitData.append('date', formData.date)
    submitData.append('vendor', vendorName)
    submitData.append('account', accountName)
    submitData.append('category', categoryName)
    submitData.append('amount', formData.amount)
    submitData.append('status', 'Completed')
    if (formData.reference) submitData.append('reference', formData.reference)
    if (formData.description) submitData.append('description', formData.description)
    if (formData.paymentReceipt) submitData.append('paymentReceipt', formData.paymentReceipt)

    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        body: submitData,
      })

      const json = await res.json()

      if (json.success) {
        toast.success('Pembayaran berhasil dibuat')
        setOpen(false)
        // Ideally trigger a refresh of the parent page or payments list
        window.location.reload() // Simple reload to update status/lists
      } else {
        toast.error(json.message || 'Gagal menyimpan pembayaran')
      }
    } catch (error) {
      console.error('Submit error:', error)
      toast.error('Terjadi kesalahan sistem')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="shadow-none h-8 px-3 ml-4">
          Add Payment
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Make Payment for {bill.billId}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Vendor (Read-only / Disabled) */}
              <div className="space-y-2">
                <Label>Vendor</Label>
                <Input value={bill.vendorName} disabled className="bg-gray-100" />
                {/* Hidden input to keep state consistent if needed, but we use formData.vendor */}
              </div>

              <div className="space-y-2">
                <Label htmlFor="pay-date">Date <span className="text-red-500">*</span></Label>
                <Input 
                  id="pay-date" 
                  type="date" 
                  required 
                  value={formData.date} 
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })} 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pay-amount">Amount <span className="text-red-500">*</span></Label>
                <Input 
                  id="pay-amount" 
                  type="number" 
                  step="0.01" 
                  required 
                  value={formData.amount} 
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })} 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pay-category">Category <span className="text-red-500">*</span></Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(value) => setFormData({ ...formData, category: value })} 
                  required
                >
                  <SelectTrigger id="pay-category">
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="pay-account">Payment Account <span className="text-red-500">*</span></Label>
                <Select 
                  value={formData.account} 
                  onValueChange={(value) => setFormData({ ...formData, account: value })} 
                  required
                >
                  <SelectTrigger id="pay-account">
                    <SelectValue placeholder="Select Account" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map((a) => (
                      <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="pay-ref">Reference</Label>
                <Input 
                  id="pay-ref" 
                  value={formData.reference} 
                  onChange={(e) => setFormData({ ...formData, reference: e.target.value })} 
                  placeholder="e.g. Transaction ID"
                />
              </div>

              <div className="space-y-2">
                <Label>Payment Receipt</Label>
                {!previewUrl ? (
                  <div
                    {...getRootProps()}
                    className={`
                      border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
                      ${isDragActive ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary hover:bg-gray-50'}
                    `}
                  >
                    <input {...getInputProps()} />
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Upload className="h-8 w-8" />
                      <p className="text-sm font-medium">
                        {isDragActive ? 'Drop file here' : 'Drag & drop or click'}
                      </p>
                      <p className="text-xs text-gray-400">PNG, JPG, PDF (Max 5MB)</p>
                    </div>
                  </div>
                ) : (
                  <div className="relative w-full border rounded-lg overflow-hidden bg-gray-50 p-2">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 shrink-0 bg-white rounded-md border flex items-center justify-center">
                        {previewUrl.endsWith('.pdf') ? <FileText className="h-5 w-5 text-red-500" /> : <ImageIcon className="h-5 w-5 text-blue-500" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{formData.paymentReceipt?.name}</p>
                      </div>
                      <Button type="button" variant="ghost" size="icon" onClick={handleRemoveReceipt} className="text-red-600 hover:bg-red-50">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="pay-desc">Description</Label>
                <Textarea 
                  id="pay-desc" 
                  rows={3} 
                  value={formData.description} 
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })} 
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" variant="blue" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Payment
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
