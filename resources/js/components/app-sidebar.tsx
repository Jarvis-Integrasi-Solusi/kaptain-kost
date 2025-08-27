import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavGroup, type PageProps } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import {
    BarChart3,
    BedDouble,
    BookUser,
    CalendarRange,
    ChartBarStacked,
    ClipboardCopy,
    CreditCard,
    DoorOpen,
    FileText,
    LayoutGrid,
    ShieldCheck,
    User,
    UserCog,
    Wrench,
} from 'lucide-react';
import AppLogo from './app-logo';

// Manager Navigation
const managerNavGroups: NavGroup[] = [
    {
        title: 'Overview',
        items: [
            {
                title: 'Dashboard',
                href: '/manager/dashboard',
                icon: LayoutGrid,
            },
            {
                title: 'Booking Chart',
                href: '/manager/booking-chart',
                icon: BookUser,
            },
        ],
    },
    {
        title: 'Users ',
        items: [
            {
                title: 'Manager',
                href: '/manager/users/managers',
                icon: UserCog,
            },
            {
                title: 'Operator',
                href: '/manager/users/operators',
                icon: Wrench,
            },
            {
                title: 'Tenant',
                href: '/manager/users/tenants',
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
            {
                title: 'Occupancy Status',
                href: '/manager/room/occupancy-status',
                icon: DoorOpen,
            },
            {
                title: 'Condition Status',
                href: '/manager/room/condition-status',
                icon: ShieldCheck,
            },
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
            {
                title: 'Payment Type',
                href: '/manager/rental/payment-type',
                icon: CreditCard,
            },
            {
                title: 'Rental Period',
                href: '/manager/rental/period',
                icon: CalendarRange,
            },
        ],
    },
];

// Operator Navigation
const operatorNavGroups: NavGroup[] = [
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

// Tenant Navigation
const tenantNavGroups: NavGroup[] = [
    {
        title: 'Overview',
        items: [
            {
                title: 'Dashboard',
                href: '/tenant/dashboard',
                icon: LayoutGrid,
            },
        ],
    },
];

export function AppSidebar() {
    const { auth } = usePage<PageProps>().props;
    const user = auth.user;

    const getNavGroups = (): NavGroup[] => {
        if (!user) return [];

        switch (user.role) {
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

    const getDashboardRoute = (): string => {
        if (!user) return '/dashboard';

        switch (user.role) {
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

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={getDashboardRoute()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain groups={getNavGroups()} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
