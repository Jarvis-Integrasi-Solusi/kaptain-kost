import { Rental } from './rental';

export interface DepositReturned {
    id: number;
    rental_id: number;
    rental: Rental;
    returned_at: string;
    proof_image: string;
}
