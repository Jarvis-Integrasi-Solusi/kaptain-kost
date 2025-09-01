export interface RoomCategory {
    id: number;
    name: string;
    monthly_rental_fee: number;
    deposit_fee: number;
    management_fee: number;
    created_at?: string;
    updated_at?: string;
}
