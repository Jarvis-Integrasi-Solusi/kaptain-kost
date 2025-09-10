import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type PageProps } from '@/types';
import { Rental } from '@/types/rental';
import { getRentalStatusBadge } from '@/utils/badges';
import { formatDate } from '@/utils/format';
import { Head, Link, usePage } from '@inertiajs/react';
import { BedDouble } from 'lucide-react';

interface TenantRentalIndexProps extends PageProps {
    rentals: Rental[];
    filters: {
        search: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Tenant',
    },
    {
        title: 'My Rentals',
    },
];

export default function TenantRentalIndex() {
    const { rentals } = usePage<TenantRentalIndexProps>().props;

    if (rentals.length === 0) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="My Rentals" />
                <div className="flex h-full flex-1 flex-col items-center justify-center p-6">
                    <div className="text-center">
                        <BedDouble className="mx-auto h-16 w-16 text-gray-400" />
                        <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-gray-100">No Rentals Found</h3>
                        <p className="mt-2 text-gray-500 dark:text-gray-400">You don't have any rental records yet.</p>
                    </div>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="My Rentals" />

            <div className="flex h-full flex-1 flex-col gap-4 p-4 sm:gap-6 sm:p-6">
                {/* Header */}
                <div className="flex flex-col gap-1 md:gap-2">
                    <h1 className="text-lg font-bold text-gray-900 md:text-2xl dark:text-gray-100">My Rentals</h1>
                    <p className="text-xs text-gray-600 md:text-sm dark:text-gray-400">View your rental history</p>
                </div>

                {/* Rentals List */}
                <div className="grid gap-1 md:gap-4 space-y-4 md:grid-cols-3 md:space-y-0">
                    {rentals.map((rental) => (
                        <Link href={`/tenant/rental/${rental.id}`} key={rental.id}>
                            <Card className="py-3 transition-shadow hover:shadow-md">
                                <CardHeader className="px-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between">
                                                <CardTitle className="text-sm font-semibold md:text-lg">{rental.room.name}</CardTitle>
                                                <div>{getRentalStatusBadge(rental.status)}</div>
                                            </div>
                                            <div className="text-sm text-muted-foreground">{rental.room.room_category.name}</div>
                                        </div>
                                    </div>
                                </CardHeader>

                                <CardContent className="px-4 pt-0">
                                    <div className="flex justify-between text-xs md:text-sm">
                                        <span>Start: {formatDate(rental.entry_date)}</span>
                                        <span>End: {formatDate(rental.exit_date)}</span>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}
