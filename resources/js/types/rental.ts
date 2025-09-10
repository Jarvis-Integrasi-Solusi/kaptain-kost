import { BookingFee } from './booking-fee';
import { Company } from './company';
import { DepositReturned } from './deposit-returned';
import { PaymentType } from './payment-type';
import { RentalPayment } from './rental-payment';
import { RentalPeriod } from './rental-period';
import { Room } from './room';
import { User } from './user';

export interface Rental {
    id: number;
    entry_date: string;
    exit_date?: string;
    total_price: number;
    company_id: number;
    room: Room;
    user: User;
    rental_period?: RentalPeriod;
    payment_type?: PaymentType;
    rental_payments: RentalPayment[];
    company: Company
    status: string;
    is_deposit_returned: boolean;
    deposit_return?: DepositReturned;
    booking_fee_id: number;
    booking_fee?: BookingFee;
    is_down_payment_paid_full: boolean;
    created_at?: string;
    updated_at?: string;
}
