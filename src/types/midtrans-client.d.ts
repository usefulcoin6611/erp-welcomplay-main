declare module 'midtrans-client' {
    export interface MidtransConfig {
        isProduction: boolean;
        serverKey: string;
        clientKey: string;
    }

    export interface SnapTransaction {
        token: string;
        redirect_url: string;
    }

    export interface TransactionDetails {
        order_id: string;
        gross_amount: number;
    }

    export class Snap {
        constructor(config: MidtransConfig);
        createTransaction(params: {
            transaction_details: TransactionDetails;
            customer_details?: {
                first_name?: string;
                email?: string;
                last_name?: string;
                phone?: string;
            };
            item_details?: Array<{
                id: string;
                price: number;
                quantity: number;
                name: string;
            }>;
        }): Promise<SnapTransaction>;
    }

    export class CoreApi {
        constructor(config: MidtransConfig);
        charge(payload: any): Promise<any>;
        transaction: {
            status(orderId: string): Promise<Record<string, any>>;
            notification(body: Record<string, any>): Promise<Record<string, any>>;
        };
    }
}
