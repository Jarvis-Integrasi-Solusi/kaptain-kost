export interface User {
    id: number;
    name: string;
    email: string;
    image?: string;
    username?: string;
    telephone?: string;
    gender?: 'male' | 'female';
    address?: string;
    guardian_name?: string;
    guardian_telephone?: string;
    email_verified_at?: string;
    status?: 'active' | 'inactive';
    company_id?: number;
    company?: {
        id: number;
        name: string;
    };
    role: 'manager' | 'operator' | 'tenant';
    created_at?: string;
    updated_at?: string;
}
