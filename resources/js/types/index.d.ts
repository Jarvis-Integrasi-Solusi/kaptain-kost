// resources/js/types/index.d.ts
import { Config } from 'ziggy-js';

export interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at?: string;
    role: 'manager' | 'operator' | 'tenant';
}

export interface NavItem {
    title: string;
    href?: string;
    icon?: React.ComponentType;
    items?: NavItem[];
    isActive?: boolean;
}


export interface NavGroup {
    title: string;
    items: NavItem[];
}


export interface BreadcrumbItem {
    title: string;
    href?: string;
}

export type PageProps<T extends Record<string, unknown> = Record<string, unknown>> = T & {
    name: string;
    quote: {
        message: string;
        author: string;
    };
    auth: {
        user: User | null;
    };
    ziggy: Config & { location: string };
    sidebarOpen: boolean;
};