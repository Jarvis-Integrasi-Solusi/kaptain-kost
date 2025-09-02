import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type PageProps } from '@/types';
import { Rental } from '@/types/rental';
import { User } from '@/types/user';
import { formatCurrency } from '@/utils/format';
import { Head, router, usePage } from '@inertiajs/react';
import { ChevronLeft, ChevronRight, Edit, Eye, Search } from 'lucide-react';
import { useMemo, useState } from 'react';

interface TenantShowPageProps extends PageProps {
    tenant: User;
    rentals: Rental[];
    flash?: {
        success?: {
            title: string;
            message: string;
        };
        error?: {
            title: string;
            message: string;
        };
    };
}

export default function ShowTenant() {
    const { tenant, rentals } = usePage<TenantShowPageProps>().props;
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(3);

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Manager',
        },
        {
            title: 'Users',
        },
        {
            title: 'Tenants',
            href: '/manager/user/tenant',
        },
        {
            title: tenant.name,
            href: `/manager/user/tenant/${tenant.id}`,
        },
    ];

    const handleEdit = () => {
        router.get(`/manager/user/tenant/${tenant.id}/edit`);
    };

    // Filter and paginate rental data
    const { paginatedData, totalPages, totalItems } = useMemo(() => {
        // Filter data based on search
        const filtered = rentals.filter((rental) => {
            if (!search.trim()) return true;

            const searchTerm = search.toLowerCase().trim();
            return (
                rental.room?.name?.toLowerCase().includes(searchTerm) ||
                rental.room?.room_category?.name?.toLowerCase().includes(searchTerm) ||
                rental.payment_type?.name?.toLowerCase().includes(searchTerm)
            );
        });

        // Calculate pagination
        const total = filtered.length;
        const pages = Math.ceil(total / itemsPerPage);

        // Get current page data
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const paginated = filtered.slice(startIndex, endIndex);

        return {
            paginatedData: paginated,
            totalPages: pages,
            totalItems: total,
        };
    }, [rentals, search, currentPage, itemsPerPage]);

    // Reset to first page when search changes
    const handleSearchChange = (value: string) => {
        setSearch(value);
        setCurrentPage(1);
    };

    const handleItemsPerPageChange = (value: string) => {
        setItemsPerPage(parseInt(value));
        setCurrentPage(1);
    };

    // Generate pagination buttons
    const paginationButtons = useMemo(() => {
        const buttons = [];
        const maxButtons = 5;

        if (totalPages <= maxButtons) {
            for (let i = 1; i <= totalPages; i++) {
                buttons.push(i);
            }
        } else {
            if (currentPage <= 3) {
                buttons.push(1, 2, 3, 4, '...', totalPages);
            } else if (currentPage >= totalPages - 2) {
                buttons.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
            } else {
                buttons.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
            }
        }

        return buttons;
    }, [currentPage, totalPages]);

    // Calculate display info
    const fromItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
    const toItem = Math.min(currentPage * itemsPerPage, totalItems);

    // Format date
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    const getPaymentTypeBadge = (type?: string) => {
        const normalizedType = type?.toLowerCase();

        if (normalizedType === 'cash') {
            return <Badge variant="warning">{type}</Badge>;
        } else if (normalizedType === 'monthly') {
            return <Badge variant="info">{type}</Badge>;
        } else if (normalizedType === 'partial') {
            return <Badge variant="success">{type}</Badge>;
        }

        return <Badge variant="destructive">{type}</Badge>;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Tenant Detail - ${tenant.name}`} />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div>
                            <h1 className="text-2xl font-bold">Tenant Detail</h1>
                            <p className="text-muted-foreground">View tenant account information</p>
                        </div>
                    </div>
                    <Button variant="outline" onClick={handleEdit}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Tenant
                    </Button>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Tenant Information */}
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">Tenant Information</CardTitle>
                            <CardDescription>Personal and contact details</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                {/* Basic Information */}
                                <div className="space-y-4">
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium">Full Name</Label>
                                            <Input value={tenant.name} disabled className="bg-muted" />
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium">Email Address</Label>
                                            <Input value={tenant.email} disabled className="bg-muted" />
                                        </div>
                                    </div>

                                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium">Username</Label>
                                            <Input value={tenant.username || '-'} disabled className="bg-muted" />
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium">Telephone</Label>
                                            <Input value={tenant.telephone || '-'} disabled className="bg-muted" />
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium">Gender</Label>
                                            <Input
                                                value={tenant.gender ? tenant.gender.charAt(0).toUpperCase() + tenant.gender.slice(1) : '-'}
                                                disabled
                                                className="bg-muted"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <Separator />

                                {/* Contact Information */}
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium">Address</Label>
                                        <Textarea value={tenant.address || '-'} disabled className="bg-muted" rows={3} />
                                    </div>

                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium">Emergency Contact</Label>
                                            <Input value={tenant.guardian_name || '-'} disabled className="bg-muted" />
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium">Emergency Contact Telephone</Label>
                                            <Input value={tenant.guardian_telephone || '-'} disabled className="bg-muted" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Profile Image & Rental Summary */}
                    <div className="space-y-6">
                        {/* Profile Image Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Profile Image</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex justify-center">
                                    {tenant.image ? (
                                        <img src={tenant.image} alt={`${tenant.name} profile`} className="h-48 w-48 rounded-lg border object-cover" />
                                    ) : (
                                        <div className="flex h-48 w-48 flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted">
                                            <p className="text-sm text-muted-foreground">No image uploaded</p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Rental History Card */}
                    <Card className="lg:col-span-3">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Rental History</CardTitle>
                                    <CardDescription>
                                        All rental history for this tenant
                                        {search && <span className="ml-2 text-sm text-blue-600">• Filtered by "{search}"</span>}
                                    </CardDescription>
                                </div>
                                {/* Search Input */}
                                <div className="relative w-72">
                                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        placeholder="Search rental history..."
                                        value={search}
                                        onChange={(e) => handleSearchChange(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Room</TableHead>
                                            <TableHead>Room Category</TableHead>
                                            <TableHead>Entry Date</TableHead>
                                            <TableHead>Exit Date</TableHead>
                                            <TableHead>Payment Type</TableHead>
                                            <TableHead>Rental Period</TableHead>
                                            <TableHead>Total Price</TableHead>
                                            <TableHead className="w-[80px]">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {paginatedData.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={8} className="h-24 text-center">
                                                    {search
                                                        ? `No rental records found matching "${search}".`
                                                        : 'No rental records found for this tenant.'}
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            paginatedData.map((rental) => (
                                                <TableRow key={rental.id}>
                                                    <TableCell>
                                                        <div className="font-medium">{rental.room?.name}</div>
                                                    </TableCell>
                                                    <TableCell>{rental.room?.room_category?.name}</TableCell>
                                                    <TableCell>{formatDate(rental.entry_date)}</TableCell>
                                                    <TableCell>{rental.exit_date ? formatDate(rental.exit_date) : '-'}</TableCell>
                                                    <TableCell>{getPaymentTypeBadge(rental.payment_type?.name)}</TableCell>
                                                    <TableCell>{rental.rental_period?.month} Months</TableCell>
                                                    <TableCell className="font-semibold">{formatCurrency(rental.total_price)}</TableCell>
                                                    <TableCell>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="h-8 w-8 p-0"
                                                            onClick={() => router.get(`/manager/rental/${rental.id}`)}
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex flex-col items-center gap-4 py-4 md:flex-row md:justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="text-sm text-muted-foreground">
                                            Showing {fromItem} to {toItem} of {totalItems} entries
                                        </div>
                                        <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
                                            <SelectTrigger className="w-[120px]">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="3">3 per page</SelectItem>
                                                <SelectItem value="5">5 per page</SelectItem>
                                                <SelectItem value="8">8 per page</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        {/* Previous Button */}
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setCurrentPage(currentPage - 1)}
                                            disabled={currentPage === 1}
                                        >
                                            <ChevronLeft className="h-4 w-4" />
                                            Previous
                                        </Button>

                                        {/* Page Numbers */}
                                        <div className="flex space-x-1">
                                            {paginationButtons.map((page, index) => (
                                                <div key={index}>
                                                    {page === '...' ? (
                                                        <span className="px-3 py-1 text-sm text-muted-foreground">...</span>
                                                    ) : (
                                                        <Button
                                                            variant={currentPage === page ? 'default' : 'outline'}
                                                            size="sm"
                                                            onClick={() => setCurrentPage(page as number)}
                                                            className="min-w-[40px]"
                                                        >
                                                            {page}
                                                        </Button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>

                                        {/* Next Button */}
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setCurrentPage(currentPage + 1)}
                                            disabled={currentPage === totalPages}
                                        >
                                            Next
                                            <ChevronRight className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
