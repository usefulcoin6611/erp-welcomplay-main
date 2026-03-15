"use client"

import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Check, Info, Loader2, PartyPopper, AlertCircle, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'

interface PaymentInstructionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  paymentData: any
  onClose?: () => void
}

export function PaymentInstructionModal({
  open,
  onOpenChange,
  paymentData,
  onClose
}: PaymentInstructionModalProps) {
  const router = useRouter()
  const { refreshUser } = useAuth()
  const [status, setStatus] = React.useState<'pending' | 'success' | 'failed'>('pending')
  const [isPolling, setIsPolling] = React.useState(false)
  const [isChecking, setIsChecking] = React.useState(false)
  const pollIntervalRef = React.useRef<NodeJS.Timeout | null>(null)

  const orderId = paymentData?.order_id || paymentData?.orderId

  const checkStatus = React.useCallback(async () => {
    if (!orderId || status !== 'pending') return

    try {
      const res = await fetch(`/api/orders/${orderId}/payment-info`, { cache: 'no-store' })
      const json = await res.json()

      if (json.success && json.data) {
        if (json.data.paymentStatus === 'success') {
          setStatus('success')
          toast.success('Pembayaran Berhasil Diverifikasi!')
          await refreshUser() // Update global auth state immediately
          if (pollIntervalRef.current) clearInterval(pollIntervalRef.current)
        } else if (json.data.paymentStatus === 'Failed') {
          setStatus('failed')
          if (pollIntervalRef.current) clearInterval(pollIntervalRef.current)
        }
      }
    } catch (error) {
      console.error('Polling error:', error)
    } finally {
      setIsChecking(false)
    }
  }, [orderId, status, refreshUser])

  // Reset status when modal opens
  React.useEffect(() => {
    if (open) {
      setStatus('pending')
      setIsPolling(true)
    } else {
      setIsPolling(false)
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current)
        pollIntervalRef.current = null
      }
    }
  }, [open])

  // Polling effect
  React.useEffect(() => {
    if (isPolling && open && status === 'pending') {
      pollIntervalRef.current = setInterval(checkStatus, 5000)
    } else if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current)
      pollIntervalRef.current = null
    }

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current)
    }
  }, [isPolling, open, status, checkStatus])

  if (!paymentData) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden border-none shadow-2xl">
        <div className="bg-blue-600 p-6 text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Check className="w-32 h-32 rotate-12" />
          </div>
          <DialogHeader className="relative z-10 text-white">
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              Instruksi Pembayaran
            </DialogTitle>
            <DialogDescription className="text-blue-100/80">
              Selesaikan pembayaran sebelum masa berlaku habis
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-6 space-y-6 bg-white overflow-y-auto max-h-[70vh]">
          {/* Virtual Account / Bank Transfer */}
          {(paymentData.va_numbers || paymentData.permata_va_number) && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Metode Pembayaran</p>
                  <p className="font-bold text-slate-700 uppercase">
                    {paymentData.va_numbers?.[0]?.bank || 'Permata'} Virtual Account
                  </p>
                </div>
                {paymentData.va_numbers?.[0]?.bank && (
                  <img 
                    src={`/payment/${paymentData.va_numbers[0].bank === 'cimb' ? 'cimbniaga' : paymentData.va_numbers[0].bank}.svg`} 
                    alt={paymentData.va_numbers[0].bank} 
                    className="h-6 object-contain"
                    onError={(e) => { e.currentTarget.style.display = 'none' }}
                  />
                )}
              </div>
              
              <div className="p-5 bg-blue-50/50 border border-blue-100 rounded-xl text-center space-y-2">
                <p className="text-xs font-medium text-slate-500">Nomor Virtual Account</p>
                <p className="text-2xl font-black text-blue-700 tracking-wider select-all">
                  {paymentData.va_numbers?.[0]?.va_number || paymentData.permata_va_number}
                </p>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-100/50 text-xs font-bold"
                  onClick={() => {
                    navigator.clipboard.writeText(paymentData.va_numbers?.[0]?.va_number || paymentData.permata_va_number)
                    toast.success('VA Number copied to clipboard')
                  }}
                >
                  Copy Number
                </Button>
              </div>
            </div>
          )}

          {/* Mandiri (E-Channel) */}
          {paymentData.bill_key && paymentData.biller_code && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Metode Pembayaran</p>
                  <p className="font-bold text-slate-700 uppercase">Mandiri Bill Payment</p>
                </div>
                <img src="/payment/mandiri.svg" alt="mandiri" className="h-6 object-contain" />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-xl text-center space-y-1">
                  <p className="text-[10px] font-bold text-slate-500 uppercase">Biller Code</p>
                  <p className="text-lg font-black text-blue-700 tracking-wider select-all">{paymentData.biller_code}</p>
                </div>
                <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-xl text-center space-y-1">
                  <p className="text-[10px] font-bold text-slate-500 uppercase">Bill Key</p>
                  <p className="text-lg font-black text-blue-700 tracking-wider select-all">{paymentData.bill_key}</p>
                </div>
              </div>
              <Button 
                className="w-full text-xs font-bold" 
                variant="outline"
                onClick={() => {
                  navigator.clipboard.writeText(`Biller: ${paymentData.biller_code}, Bill Key: ${paymentData.bill_key}`)
                  toast.success('Payment details copied')
                }}
              >
                Copy Payment Details
              </Button>
            </div>
          )}

          {/* QRIS */}
          {paymentData.actions?.find((a: any) => a.name === 'generate-qr-code') && (
            <div className="space-y-4 text-center">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 text-left">
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Metode Pembayaran</p>
                  <p className="font-bold text-slate-700 uppercase">QRIS (GoPay/DANA/OVO)</p>
                </div>
                <img src="/payment/qris.svg" alt="qris" className="h-6 object-contain" />
              </div>
              
              <div className="p-4 bg-white border-2 border-slate-100 rounded-2xl inline-block shadow-sm">
                <img 
                  src={paymentData.actions.find((a: any) => a.name === 'generate-qr-code').url} 
                  alt="QR Code" 
                  className="w-56 h-56 mx-auto rounded-lg"
                />
              </div>
              <p className="text-xs text-slate-500 px-6">
                Scan kode QR di atas menggunakan aplikasi e-wallet pilihan Anda untuk menyelesaikan pembayaran.
              </p>
            </div>
          )}

          {/* GoPay / Deep Link */}
          {paymentData.actions?.find((a: any) => a.name === 'deeplink-redirect') && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Metode Pembayaran</p>
                  <p className="font-bold text-slate-700 uppercase">GoPay</p>
                </div>
                <img src="/payment/gopay.svg" alt="gopay" className="h-6 object-contain" />
              </div>
              
              <Button 
                className="w-full h-12 bg-[#00AED6] hover:bg-[#0092b3] text-white font-bold rounded-xl shadow-lg ring-offset-2 hover:ring-2 ring-[#00AED6]/30 transition-all"
                onClick={() => {
                  window.open(paymentData.actions.find((a: any) => a.name === 'deeplink-redirect').url, '_blank')
                }}
              >
                Buka Aplikasi GoPay
              </Button>
              <p className="text-xs text-center text-slate-500 px-6">
                Klik tombol di atas untuk membuka aplikasi GoPay pada perangkat Anda.
              </p>
            </div>
          )}
        </div>

        {/* Success State Overlay */}
        {status === 'success' && (
          <div className="absolute inset-0 z-50 bg-white flex flex-col items-center justify-center p-8 text-center animate-in fade-in zoom-in duration-300">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
              <PartyPopper className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-2">Pembayaran Berhasil!</h3>
            <p className="text-slate-500 mb-8">
              Terima kasih! Langganan Anda telah aktif. Silakan kembali ke dashboard untuk menikmati fitur premium.
            </p>
            <Button 
              className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-lg shadow-green-200"
              onClick={() => {
                onOpenChange(false)
                router.push('/dashboard')
              }}
            >
              Ke Dashboard
            </Button>
          </div>
        )}

        {/* Failed State Overlay */}
        {status === 'failed' && (
          <div className="absolute inset-0 z-50 bg-white flex flex-col items-center justify-center p-8 text-center animate-in fade-in zoom-in duration-300">
            <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-6">
              <AlertCircle className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-2">Pembayaran Gagal</h3>
            <p className="text-slate-500 mb-8">
              Mohon maaf, terjadi kendala pada transaksi Anda. Silakan coba lagi atau hubungi bantuan.
            </p>
            <Button 
              className="w-full h-12 bg-slate-900 text-white font-bold rounded-xl"
              onClick={() => onOpenChange(false)}
            >
              Tutup
            </Button>
          </div>
        )}

        <DialogFooter className="p-4 bg-slate-50 border-t border-slate-100">
          <div className="w-full flex flex-col gap-3">
            {status === 'pending' && (
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-blue-500 animate-pulse">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  MENUNGGU PEMBAYARAN...
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-8 text-[10px] font-bold gap-2 border-blue-200 text-blue-600 hover:bg-blue-50"
                  onClick={() => {
                    setIsChecking(true)
                    checkStatus()
                  }}
                  disabled={isChecking}
                >
                  <RefreshCw className={`w-3 h-3 ${isChecking ? 'animate-spin' : ''}`} />
                  Cek Status Pembayaran
                </Button>
              </div>
            )}
            <Button 
              className="w-full font-bold text-xs bg-slate-900"
              onClick={() => {
                onOpenChange(false)
                if (status === 'pending') {
                  router.push('/settings?tab=order')
                }
                if (onClose) onClose()
              }}
            >
              {status === 'pending' ? 'Tutup (Bayar Nanti)' : 'Tutup'}
            </Button>
          </div>
        </DialogFooter>

      </DialogContent>
    </Dialog>
  )
}
