const isProduction = process.env.MIDTRANS_IS_PRODUCTION === "true"
const MIDTRANS_BASE_URL = isProduction
    ? "https://api.midtrans.com/v2"
    : "https://api.sandbox.midtrans.com/v2"

const SERVER_KEY = process.env.MIDTRANS_SERVER_KEY ?? ""
const AUTH_HEADER = `Basic ${Buffer.from(SERVER_KEY + ":").toString("base64")}`

/**
 * Custom Midtrans Client using fetch to avoid deprecated url.parse() warning
 * and provide better control over environment and banking methods.
 */
export const coreApi = {
    charge: async (payload: any) => {
        const response = await fetch(`${MIDTRANS_BASE_URL}/charge`, {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": AUTH_HEADER,
            },
            body: JSON.stringify(payload),
        })
        const data = await response.json()
        if (!response.ok) {
            throw new Error(data.status_message || "Midtrans Charge Error")
        }
        return data
    },
    transaction: {
        status: async (orderId: string) => {
            const response = await fetch(`${MIDTRANS_BASE_URL}/${orderId}/status`, {
                method: "GET",
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                    "Authorization": AUTH_HEADER,
                },
            })
            const data = await response.json()
            if (!response.ok) {
                throw new Error(data.status_message || "Midtrans Status Error")
            }
            return data
        }
    }
} as any

// ─── Verify Webhook Signature ─────────────────────────────────
export function verifyMidtransSignature(
    orderId: string,
    statusCode: string,
    grossAmount: string,
    receivedSignature: string
): boolean {
    const crypto = require("crypto")
    const serverKey = process.env.MIDTRANS_SERVER_KEY ?? ""
    const expected = crypto
        .createHash("sha512")
        .update(`${orderId}${statusCode}${grossAmount}${serverKey}`)
        .digest("hex")

    return expected === receivedSignature
}

// ─── Generate Core API Charge ────────────────────────────────
export async function createCoreApiCharge(params: {
    orderId: string
    amount: number
    paymentMethod: string // e.g., 'bca', 'gopay', 'qris', etc.
    customerName: string
    customerEmail: string
    planName: string
}) {
    const { orderId, amount, paymentMethod, customerName, customerEmail, planName } = params

    const basePayload: any = {
        payment_type: "",
        transaction_details: {
            order_id: orderId,
            gross_amount: amount,
        },
        customer_details: {
            first_name: customerName,
            email: customerEmail,
        },
        item_details: [
            {
                id: planName.replace(/\s+/g, '-').toLowerCase(),
                price: amount,
                quantity: 1,
                name: `Subscription: ${planName}`.slice(0, 50),
            },
        ],
    }

    // Map internal IDs to Midtrans payment types
    // Support direct VA for these banks
    const directVABanks = ['bca', 'bni', 'bri', 'permata', 'cimb', 'bsi']
    
    if (paymentMethod === 'qris' || ['seabank', 'danamon', 'dana'].includes(paymentMethod)) {
        basePayload.payment_type = 'qris'
        basePayload.qris = { acquirer: 'gopay' } // Note: Dana/SeaBank/Danamon users scan the QRIS
    } else if (paymentMethod === 'gopay') {
        basePayload.payment_type = 'gopay'
        basePayload.gopay = {
            enable_callback: true,
            callback_url: `${process.env.NEXT_PUBLIC_BETTER_AUTH_URL}/settings?tab=subscription-plan`
        }
    } else if (paymentMethod === 'mandiri') {
        basePayload.payment_type = 'echannel'
        basePayload.echannel = {
            bill_info1: "Subscription Payment",
            bill_info2: planName.slice(0, 50)
        }
    } else if (directVABanks.includes(paymentMethod)) {
        basePayload.payment_type = 'bank_transfer'
        if (paymentMethod === 'permata') {
            basePayload.bank_transfer = { bank: 'permata' }
        } else {
            basePayload.bank_transfer = { bank: paymentMethod }
        }
    } else {
        // Default fallback to QRIS if unknown
        basePayload.payment_type = 'qris'
        basePayload.qris = { acquirer: 'gopay' }
    }

    return coreApi.charge(basePayload)
}

