'use client'

import { useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

type BillActionsBarProps = {
  billId: string
  status: string | null
}

export function BillActionsBar({ billId, status }: BillActionsBarProps) {
  const router = useRouter()
  const normalizedStatus = (status || '').toLowerCase()

  const handleApplyDebitNote = useCallback(() => {
    const params = new URLSearchParams()
    params.set('tab', 'debit-note')
    params.set('billId', billId)
    params.set('openCreate', '1')
    router.push(`/accounting/purchases?${params.toString()}`)
  }, [billId, router])

  const handleBillReminder = useCallback(() => {
    toast.success('Bill reminder telah dikirim ke vendor (simulasi)')
  }, [])

  const handleResendBill = useCallback(() => {
    toast.success('Bill berhasil dikirim ulang ke vendor (simulasi)')
  }, [])

  const handleDownload = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.print()
    }
  }, [])

  if (normalizedStatus === 'draft') {
    return null
  }

  const isPaid = normalizedStatus === 'paid'

  return (
    <div className="flex flex-wrap items-center justify-end gap-2 mb-3">
      {!isPaid && (
        <>
          <Button
            size="sm"
            variant="default"
            className="h-8 px-3 shadow-none bg-blue-600 text-white hover:bg-blue-700"
            onClick={handleApplyDebitNote}
          >
            Apply Debit Note
          </Button>
          <Button
            size="sm"
            variant="default"
            className="h-8 px-3 shadow-none bg-blue-600 text-white hover:bg-blue-700"
            onClick={handleBillReminder}
          >
            Bill Reminder
          </Button>
        </>
      )}
      <Button
        size="sm"
        variant="default"
        className="h-8 px-3 shadow-none bg-blue-600 text-white hover:bg-blue-700"
        onClick={handleResendBill}
      >
        Resend Bill
      </Button>
      <Button
        size="sm"
        variant="default"
        className="h-8 px-3 shadow-none bg-blue-600 text-white hover:bg-blue-700"
        onClick={handleDownload}
      >
        Download
      </Button>
    </div>
  )
}

