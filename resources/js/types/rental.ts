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
    room: Room;
    user: User;
    rental_period?: RentalPeriod;
    payment_type?: PaymentType;
    rental_payments: RentalPayment[];
    created_at?: string;
    updated_at?: string;
}
