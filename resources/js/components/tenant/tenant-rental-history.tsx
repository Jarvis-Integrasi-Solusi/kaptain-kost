import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Rental } from '@/types/rental';
import { formatCurrency } from '@/utils/format';
import { router } from '@inertiajs/react';
import { ChevronLeft, ChevronRight, Eye, Search } from 'lucide-react';
import { useMemo, useState } from 'react';

interface TenantRentalHistoryProps {
    rentals: Rental[];
    tenantName?: string;
}

export default function TenantRentalHistory({ rentals }: TenantRentalHistoryProps) {
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(3);

    // Filter and paginate rental data - different filter logic for tenant context
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
                                        {search ? `No rental records found matching "${search}".` : 'No rental records found for this tenant.'}
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
                            <Button variant="outline" size="sm" onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages}>
                                Next
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
