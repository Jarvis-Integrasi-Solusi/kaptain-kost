import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type PageProps } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { ChevronLeft, ChevronRight, Eye, MoreHorizontal, Search, X } from 'lucide-react';
import { useMemo, useState } from 'react';

interface OccupancyStatus {
    id: number;
    name: string;
    created_at?: string;
    updated_at?: string;
}

interface OccupancyStatusPageProps extends PageProps {
    occupancy_statuses: OccupancyStatus[];
    filters: {
        search?: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Manager',
    },
    {
        title: 'Rooms',
    },
    {
        title: 'Occupancy Status',
        href: '/manager/room/occupancy-status',
    },
];

export default function OccupancyStatusList() {
    const { occupancy_statuses, filters } = usePage<OccupancyStatusPageProps>().props;
    const [search, setSearch] = useState(filters?.search || '');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(8);

    // Filter and paginate data using useMemo
    const { paginatedData, totalPages, totalItems } = useMemo(() => {
        // Filter data based on search
        const filtered = occupancy_statuses.filter((status) => {
            if (!search.trim()) return true;

            const searchTerm = search.toLowerCase().trim();
            return status.name?.toLowerCase().includes(searchTerm);
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
    }, [occupancy_statuses, search, currentPage, itemsPerPage]);

    // Reset to first page when search changes
    const handleSearchChange = (value: string) => {
        setSearch(value);
        setCurrentPage(1);
    };

    // Reset to first page when items per page changes
    const handleItemsPerPageChange = (value: string) => {
        setItemsPerPage(parseInt(value));
        setCurrentPage(1);
    };

    // Clear search and reset pagination
    const clearSearch = () => {
        setSearch('');
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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Occupancy Status" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-xl">Occupancy Status</CardTitle>
                                <CardDescription>
                                    Manage room occupancy status options
                                    {search && <span className="ml-2 text-sm text-blue-600">• Showing results for "{search}"</span>}
                                </CardDescription>
                            </div>
                        </div>

                        {/* Search and Filter Bar */}
                        <div className="flex flex-col gap-4 pt-4 sm:flex-row">
                            <div className="relative max-w-sm flex-1">
                                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Search status..."
                                    value={search}
                                    onChange={(e) => handleSearchChange(e.target.value)}
                                    className="pl-10"
                                />
                            </div>

                            <div className="flex gap-2">
                                {search && (
                                    <Button type="button" variant="outline" onClick={clearSearch}>
                                        <X className="mr-2 h-4 w-4" />
                                        Clear
                                    </Button>
                                )}
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead className="w-[100px]">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {paginatedData.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={2} className="h-24 text-center">
                                                {search ? `No status found matching "${search}".` : 'No status found.'}
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        paginatedData.map((status) => (
                                            <TableRow key={status.id}>
                                                <TableCell className="font-medium">{status.name}</TableCell>
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
                                                                <Link href={`/manager/room/occupancy-status/${status.id}`}>
                                                                    <Eye className="mr-2 h-4 w-4" />
                                                                    View
                                                                </Link>
                                                            </DropdownMenuItem>
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
        </AppLayout>
    );
}
