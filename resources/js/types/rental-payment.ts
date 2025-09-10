import { Rental } from './rental';

export interface RentalPayment {
    length: number;
    id: number;
    amount: number;
    billing_date: string;
    due_date: string;
    payment_status: string;
    category: 'rental_fee' | 'deposit_fee' | 'management_fee';
    payment_method: 'cash' | 'payment_gateway';
    payment_proof?: string;
    paid_at: string;
    rental: Rental;
}
