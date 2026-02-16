import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

const SETTING_KEY = "subscription_payment_settings"

type SubscriptionPaymentSettings = {
  currency: string
  currency_symbol: string
  manually_enabled: boolean
  bank_transfer_enabled: boolean
  bank_details: string
  stripe_enabled: boolean
  stripe_key: string
  stripe_secret: string
  paypal_enabled: boolean
  paypal_mode: string
  paypal_client_id: string
  paypal_secret: string
}

function getDefaultSettings(): SubscriptionPaymentSettings {
  return {
    currency: "IDR",
    currency_symbol: "Rp",
    manually_enabled: false,
    bank_transfer_enabled: true,
    bank_details: "",
    stripe_enabled: false,
    stripe_key: "",
    stripe_secret: "",
    paypal_enabled: false,
    paypal_mode: "sandbox",
    paypal_client_id: "",
    paypal_secret: "",
  }
}

export async function GET() {
  try {
    const existing = await prisma.setting.findUnique({
      where: { key: SETTING_KEY },
    })

    if (!existing) {
      return NextResponse.json({
        success: true,
        data: getDefaultSettings(),
      })
    }

    let parsed: SubscriptionPaymentSettings | null = null

    try {
      parsed = JSON.parse(existing.value)
    } catch {
      parsed = null
    }

    const data = { ...getDefaultSettings(), ...(parsed || {}) }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("Error loading subscription payment settings:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to load subscription payment settings",
        error:
          error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = (await request.json()) as Partial<SubscriptionPaymentSettings>
    const current = getDefaultSettings()
    const merged: SubscriptionPaymentSettings = {
      ...current,
      ...body,
    }

    await prisma.setting.upsert({
      where: { key: SETTING_KEY },
      update: { value: JSON.stringify(merged) },
      create: {
        key: SETTING_KEY,
        value: JSON.stringify(merged),
      },
    })
    return NextResponse.json({ success: true, data: merged })
  } catch (error) {
    console.error("Error saving subscription payment settings:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to save subscription payment settings",
        error:
          error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
