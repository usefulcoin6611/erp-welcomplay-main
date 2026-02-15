'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DatePicker } from '@/components/ui/date-picker'

const STATUS_OPTIONS = [
  { value: '0', label: 'Draft' },
  { value: '1', label: 'Sent' },
  { value: '2', label: 'Accepted' },
  { value: '3', label: 'Declined' },
  { value: '4', label: 'Expired' },
]

export default function EditEstimatePage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const id = params?.id

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [customerName, setCustomerName] = useState('')
  const [customerCode, setCustomerCode] = useState('')
  const [issueDate, setIssueDate] = useState('')
  const [status, setStatus] = useState('0')
  const [description, setDescription] = useState('')

  useEffect(() => {
    const load = async () => {
      if (!id) return
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`/api/estimates/${id}`)
        const json = await res.json()
        if (!json.success) throw new Error(json.message || 'Failed')
        const est = json.data
        setCustomerName(est.customer?.name ?? '')
        setCustomerCode(est.customer?.customerCode ?? '')
        setIssueDate(est.issueDate?.slice(0, 10) ?? '')
        setStatus(String(est.status ?? '0'))
        setDescription(est.description ?? '')
      } catch (e: any) {
        setError(e.message || 'Gagal memuat estimate')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  const handleSave = async () => {
    if (!id) return
    setSaving(true)
    setError(null)
    try {
      const res = await fetch(`/api/estimates/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          issueDate,
          status: parseInt(status, 10),
          description,
        }),
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.message || 'Failed to save')
      router.push('/accounting/sales?tab=estimate')
    } catch (e: any) {
      setError(e.message || 'Gagal menyimpan perubahan')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      <Card className="shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)]">
        <CardHeader className="px-6">
          <CardTitle className="text-base font-semibold">Edit Estimation</CardTitle>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          {loading ? (
            <div className="text-sm text-muted-foreground">Loading...</div>
          ) : error ? (
            <div className="text-sm text-red-600">Error: {error}</div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleSave()
              }}
              className="grid gap-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Client</Label>
                  <Input value={customerName} readOnly className="bg-muted/50 border-0 shadow-none" />
                  <p className="text-xs text-muted-foreground">Code: {customerCode}</p>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Status" />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Issue Date</Label>
                  <DatePicker
                    value={issueDate}
                    onValueChange={setIssueDate}
                    placeholder="Set a date"
                    className="h-9 border-0 bg-muted/80 hover:bg-muted shadow-none px-3"
                    iconPlacement="right"
                  />
                  <input tabIndex={-1} aria-hidden="true" className="sr-only" required value={issueDate} onChange={() => {}} />
                </div>
                <div className="space-y-2">
                  <Label>Terms / Description</Label>
                  <Input
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter terms or description"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="shadow-none h-8 px-3"
                  onClick={() => router.push('/accounting/sales?tab=estimate')}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="shadow-none h-8 px-4"
                  disabled={saving}
                >
                  Save
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
