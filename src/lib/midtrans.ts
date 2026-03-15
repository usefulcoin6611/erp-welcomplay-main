import midtransClient from "midtrans-client"

const isProduction = process.env.MIDTRANS_IS_PRODUCTION === "true"

// CoreApi client — for server-side status checks and custom payment UI
export const coreApi = new midtransClient.CoreApi({
    isProduction,
    serverKey: process.env.MIDTRANS_SERVER_KEY ?? "",
    clientKey: process.env.MIDTRANS_CLIENT_KEY ?? "",
}) as any

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
    if (paymentMethod === 'qris') {
        basePayload.payment_type = 'qris'
        basePayload.qris = { acquirer: 'gopay' }
    } else if (paymentMethod === 'gopay') {
        basePayload.payment_type = 'gopay'
        basePayload.gopay = { 
            enable_callback: true, 
            callback_url: `${process.env.NEXT_PUBLIC_BETTER_AUTH_URL}/settings?tab=subscription-plan` 
        }
    } else if (['bca', 'mandiri', 'bni', 'bri', 'bsi', 'permata', 'cimb', 'danamon'].includes(paymentMethod)) {
        basePayload.payment_type = 'bank_transfer'
        
        if (paymentMethod === 'mandiri') {
            basePayload.payment_type = 'echannel'
            basePayload.echannel = {
                bill_info1: "Subscription Payment",
                bill_info2: planName.slice(0, 50)
            }
        } else if (paymentMethod === 'permata') {
            basePayload.bank_transfer = { bank: 'permata' }
        } else {
            basePayload.bank_transfer = { bank: paymentMethod }
        }
    } else {
        throw new Error(`Payment method ${paymentMethod} not supported via Core API yet`)
    }

    return coreApi.charge(basePayload)
}
