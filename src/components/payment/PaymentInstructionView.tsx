"use client"

import React from 'react'
import { Button } from '@/components/ui/button'
import { Check, Info, Loader2, PartyPopper, AlertCircle, RefreshCw, ArrowLeft, CreditCard, Building2, QrCode, Receipt, Copy, ExternalLink, Wallet, ArrowRight } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'

interface PaymentInstructionViewProps {
  paymentData: any
  onBack?: () => void
  planName?: string
  amount?: number
  subtotal?: number
  tax?: number
}

export function PaymentInstructionView({
  paymentData,
  onBack,
  planName,
  amount,
  subtotal,
  tax
}: PaymentInstructionViewProps) {
  const router = useRouter()
  const { refreshUser } = useAuth()
  const [status, setStatus] = React.useState<'pending' | 'success' | 'failed'>(() => {
    const s = (paymentData?.paymentStatus || paymentData?.transaction_status || '').toLowerCase()
    return ['success', 'settlement', 'capture', 'approved'].includes(s) ? 'success' : 'pending'
  })
  const [isChecking, setIsChecking] = React.useState(false)
  const [verifiedAt, setVerifiedAt] = React.useState<string | null>(null)
  const [stepProgress, setStepProgress] = React.useState(status === 'success' ? 3 : 0)
  const isInitialCheck = React.useRef(true)
  const pollIntervalRef = React.useRef<NodeJS.Timeout | null>(null)

  const orderId = paymentData?.order_id || paymentData?.orderId

  const formatPriceIdr = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price || 0)
  }

  const checkStatus = React.useCallback(async () => {
    if (!orderId || status !== 'pending') return

    try {
      const res = await fetch(`/api/orders/${orderId}/payment-info`, { cache: 'no-store' })
      const json = await res.json()

      if (json.success && json.data) {
        if (json.data.paymentStatus === 'success') {
          // Stop polling immediately
          if (pollIntervalRef.current) clearInterval(pollIntervalRef.current)

          const now = new Date()
          const formattedDate = new Intl.DateTimeFormat('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
          }).format(now).replace(/\./g, ':')

          // If this is the FIRST check on mount and it's already success, skip animation
          if (isInitialCheck.current) {
            setStepProgress(3)
            setStatus('success')
            setVerifiedAt(formattedDate)
            isInitialCheck.current = false
            return
          }

          // Trigger Sequential Animation
          setStepProgress(1)
          setTimeout(() => {
            setStepProgress(2)
            setTimeout(() => {
              setStepProgress(3)
              setTimeout(() => {
                setStatus('success')
                setVerifiedAt(formattedDate)
                toast.success('Pembayaran Berhasil Diverifikasi!')
                refreshUser()
              }, 800)
            }, 1000)
          }, 1000)
        } else if (json.data.paymentStatus === 'Failed') {
          setStatus('failed')
          if (pollIntervalRef.current) clearInterval(pollIntervalRef.current)
        }
      }
    } catch (error) {
      console.error('Polling error:', error)
    } finally {
      setIsChecking(false)
      isInitialCheck.current = false
    }
  }, [orderId, status, refreshUser])

  React.useEffect(() => {
    if (status === 'pending') {
      checkStatus() // Check immediately on mount/status change
      pollIntervalRef.current = setInterval(checkStatus, 5000)
    } else if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current)
      pollIntervalRef.current = null
    }

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current)
    }
  }, [status, checkStatus])

  const getInstructions = () => {
    if (paymentData.va_numbers?.[0]?.bank === 'bca') {
      return [
        'Buka m-BCA / BCA Mobile',
        'Pilih Transfer > BCA Virtual Account',
        'Masukkan nomor VA yang tertera',
        'Konfirmasi nominal & masukkan PIN'
      ]
    }
    if (paymentData.va_numbers?.[0]?.bank === 'bni') {
      return [
        'Buka BNI Mobile Banking',
        'Pilih Transfer > Virtual Account Billing',
        'Masukkan nomor VA tujuan',
        'Pastikan nominal benar & bayar'
      ]
    }
    if (paymentData.va_numbers?.[0]?.bank === 'bri') {
      return [
        'Buka aplikasi BRImo',
        'Pilih menu BRIVA',
        'Masukkan nomor VA pembayaran',
        'Konfirmasi transaksi & bayar'
      ]
    }
    if (paymentData.va_numbers?.[0]?.bank === 'cimb') {
      return [
        'Buka Octo Mobile / CIMB Clicks',
        'Pilih Transfer > Virtual Account',
        'Masukkan nomor VA CIMB Niaga',
        'Konfirmasi & selesaikan bayar'
      ]
    }
    if (paymentData.permata_va_number) {
      return [
        'Buka PermataMobile X',
        'Pilih menu Pembayaran > Virtual Account',
        'Masukkan nomor VA Permata',
        'Lanjutkan pembayaran anda'
      ]
    }
    if (paymentData.bill_key) {
      return [
        'Buka Livin by Mandiri',
        'Pilih Bayar > e-Commerce',
        'Cari penyedia jasa: Midtrans',
        'Masukkan Kode Biller & Bill Key'
      ]
    }
    if (paymentData.actions?.find((a: any) => a.name === 'generate-qr-code')) {
      return [
        'Buka aplikasi E-Wallet (GoPay/Dana/dll)',
        'Pilih menu Scan / Bayar',
        'Scan QR Code yang muncul di layar',
        'Konfirmasi pembayaran di aplikasi'
      ]
    }
    return ['Gunakan aplikasi banking anda', 'Lakukan transfer ke VA tertera', 'Pastikan nominal sesuai']
  }

  const PaymentSteps = () => {
    // Determine visual states based on stepProgress
    const step1Active = stepProgress >= 1 || status === 'success'
    const step2Active = stepProgress >= 2 || status === 'success'
    const step3Active = stepProgress >= 3 || status === 'success'

    // VERIFIKASI animates during polling OR during its sequential step animation
    const isProcessing = (isChecking || stepProgress === 2) && status !== 'success'

    return (
      <div className="flex items-center justify-center gap-4 md:gap-10">
        {/* Step 1: Pembayaran */}
        <div className="flex flex-col items-center gap-2">
          <div className="relative">
            <div className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center transition-all duration-500 ${step1Active ? 'bg-blue-600 text-white shadow-xl shadow-blue-200' : 'bg-white border-2 border-slate-200 text-slate-400'}`}>
              <Wallet className="w-5 h-5 md:w-6 md:h-6" />
            </div>
            {step1Active && <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-1 bg-blue-600/30 blur-md rounded-full" />}
          </div>
          <p className={`text-[10px] md:text-xs font-medium tracking-wide transition-colors duration-500 ${step1Active ? 'text-slate-700' : 'text-slate-400'}`}>Pembayaran</p>
        </div>

        <div className={`w-8 md:w-16 h-[3px] -mt-6 transition-all duration-700 rounded-full ${step2Active ? 'bg-blue-500/60' : 'bg-slate-200'}`} />

        {/* Step 2: Verifikasi */}
        <div className="flex flex-col items-center gap-2">
          <div className={`
            w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center transition-all duration-500
            ${isProcessing ? 'bg-blue-600 text-white shadow-xl shadow-blue-200 scale-110' : step2Active ? 'bg-blue-600 text-white shadow-lg' : 'bg-white border-2 border-slate-200 text-slate-400'}
          `}>
            <RefreshCw className={`w-5 h-5 md:w-6 md:h-6 ${isProcessing ? 'animate-spin' : ''}`} />
          </div>
          <p className={`text-[10px] md:text-xs font-medium tracking-wide transition-colors duration-500 ${isProcessing ? 'text-blue-600' : step2Active ? 'text-slate-700' : 'text-slate-400'}`}>Verifikasi</p>
        </div>

        <div className={`w-8 md:w-16 h-[3px] -mt-6 transition-all duration-700 rounded-full ${step3Active ? 'bg-blue-500/60' : 'bg-slate-200'}`} />

        {/* Step 3: Berhasil */}
        <div className="flex flex-col items-center gap-2">
          <div className={`
            w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center transition-all duration-700
            ${step3Active ? 'bg-green-500 text-white shadow-2xl shadow-green-200 scale-110' : 'bg-white border-2 border-slate-200 text-slate-400'}
          `}>
            <Check className="w-5 h-5 md:w-6 md:h-6" />
          </div>
          <p className={`text-[10px] md:text-xs font-medium tracking-wide transition-colors duration-500 ${step3Active ? 'text-green-600' : 'text-slate-400'}`}>Berhasil</p>
        </div>
      </div>
    )
  }

  if (!paymentData) return null

  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-8 duration-1000">
      <div className="flex flex-col-reverse lg:flex-row min-h-[500px] lg:min-h-[600px] overflow-hidden rounded-2xl md:rounded-3xl bg-white border border-slate-100">

        {/* Sidebar Summary - Neutral & Flat */}
        <div className="lg:w-[350px] bg-slate-50/50 p-6 md:p-8 flex flex-col border-b lg:border-b-0 lg:border-r border-slate-100">
          <div className="space-y-6">
            <div className="p-5 bg-white rounded-xl space-y-3">
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Plan Terpilih</p>
                <p className="text-base font-black text-slate-800">{planName || 'Premium Plan'}</p>
              </div>
              <div className="h-[1px] bg-slate-50 w-full" />

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Harga Paket</p>
                  <p className="text-[11px] font-bold text-slate-600">{formatPriceIdr(subtotal || Math.round((amount || 0) / 1.11))}</p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pajak (11%)</p>
                  <p className="text-[11px] font-bold text-slate-600">{formatPriceIdr(tax || Math.round((amount || 0) - ((amount || 0) / 1.11)))}</p>
                </div>
              </div>

              <div className="h-[1px] bg-slate-50 w-full" />
              <div className="flex justify-between items-center pt-1">
                <p className="text-xs font-black text-slate-900 uppercase tracking-wider">Total Bayar</p>
                <p className="text-base font-black text-blue-600 tracking-tight">{formatPriceIdr(amount || 0)}</p>
              </div>
            </div>

            <div className="px-5 py-2 space-y-1">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Order ID</p>
              <div className="flex items-center gap-2 group cursor-pointer" onClick={() => {
                navigator.clipboard.writeText(orderId)
                toast.success('Order ID copied')
              }}>
                <p className="text-[11px] font-bold text-slate-500 group-hover:text-blue-500 transition-colors">{orderId}</p>
                <Copy className="w-3 h-3 text-slate-300 group-hover:text-blue-500 transition-colors" />
              </div>
            </div>

            {/* Step by Step Instructions */}
            <div className="space-y-6">
              {getInstructions().map((step, idx) => (
                <div key={idx} className="flex gap-3">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-slate-100 text-[10px] font-black text-slate-500 flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <p className="text-[11px] font-medium text-slate-600 leading-relaxed pt-0.5">
                    {step}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {status !== 'success' && (
            <div className="mt-auto pt-6 space-y-3 border-t border-slate-100">
              <div className="bg-amber-50/70 p-3 rounded-xl flex items-center justify-center">
                <p className="text-[10px] font-black text-amber-700 uppercase tracking-wider">Awaiting Verification</p>
              </div>

              <Button
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white text-sm font-black rounded-2xl gap-2 transition-all active:scale-[0.98] shadow-md shadow-blue-50"
                onClick={() => {
                  setIsChecking(true)
                  checkStatus()
                }}
                disabled={isChecking}
              >
                {isChecking ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                Cek Status Sekarang
              </Button>

              <p className="text-[10px] text-center text-slate-400 font-medium px-4">
                Pengecekan otomatis aktif setiap 5 detik.
              </p>
            </div>
          )}

          {status === 'success' && (
            <div className="mt-auto pt-6 border-t border-slate-100 opacity-0 h-0" />
          )}
        </div>

        {/* Main Content - Minimal & Centered */}
        <div className="flex-1 p-6 md:p-10 lg:p-14 flex flex-col items-center justify-center bg-gradient-to-br from-white to-blue-50/80">
          <div className="w-full max-w-lg text-center flex flex-col items-center">

            <div className="mb-12">
              <PaymentSteps />
            </div>

            {/* Status Information Overlays (Conditional) */}
            <div className="w-full">
              {status === 'success' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000 flex flex-col items-center mb-10">
                  <div className="relative mb-6">
                    <div className="absolute inset-0 bg-green-400 blur-3xl rounded-full opacity-20 animate-pulse" />
                    <div className="relative w-24 h-24 bg-gradient-to-br from-green-600 to-green-400 text-white rounded-3xl flex items-center justify-center shadow-2xl shadow-green-200 rotate-6 animate-in zoom-in spin-in-12 duration-700">
                      <PartyPopper className="w-12 h-12" />
                    </div>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-black text-slate-900 mb-2 tracking-tight">Pembayaran Berhasil!</h3>
                  <p className="text-slate-500 text-sm md:text-base font-medium">
                    Paket anda sudah diaktifkan secara otomatis.
                  </p>
                </div>
              )}

              {status === 'failed' && (
                <div className="animate-in fade-in slide-in-from-top-4 duration-500 flex flex-col items-center py-6 border-b border-red-50 mb-8">
                  <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-red-50">
                    <AlertCircle className="w-10 h-10" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 mb-2">Gagal Verifikasi</h3>
                  <p className="text-slate-500 text-sm mb-4 max-w-xs font-medium">
                    Kami tidak dapat memvalidasi pembayaran anda saat ini.
                  </p>
                  <Button
                    className="w-full max-w-[240px] h-12 bg-slate-900 text-white font-black rounded-xl transition-all hover:bg-slate-800 mb-2"
                    onClick={() => {
                      if (onBack) onBack()
                      setStatus('pending')
                    }}
                  >
                    Ulangi / Ganti Metode
                  </Button>
                </div>
              )}
            </div>

            {/* Payment Method Details - Always Visible or Integrated */}
            <div className="w-full animate-in fade-in duration-500">


              {/* VA Content */}
              {(paymentData.va_numbers || paymentData.permata_va_number) && (
                <div className="space-y-6 animate-in fade-in zoom-in-95 duration-700">
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-slate-50 rounded-lg flex items-center justify-center p-2 border border-slate-100">
                      <img
                        src={`/payment/${paymentData.va_numbers?.[0]?.bank === 'cimb' ? 'cimbniaga' : paymentData.va_numbers?.[0]?.bank}.svg`}
                        alt="bank"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="text-left">
                      <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest leading-none mb-1">Terbayar Via</p>
                      <p className="text-base md:text-lg font-medium text-slate-900 uppercase">
                        {paymentData.va_numbers?.[0]?.bank || 'Permata'} Virtual Account
                      </p>
                    </div>
                  </div>

                  {status !== 'success' && (
                    <div className="relative group p-6 md:p-8 bg-slate-100/50 rounded-2xl space-y-4">
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Nomor Virtual Account</p>
                      <p className="text-sm md:text-base font-medium text-slate-900 tracking-widest break-all">
                        {paymentData.va_numbers?.[0]?.va_number || paymentData.permata_va_number}
                      </p>
                      <div className="pt-2 flex justify-center">
                        <Button
                          size="lg"
                          className="bg-blue-50 hover:bg-blue-100 text-blue-600 font-black px-8 h-12 rounded-xl gap-2 transition-all active:scale-95 shadow-none"
                          onClick={() => {
                            navigator.clipboard.writeText(paymentData.va_numbers?.[0]?.va_number || paymentData.permata_va_number)
                            toast.success('VA Number copied')
                          }}
                        >
                          <Copy className="w-4 h-4" />
                          Salin
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* QRIS Content */}
              {paymentData.actions?.find((a: any) => a.name === 'generate-qr-code') && (
                <div className="space-y-8 animate-in fade-in zoom-in-95 duration-700">
                  {status !== 'success' ? (
                    <>
                      <div className="inline-block p-4 bg-white rounded-2xl">
                        <div className="bg-slate-50/50 p-4 rounded-xl">
                          <img
                            src={paymentData.actions.find((a: any) => a.name === 'generate-qr-code').url}
                            alt="QR Code"
                            className="w-48 h-48 md:w-64 md:h-64 mx-auto"
                          />
                        </div>
                      </div>
                      <div className="flex justify-center gap-6 opacity-30">
                        <img src="/payment/gopay.svg" className="h-4" />
                        <img src="/payment/dana.svg" className="h-4" />
                        <img src="/payment/qris.svg" className="h-4" />
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center p-2 border border-slate-100">
                        <img src="/payment/qris.svg" alt="QRIS" className="w-full h-full object-contain" />
                      </div>
                      <div className="text-left">
                        <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest leading-none mb-1">Terbayar Via</p>
                        <p className="text-base md:text-lg font-medium text-slate-900 uppercase">QRIS / E-Wallet</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Mandiri Bill Content */}
              {paymentData.bill_key && paymentData.biller_code && (
                <div className="space-y-6 animate-in fade-in zoom-in-95 duration-700">
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center p-2 border border-slate-100">
                      <img src="/payment/mandiri.svg" alt="Mandiri" className="w-full h-full object-contain" />
                    </div>
                    <div className="text-left">
                      <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest leading-none mb-1">Terbayar Via</p>
                      <p className="text-base md:text-lg font-medium text-slate-900 uppercase">Mandiri Bill Payment</p>
                    </div>
                  </div>

                  {status !== 'success' && (
                    <div className="space-y-6 text-left">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-50/50 p-6 rounded-2xl text-center space-y-1">
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Biller Code</p>
                          <p className="text-base md:text-lg font-medium text-slate-900">{paymentData.biller_code}</p>
                        </div>
                        <div className="bg-slate-50/50 p-6 rounded-2xl text-center space-y-1">
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Bill Key</p>
                          <p className="text-base md:text-lg font-medium text-slate-900">{paymentData.bill_key}</p>
                        </div>
                      </div>

                      <Button
                        className="w-full h-14 bg-blue-50 hover:bg-blue-100 text-blue-600 font-black rounded-xl transition-all shadow-none active:scale-[0.98]"
                        onClick={() => {
                          navigator.clipboard.writeText(`Biller: ${paymentData.biller_code}, Bill Key: ${paymentData.bill_key}`)
                          toast.success('Payment details copied')
                        }}
                      >
                        Salin Detail Tagihan
                      </Button>
                    </div>
                  )}
                </div>
              )}

              <div className="pt-4">
                <p className={`text-[10px] md:text-xs tracking-wide ${status === 'success' ? 'text-green-600 font-medium' : 'text-slate-400 font-medium'}`}>
                  {status === 'success'
                    ? `Terverifikasi pukul ${verifiedAt || '--:--:--'} WIB`
                    : 'Selesaikan pembayaran anda sebelum waktu habis'}
                </p>
              </div>

            </div>

            {/* Powered by Midtrans - Bottom */}
            <div className="pt-8 mt-4 border-t border-slate-50 flex items-center justify-center gap-2 w-full">
              <span className="text-[10px] font-medium text-slate-400">Secure Payment Powered by</span>
              <img src="/logo/midtrans-logo.svg" alt="Midtrans" className="h-3" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
