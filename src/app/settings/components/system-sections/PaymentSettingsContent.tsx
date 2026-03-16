"use client"

import { useSettings } from '@/hooks/use-settings'
import { useAuth } from '@/contexts/auth-context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Save } from 'lucide-react'

export function PaymentSettingsContent() {
  const { user } = useAuth()
  const isSuperAdmin = user?.type === 'super admin'

  const { formData: subscriptionForm, setFormData: setSubscriptionForm, save: saveSubscription } = useSettings('/api/settings/subscription-payment', {
    currency: 'IDR',
    currency_symbol: 'Rp',
    manually_enabled: false,
    bank_transfer_enabled: true,
    bank_details: '',
    stripe_enabled: false,
    stripe_key: '',
    stripe_secret: '',
    paypal_enabled: false,
    paypal_mode: 'sandbox',
    paypal_client_id: '',
    paypal_secret: '',
  })

  const { formData: companyGateways, setFormData: setCompanyGateways, save: saveCompanyGateways, loading: loadingCompanyGateways } = useSettings('/api/settings/payment-gateways', {
    cash_enabled: true,
    bank_transfer_enabled: true,
    midtrans_enabled: true,
    xendit_enabled: true,
    paypal_enabled: false,
    custom: [] as { code: string; label: string }[],
  })

  const handleSubmitSubscription = (e: React.FormEvent) => {
    e.preventDefault()
    saveSubscription()
  }

  const handleSubmitCompanyGateways = (e: React.FormEvent) => {
    e.preventDefault()
    saveCompanyGateways()
  }

  return (
    <div className="space-y-6">
      {isSuperAdmin && (
        <Card className="rounded-lg shadow-none">
          <CardHeader className="px-6 py-4 rounded-t-lg">
            <CardTitle className="text-base font-medium leading-none">Subscription Payment Settings</CardTitle>
            <p className="text-sm text-muted-foreground">
              These details will be used to collect subscription plan payments from companies using this system.
            </p>
          </CardHeader>
          <CardContent className="px-6 py-4">
            <form onSubmit={handleSubmitSubscription} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Input
                    id="currency"
                    value={subscriptionForm.currency}
                    onChange={(e) => setSubscriptionForm({ ...subscriptionForm, currency: e.target.value })}
                    placeholder="Enter Currency (e.g. IDR)"
                    variant="modern"
                  />
                  <p className="text-xs text-muted-foreground">
                    Note: Add currency code as per three-letter ISO code.{' '}
                    <a href="https://stripe.com/docs/currencies" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                      You can find out how to do that here.
                    </a>
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency_symbol">Currency Symbol</Label>
                  <Input
                    id="currency_symbol"
                    value={subscriptionForm.currency_symbol}
                    onChange={(e) => setSubscriptionForm({ ...subscriptionForm, currency_symbol: e.target.value })}
                    placeholder="Enter Symbol (e.g. Rp)"
                    variant="modern"
                  />
                </div>
              </div>

              {/* Payment Methods Accordion */}
              <Accordion type="single" collapsible className="w-full space-y-2">
                {/* Manual Payment */}
                <AccordionItem value="manual" className="border rounded-lg px-2">
                  <div className="flex items-center justify-between">
                    <AccordionTrigger className="hover:no-underline py-3 flex-1 text-sm font-medium">
                      Manual Account Details
                    </AccordionTrigger>
                    <div className="px-4" onClick={(e) => e.stopPropagation()}>
                      <Switch
                        checked={subscriptionForm.manually_enabled}
                        onCheckedChange={(checked) =>
                          setSubscriptionForm({ ...subscriptionForm, manually_enabled: checked })
                        }
                        className="data-[state=checked]:bg-blue-500 data-[state=unchecked]:bg-gray-300"
                      />
                    </div>
                  </div>
                  <AccordionContent>
                    <div className="space-y-4 pt-4">
                      <div className="flex items-center justify-between border rounded-md px-3 py-2">
                        <div>
                          <p className="text-sm font-medium">Bank Transfer</p>
                          <p className="text-xs text-muted-foreground">Enable manual bank transfer as payment method.</p>
                        </div>
                        <Switch
                          checked={subscriptionForm.bank_transfer_enabled}
                          onCheckedChange={(checked) =>
                            setSubscriptionForm({ ...subscriptionForm, bank_transfer_enabled: checked })
                          }
                          className="data-[state=checked]:bg-blue-500 data-[state=unchecked]:bg-gray-300"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="bank_details">Bank Details / Payment Instructions</Label>
                        <Textarea
                          id="bank_details"
                          rows={4}
                          value={subscriptionForm.bank_details}
                          onChange={(e) => setSubscriptionForm({ ...subscriptionForm, bank_details: e.target.value })}
                          placeholder="Enter bank account details or payment instructions"
                          variant="modern"
                        />
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Stripe */}
                <AccordionItem value="stripe" className="border rounded-lg px-2">
                  <div className="flex items-center justify-between">
                    <AccordionTrigger className="hover:no-underline py-3 flex-1 text-sm font-medium">
                      Stripe
                    </AccordionTrigger>
                    <div className="px-4" onClick={(e) => e.stopPropagation()}>
                      <Switch
                        checked={subscriptionForm.stripe_enabled}
                        onCheckedChange={(checked) =>
                          setSubscriptionForm({ ...subscriptionForm, stripe_enabled: checked })
                        }
                        className="data-[state=checked]:bg-blue-500 data-[state=unchecked]:bg-gray-300"
                      />
                    </div>
                  </div>
                  <AccordionContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                      <div className="space-y-2">
                        <Label htmlFor="stripe_key">Stripe Key</Label>
                        <Input
                          id="stripe_key"
                          value={subscriptionForm.stripe_key}
                          placeholder="Enter Stripe Key"
                          variant="modern"
                          onChange={(e) =>
                            setSubscriptionForm({ ...subscriptionForm, stripe_key: e.target.value })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="stripe_secret">Stripe Secret</Label>
                        <Input
                          id="stripe_secret"
                          type="password"
                          value={subscriptionForm.stripe_secret}
                          placeholder="Enter Stripe Secret"
                          variant="modern"
                          onChange={(e) =>
                            setSubscriptionForm({ ...subscriptionForm, stripe_secret: e.target.value })
                          }
                        />
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* PayPal */}
                <AccordionItem value="paypal" className="border rounded-lg px-2">
                  <div className="flex items-center justify-between">
                    <AccordionTrigger className="hover:no-underline py-3 flex-1 text-sm font-medium">
                      PayPal
                    </AccordionTrigger>
                    <div className="px-4" onClick={(e) => e.stopPropagation()}>
                      <Switch
                        checked={subscriptionForm.paypal_enabled}
                        onCheckedChange={(checked) =>
                          setSubscriptionForm({ ...subscriptionForm, paypal_enabled: checked })
                        }
                        className="data-[state=checked]:bg-blue-500 data-[state=unchecked]:bg-gray-300"
                      />
                    </div>
                  </div>
                  <AccordionContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                      <div className="space-y-2">
                        <Label htmlFor="paypal_mode">PayPal Mode</Label>
                        <Select
                          value={subscriptionForm.paypal_mode}
                          onValueChange={(value) =>
                            setSubscriptionForm({ ...subscriptionForm, paypal_mode: value })
                          }
                        >
                          <SelectTrigger id="paypal_mode" variant="modern">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="sandbox">Sandbox</SelectItem>
                            <SelectItem value="live">Live</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="paypal_client_id">PayPal Client ID</Label>
                        <Input
                          id="paypal_client_id"
                          value={subscriptionForm.paypal_client_id}
                          placeholder="Enter PayPal Client ID"
                          variant="modern"
                          onChange={(e) =>
                            setSubscriptionForm({ ...subscriptionForm, paypal_client_id: e.target.value })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="paypal_secret">PayPal Secret</Label>
                        <Input
                          id="paypal_secret"
                          type="password"
                          value={subscriptionForm.paypal_secret}
                          placeholder="Enter PayPal Secret"
                          variant="modern"
                          onChange={(e) =>
                            setSubscriptionForm({ ...subscriptionForm, paypal_secret: e.target.value })
                          }
                        />
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              <div className="flex justify-end pt-4 border-t">
                <Button type="submit" variant="blue" className="shadow-none">
                  <Save className="mr-2 h-4 w-4" /> Save Subscription Settings
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card className="rounded-lg shadow-none">
        <CardHeader className="px-6 py-4 rounded-t-lg">
          <CardTitle className="text-base font-medium leading-none">Company Payment Gateway Settings</CardTitle>
          <p className="text-sm text-muted-foreground">
            Control which gateways are available on the Bank Account form for internal accounting flows.
          </p>
        </CardHeader>
        <CardContent className="px-6 py-4">
          <form onSubmit={handleSubmitCompanyGateways} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between border rounded-md px-3 py-2">
                <div>
                  <p className="text-sm font-medium">Cash</p>
                  <p className="text-xs text-muted-foreground">Enable Cash as a payment option.</p>
                </div>
                <Switch
                  checked={companyGateways.cash_enabled}
                  onCheckedChange={(checked) =>
                    setCompanyGateways((prev) => ({ ...prev, cash_enabled: checked }))
                  }
                  className="data-[state=checked]:bg-blue-500 data-[state=unchecked]:bg-gray-300"
                />
              </div>
              <div className="flex items-center justify-between border rounded-md px-3 py-2">
                <div>
                  <p className="text-sm font-medium">Bank Transfer</p>
                  <p className="text-xs text-muted-foreground">Enable manual bank transfer accounts.</p>
                </div>
                <Switch
                  checked={companyGateways.bank_transfer_enabled}
                  onCheckedChange={(checked) =>
                    setCompanyGateways((prev) => ({ ...prev, bank_transfer_enabled: checked }))
                  }
                  className="data-[state=checked]:bg-blue-500 data-[state=unchecked]:bg-gray-300"
                />
              </div>
              <div className="flex items-center justify-between border rounded-md px-3 py-2">
                <div>
                  <p className="text-sm font-medium">Midtrans</p>
                  <p className="text-xs text-muted-foreground">Virtual account and payment gateway for Indonesia.</p>
                </div>
                <Switch
                  checked={companyGateways.midtrans_enabled}
                  onCheckedChange={(checked) =>
                    setCompanyGateways((prev) => ({ ...prev, midtrans_enabled: checked }))
                  }
                  className="data-[state=checked]:bg-blue-500 data-[state=unchecked]:bg-gray-300"
                />
              </div>
              <div className="flex items-center justify-between border rounded-md px-3 py-2">
                <div>
                  <p className="text-sm font-medium">Xendit</p>
                  <p className="text-xs text-muted-foreground">Virtual account and e-wallet gateway.</p>
                </div>
                <Switch
                  checked={companyGateways.xendit_enabled}
                  onCheckedChange={(checked) =>
                    setCompanyGateways((prev) => ({ ...prev, xendit_enabled: checked }))
                  }
                  className="data-[state=checked]:bg-blue-500 data-[state=unchecked]:bg-gray-300"
                />
              </div>
              <div className="flex items-center justify-between border rounded-md px-3 py-2">
                <div>
                  <p className="text-sm font-medium">PayPal</p>
                  <p className="text-xs text-muted-foreground">Optional for international payments.</p>
                </div>
                <Switch
                  checked={companyGateways.paypal_enabled}
                  onCheckedChange={(checked) =>
                    setCompanyGateways((prev) => ({ ...prev, paypal_enabled: checked }))
                  }
                  className="data-[state=checked]:bg-blue-500 data-[state=unchecked]:bg-gray-300"
                />
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Custom Payment Gateway</p>
              <p className="text-xs text-muted-foreground">
                Tambahkan gateway lain untuk kebutuhan internal, misalnya agregator tertentu. Kode akan dipakai sebagai nilai tersimpan.
              </p>
              <div className="space-y-2">
                {companyGateways.custom.map((gateway, index) => (
                  <div key={`custom-gateway-${index}`} className="grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-4">
                      <Input
                        value={gateway.code}
                        placeholder="kode (mis. shopeepay)"
                        variant="modern"
                        onChange={(e) =>
                          setCompanyGateways((prev) => ({
                            ...prev,
                            custom: prev.custom.map((g, i) =>
                              i === index
                                ? {
                                  ...g,
                                  code: e.target.value
                                    .toLowerCase()
                                    .replace(/\s+/g, '_')
                                    .replace(/[^a-z0-9_]/g, ''),
                                }
                                : g,
                            ),
                          }))
                        }
                      />
                    </div>
                    <div className="col-span-6">
                      <Input
                        value={gateway.label}
                        placeholder="Nama tampilan (mis. ShopeePay)"
                        variant="modern"
                        onChange={(e) =>
                          setCompanyGateways((prev) => ({
                            ...prev,
                            custom: prev.custom.map((g, i) =>
                              i === index ? { ...g, label: e.target.value } : g,
                            ),
                          }))
                        }
                      />
                    </div>
                    <div className="col-span-2 flex justify-end">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="shadow-none"
                        onClick={() =>
                          setCompanyGateways((prev) => ({
                            ...prev,
                            custom: prev.custom.filter((_, i) => i !== index),
                          }))
                        }
                      >
                        ✕
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-center pt-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="shadow-none"
                  onClick={() =>
                    setCompanyGateways((prev) => ({
                      ...prev,
                      custom: [...prev.custom, { code: '', label: '' }],
                    }))
                  }
                >
                  Tambah Gateway
                </Button>
              </div>
            </div>
            <div className="flex justify-end pt-4 border-t">
              <Button type="submit" variant="blue" className="shadow-none" disabled={loadingCompanyGateways}>
                <Save className="mr-2 h-4 w-4" /> Save Company Gateway Settings
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
