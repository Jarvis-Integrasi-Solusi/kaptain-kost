import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type PageProps } from '@/types';
import { Rental } from '@/types/rental';
import { formatCurrency } from '@/utils/format';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { ChevronLeft, ChevronRight, Edit, Eye, Filter, MoreHorizontal, Plus, Search, Trash2, X } from 'lucide-react';
import { useMemo, useState } from 'react';

interface RentalRecordPageProps extends PageProps {
    rentals: Rental[];
    filters: {
        search?: string;
        room_category?: string;
        payment_type?: string;
        rental_period?: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Manager',
    },
    {
        title: 'Rental Records',
        href: '/manager/rental/record',
    },
];

export default function RentalRecordList() {
    const { rentals, filters } = usePage<RentalRecordPageProps>().props;
    const [search, setSearch] = useState(filters?.search || '');
    const [roomCategoryFilter, setRoomCategoryFilter] = useState(filters?.room_category || '');
    const [paymentTypeFilter, setPaymentTypeFilter] = useState(filters?.payment_type || '');
    const [rentalPeriodFilter, setRentalPeriodFilter] = useState(filters?.rental_period || '');
    const [statusFilter, setStatusFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(8);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [terminateId, setTerminateId] = useState<number | null>(null);
    const [isTerminating, setIsTerminating] = useState(false);

    // Get unique values for filter dropdowns
    const filterOptions = useMemo(() => {
        const roomCategories = Array.from(
            new Set(rentals.map((rental) => rental.room?.room_category?.name).filter((category) => category !== null && category !== undefined)),
        ) as string[];

        const paymentTypes = Array.from(
            new Set(rentals.map((rental) => rental.payment_type?.name).filter((type) => type !== null && type !== undefined)),
        ) as string[];

        const rentalPeriods = Array.from(
            new Set(rentals.map((rental) => rental.rental_period?.month).filter((period) => period !== null && period !== undefined)),
        ).sort((a, b) => a - b);

        const statuses = Array.from(new Set(rentals.map((rental) => rental.status).filter(Boolean)));

        return {
            roomCategories: roomCategories.sort(),
            paymentTypes: paymentTypes.sort(),
            rentalPeriods,
            statuses: statuses.sort(),
        };
    }, [rentals]);

    // Filter and paginate data using useMemo
    const { paginatedData, totalPages, totalItems } = useMemo(() => {
        // Filter data based on all filters
        const filtered = rentals.filter((rental) => {
            // Search filter
            let matchesSearch = true;
            if (search.trim()) {
                const searchTerm = search.toLowerCase().trim();
                matchesSearch =
                    rental.room?.name?.toLowerCase().includes(searchTerm) ||
                    rental.user?.name?.toLowerCase().includes(searchTerm) ||
                    rental.user?.email?.toLowerCase().includes(searchTerm) ||
                    rental.room?.room_category?.name?.toLowerCase().includes(searchTerm);
            }

            // Room category filter
            let matchesRoomCategory = true;
            if (roomCategoryFilter) {
                matchesRoomCategory = rental.room?.room_category?.name === roomCategoryFilter;
            }

            // Payment type filter
            let matchesPaymentType = true;
            if (paymentTypeFilter) {
                matchesPaymentType = rental.payment_type?.name === paymentTypeFilter;
            }

            // Rental period filter
            let matchesRentalPeriod = true;
            if (rentalPeriodFilter) {
                matchesRentalPeriod = rental.rental_period?.month?.toString() === rentalPeriodFilter;
            }

            // Status filter
            let matchesStatus = true;
            if (statusFilter) {
                matchesStatus = rental.status?.toLowerCase() === statusFilter.toLowerCase();
            }

            return matchesSearch && matchesRoomCategory && matchesPaymentType && matchesRentalPeriod && matchesStatus;
        });

        // Calculate pagination
        const total = filtered.length;
        const pages = Math.ceil(total / itemsPerPage);

        // Get current page data
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const paginated = filtered.slice(startIndex, endIndex);

        return {
            filteredData: filtered,
            paginatedData: paginated,
            totalPages: pages,
            totalItems: total,
        };
    }, [rentals, search, roomCategoryFilter, paymentTypeFilter, rentalPeriodFilter, statusFilter, currentPage, itemsPerPage]);

    // Reset to first page when filters change
    const handleSearchChange = (value: string) => {
        setSearch(value);
        setCurrentPage(1);
    };

    const handleRoomCategoryFilterChange = (value: string) => {
        setRoomCategoryFilter(value);
        setCurrentPage(1);
    };

    const handlePaymentTypeFilterChange = (value: string) => {
        setPaymentTypeFilter(value);
        setCurrentPage(1);
    };

    const handleRentalPeriodFilterChange = (value: string) => {
        setRentalPeriodFilter(value);
        setCurrentPage(1);
    };

    const handleItemsPerPageChange = (value: string) => {
        setItemsPerPage(parseInt(value));
        setCurrentPage(1);
    };

    // Clear individual filters
    const clearSearch = () => {
        setSearch('');
        setCurrentPage(1);
    };

    const clearRoomCategoryFilter = () => {
        setRoomCategoryFilter('');
        setCurrentPage(1);
    };

    const clearPaymentTypeFilter = () => {
        setPaymentTypeFilter('');
        setCurrentPage(1);
    };

    const clearRentalPeriodFilter = () => {
        setRentalPeriodFilter('');
        setCurrentPage(1);
    };

    const clearStatusFilter = () => {
        setStatusFilter('');
        setCurrentPage(1);
    };

    // Clear all filters
    const clearAllFilters = () => {
        setSearch('');
        setRoomCategoryFilter('');
        setPaymentTypeFilter('');
        setRentalPeriodFilter('');
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

    const handleDelete = async (id: number) => {
        setIsDeleting(true);
        router.delete(`/manager/rental/${id}`, {
            onSuccess: () => {
                setDeleteId(null);
            },
            onFinish: () => {
                setIsDeleting(false);
            },
        });
    };

    // Calculate display info
    const fromItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
    const toItem = Math.min(currentPage * itemsPerPage, totalItems);

    // Get active filter count and description
    const activeFiltersCount =
        (search ? 1 : 0) + (roomCategoryFilter ? 1 : 0) + (paymentTypeFilter ? 1 : 0) + (rentalPeriodFilter ? 1 : 0) + (statusFilter ? 1 : 0);
    const getFilterDescription = () => {
        const parts = [];
        if (search) parts.push(`"${search}"`);
        if (roomCategoryFilter) {
            parts.push(`Category: ${roomCategoryFilter}`);
        }
        if (paymentTypeFilter) {
            parts.push(`Payment: ${paymentTypeFilter}`);
        }
        if (rentalPeriodFilter) {
            parts.push(`Period: ${rentalPeriodFilter} months`);
        }
        return parts.join(' • ');
    };

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

        return <Badge variant="error">{type}</Badge>;
    };

    const getRentalStatusBadge = (status?: string) => {
        const normalizedStatus = status?.toLowerCase();

        if (normalizedStatus === 'booked') {
            return <Badge variant="warning">{status}</Badge>;
        } else if (normalizedStatus === 'occupied') {
            return <Badge variant="info">{status}</Badge>;
        } else if (normalizedStatus === 'completed') {
            return <Badge variant="success">{status}</Badge>;
        }

        return <Badge variant="error">{status}</Badge>;
    };

    const handleTerminate = async (id: number) => {
        setIsTerminating(true);
        router.post(
            `/manager/rental/${id}/terminate`,
            {},
            {
                onSuccess: () => {
                    setTerminateId(null);
                },
                onFinish: () => {
                    setIsTerminating(false);
                },
            },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Rental Records" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-xl">Rental Records</CardTitle>
                                <CardDescription>
                                    Manage your rental records and track tenants
                                    {activeFiltersCount > 0 && (
                                        <span className="ml-2 text-sm text-blue-600">• Filtered by {getFilterDescription()}</span>
                                    )}
                                </CardDescription>
                            </div>
                            <Button asChild>
                                <Link href="/manager/rental/create">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Rental Record
                                </Link>
                            </Button>
                        </div>

                        {/* Search and Filter Bar */}
                        <div className="flex flex-col gap-4 pt-4">
                            {/* Search and Filters Row */}
                            <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
                                {/* Search Input - Full width on mobile, 1/3 on desktop */}
                                <div className="relative flex-1 lg:max-w-sm">
                                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        placeholder="Search rentals..."
                                        value={search}
                                        onChange={(e) => handleSearchChange(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>

                                {/* Filters Row */}
                                <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap lg:flex-nowrap">
                                    {/* Room Category Filter */}
                                    <div className="relative">
                                        <Filter className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                        <Select value={roomCategoryFilter} onValueChange={handleRoomCategoryFilterChange}>
                                            <SelectTrigger className="w-full pl-10 lg:w-[160px]">
                                                <SelectValue placeholder="Category" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {filterOptions.roomCategories.map((category) => (
                                                    <SelectItem key={category} value={category}>
                                                        {category}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Payment Type Filter */}
                                    <div className="relative">
                                        <Filter className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                        <Select value={paymentTypeFilter} onValueChange={handlePaymentTypeFilterChange}>
                                            <SelectTrigger className="w-full pl-10 lg:w-[180px]">
                                                <SelectValue placeholder="Payment Type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {filterOptions.paymentTypes.map((type) => (
                                                    <SelectItem key={type} value={type}>
                                                        {type}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Rental Period Filter */}
                                    <div className="relative">
                                        <Filter className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                        <Select value={rentalPeriodFilter} onValueChange={handleRentalPeriodFilterChange}>
                                            <SelectTrigger className="w-full pl-10 lg:w-[160px]">
                                                <SelectValue placeholder="Rental Period" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {filterOptions.rentalPeriods.map((period) => (
                                                    <SelectItem key={period} value={period.toString()}>
                                                        {period} Month{period > 1 ? 's' : ''}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Status Filter */}
                                    <div className="relative">
                                        <Filter className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                        <Select
                                            value={statusFilter}
                                            onValueChange={(value) => {
                                                setStatusFilter(value);
                                                setCurrentPage(1);
                                            }}
                                        >
                                            <SelectTrigger className="w-full pl-10 lg:w-[160px]">
                                                <SelectValue placeholder="Status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {filterOptions.statuses.map((status) => (
                                                    <SelectItem key={status} value={status}>
                                                        {status.charAt(0).toUpperCase() + status.slice(1)}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>

                            {/* Clear Filter Buttons */}
                            {activeFiltersCount > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {search && (
                                        <Button type="button" variant="outline" size="sm" onClick={clearSearch}>
                                            <X className="mr-2 h-4 w-4" />
                                            Clear Search
                                        </Button>
                                    )}

                                    {roomCategoryFilter && (
                                        <Button type="button" variant="outline" size="sm" onClick={clearRoomCategoryFilter}>
                                            <X className="mr-2 h-4 w-4" />
                                            Clear Category
                                        </Button>
                                    )}

                                    {paymentTypeFilter && (
                                        <Button type="button" variant="outline" size="sm" onClick={clearPaymentTypeFilter}>
                                            <X className="mr-2 h-4 w-4" />
                                            Clear Payment Type
                                        </Button>
                                    )}

                                    {rentalPeriodFilter && (
                                        <Button type="button" variant="outline" size="sm" onClick={clearRentalPeriodFilter}>
                                            <X className="mr-2 h-4 w-4" />
                                            Clear Period
                                        </Button>
                                    )}

                                    {statusFilter && (
                                        <Button type="button" variant="outline" size="sm" onClick={clearStatusFilter}>
                                            <X className="mr-2 h-4 w-4" />
                                            Clear Status
                                        </Button>
                                    )}

                                    {activeFiltersCount > 1 && (
                                        <Button type="button" variant="outline" size="sm" onClick={clearAllFilters}>
                                            <X className="mr-2 h-4 w-4" />
                                            Clear All
                                        </Button>
                                    )}
                                </div>
                            )}
                        </div>
                    </CardHeader>

                    <CardContent>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Room</TableHead>
                                        <TableHead>Tenant</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Entry Date</TableHead>
                                        <TableHead>Exit Date</TableHead>
                                        <TableHead>Payment Type</TableHead>
                                        <TableHead>Rental Period</TableHead>
                                        <TableHead>Total Price</TableHead>
                                        <TableHead className="w-[100px]">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {paginatedData.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={9} className="h-24 text-center">
                                                {activeFiltersCount > 0
                                                    ? `No rental records found matching your filters.`
                                                    : 'No rental records found.'}
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        paginatedData.map((rental) => (
                                            <TableRow key={rental.id}>
                                                <TableCell>
                                                    <div>
                                                        <div className="font-medium">{rental.room?.name}</div>
                                                        <div className="text-sm text-muted-foreground">{rental.room?.room_category?.name}</div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div>
                                                        <div className="font-medium">{rental.user?.name}</div>
                                                        <div className="text-sm text-muted-foreground">{rental.user?.email}</div>
                                                    </div>
                                                </TableCell>

                                                <TableCell>{getRentalStatusBadge(rental.status)}</TableCell>
                                                <TableCell>{formatDate(rental.entry_date)}</TableCell>
                                                <TableCell>{rental.exit_date ? formatDate(rental.exit_date) : '-'}</TableCell>
                                                <TableCell>{getPaymentTypeBadge(rental.payment_type?.name)}</TableCell>
                                                <TableCell>{rental.rental_period?.month} Months</TableCell>
                                                <TableCell>{formatCurrency(rental.total_price)}</TableCell>
                                                <TableCell>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                                <span className="sr-only">Open menu</span>
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem asChild>
                                                                <Link href={`/manager/rental/${rental.id}`}>
                                                                    <Eye className="mr-2 h-4 w-4" />
                                                                    View
                                                                </Link>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem asChild>
                                                                {rental.status === 'booked' && (
                                                                    <Link
                                                                        href={`/manager/rental/${rental.id}/edit`}
                                                                        className="inline-flex items-center text-yellow-600 hover:underline"
                                                                    >
                                                                        <Edit className="mr-2 h-4 w-4 text-yellow-600" />
                                                                        Edit
                                                                    </Link>
                                                                )}
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem className="text-red-600" onClick={() => setDeleteId(rental.id)}>
                                                                <Trash2 className="mr-2 h-4 w-4 text-red-600" />
                                                                Delete
                                                            </DropdownMenuItem>
                                                            {rental.status !== 'terminated' && (
                                                                <DropdownMenuItem
                                                                    className="text-orange-600"
                                                                    onClick={() => setTerminateId(rental.id)}
                                                                >
                                                                    <X className="mr-2 h-4 w-4 text-orange-600" />
                                                                    Terminate
                                                                </DropdownMenuItem>
                                                            )}
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
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
                                            <SelectItem value="5">5 per page</SelectItem>
                                            <SelectItem value="8">8 per page</SelectItem>
                                            <SelectItem value="10">10 per page</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="flex items-center space-x-2">
                                    {/* Previous Button */}
                                    <Button variant="outline" size="sm" onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1}>
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

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>This will permanently delete the rental record and all associated data.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => deleteId && handleDelete(deleteId)}
                            disabled={isDeleting}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {isDeleting ? 'Deleting...' : 'Delete'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Terminate Confirmation Dialog */}
            <AlertDialog open={!!terminateId} onOpenChange={() => setTerminateId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Terminate Rental?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will mark the rental as <strong>terminated</strong>. Tenants will no longer be able to use this room under this
                            record.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => terminateId && handleTerminate(terminateId)}
                            disabled={isTerminating}
                            className="bg-orange-600 hover:bg-orange-700"
                        >
                            {isTerminating ? 'Terminating...' : 'Terminate'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
