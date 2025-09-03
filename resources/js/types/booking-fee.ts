export interface BookingFee {
    id: number;
    amount: number;
    company_id: number | null;
    created_at?: string;
    updated_at?: string;
}
