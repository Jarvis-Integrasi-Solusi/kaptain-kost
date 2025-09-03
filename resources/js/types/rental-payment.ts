export interface RentalPayment {
    length: number;
    id: number;
    amount: number;
    billing_date: string;
    payment_status: string;
    category: 'rental_fee' | 'deposit_fee' | 'management_fee';
    payment_method: 'cash' | 'payment_gateway';
    payment_proof?: string;
    is_deposit_refunded: boolean;
    paid_at: string;
}
