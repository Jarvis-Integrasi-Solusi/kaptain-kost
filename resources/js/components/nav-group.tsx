import { type NavGroup } from '@/types';
import { BarChart3, BedDouble, BedSingle, ChartBarStacked, ClipboardCopy, FileText, LayoutGrid, User, UserCog, Wrench } from 'lucide-react';

// Manager Navigation Groups
export const managerNavGroups: NavGroup[] = [
    // {
    //     title: 'Overview',
    //     items: [
    //         {
    //             title: 'Dashboard',
    //             href: '/manager/dashboard',
    //             icon: LayoutGrid,
    //         },
    //         {
    //             title: 'Booking Chart',
    //             href: '/manager/booking-chart',
    //             icon: BookUser,
    //         },
    //     ],
    // },
    {
        title: 'Users ',
        items: [
            {
                title: 'Manager',
                href: '/manager/user/manager',
                icon: UserCog,
            },
            // {
            //     title: 'Operator',
            //     href: '/manager/user/operator',
            //     icon: Wrench,
            // },
            {
                title: 'Tenant',
                href: '/manager/user/tenant',
                icon: User,
            },
        ],
    },
    {
        title: 'Rooms',
        items: [
            {
                title: 'Room List',
                href: '/manager/room',
                icon: BedDouble,
            },
            {
                title: 'Category',
                href: '/manager/room/category',
                icon: ChartBarStacked,
            },
            // {
            //     title: 'Occupancy Status',
            //     href: '/manager/room/occupancy-status',
            //     icon: DoorOpen,
            // },
            // {
            //     title: 'Condition Status',
            //     href: '/manager/room/condition-status',
            //     icon: ShieldCheck,
            // },
        ],
    },
    {
        title: 'Rental',
        items: [
            {
                title: 'Rental Record',
                href: '/manager/rental',
                icon: ClipboardCopy,
            },
            // {
            //     title: 'Payment Type',
            //     href: '/manager/rental/payment-type',
            //     icon: CreditCard,
            // },
            // {
            //     title: 'Rental Period',
            //     href: '/manager/rental/period',
            //     icon: CalendarRange,
            // },
        ],
    },
];

// Operator Navigation Groups
export const operatorNavGroups: NavGroup[] = [
    {
        title: 'Overview',
        items: [
            {
                title: 'Dashboard',
                href: '/operator/dashboard',
                icon: LayoutGrid,
            },
        ],
    },
    {
        title: 'Operations',
        items: [
            {
                title: 'Daily Tasks',
                href: '/operator/operations',
                icon: FileText,
            },
            {
                title: 'Maintenance',
                href: '/operator/maintenance',
                icon: Wrench,
            },
        ],
    },
    {
        title: 'Reports',
        items: [
            {
                title: 'Operation Reports',
                href: '/operator/reports',
                icon: BarChart3,
            },
        ],
    },
];

// Tenant Navigation Groups
export const tenantNavGroups: NavGroup[] = [
    // {
    //     title: 'Overview',
    //     items: [
    //         {
    //             title: 'Dashboard',
    //             href: '/tenant/dashboard',
    //             icon: LayoutGrid,
    //         },
    //     ],
    // },
    {
        title: 'Resource',
        items: [
            {
                title: 'Rental',
                href: '/tenant/rental',
                icon: BedSingle,
            },
        ],
    },
];

// Navigation utilities
export const getNavGroupsByRole = (role?: string): NavGroup[] => {
    switch (role) {
        case 'manager':
            return managerNavGroups;
        case 'operator':
            return operatorNavGroups;
        case 'tenant':
            return tenantNavGroups;
        default:
            return tenantNavGroups;
    }
};

export const getDashboardRouteByRole = (role?: string): string => {
    switch (role) {
        case 'manager':
            return '/manager/dashboard';
        case 'operator':
            return '/operator/dashboard';
        case 'tenant':
            return '/tenant/dashboard';
        default:
            return '/dashboard';
    }
};
