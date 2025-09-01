export interface PaymentSummary {
    total_price: number;
    total_paid: number;
    remaining_balance: number;
    payment_status: string;
    payment_progress: number;
}