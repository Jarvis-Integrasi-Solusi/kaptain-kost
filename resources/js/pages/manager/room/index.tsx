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
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type PageProps } from '@/types';
import { Room } from '@/types/room';
import { formatCurrency } from '@/utils/format';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { ChevronLeft, ChevronRight, Edit, Eye, Filter, MoreHorizontal, Plus, Search, Trash2, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { getRoomStatusBadge } from '@/utils/badges';

interface RoomPageProps extends PageProps {
    rooms: Room[];
    filters: {
        search?: string;
        status?: string;
        category?: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Manager',
    },
    {
        title: 'Rooms',
        href: '/manager/room',
    },
];

export default function RoomList() {
    const { rooms, filters } = usePage<RoomPageProps>().props;
    const [search, setSearch] = useState(filters?.search || '');
    const [categoryFilter, setCategoryFilter] = useState(filters?.category || '');
    const [statusFilter, setStatusFilter] = useState(filters?.status || '');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(8);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Get unique categories for filter dropdown
    const availableCategories = useMemo(() => {
        const categories = rooms
            .map((room) => room.room_category)
            .filter((category, index, self) => category && self.findIndex((c) => c?.id === category.id) === index)
            .sort((a, b) => a?.name.localeCompare(b?.name) || 0);

        return categories;
    }, [rooms]);

    // Filter and paginate data using useMemo
    const { paginatedData, totalPages, totalItems } = useMemo(() => {
        // Filter data based on search and category
        const filtered = rooms.filter((room) => {
            // Search filter
            let matchesSearch = true;
            if (search.trim()) {
                const searchTerm = search.toLowerCase().trim();
                matchesSearch =
                    room.name?.toLowerCase().includes(searchTerm) ||
                    room.description?.toLowerCase().includes(searchTerm) ||
                    room.room_category?.name?.toLowerCase().includes(searchTerm);
            }

            // Category filter
            let matchesCategory = true;
            if (categoryFilter) {
                matchesCategory = room.room_category?.id.toString() === categoryFilter;
            }

            // Status filter
            let matchesStatus = true;
            if (statusFilter) {
                matchesStatus = room.occupancy_status?.toLowerCase() === statusFilter.toLowerCase();
            }

            return matchesSearch && matchesCategory && matchesStatus;
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
    }, [rooms, search, categoryFilter, statusFilter, currentPage, itemsPerPage]);

    // Reset to first page when search changes
    const handleSearchChange = (value: string) => {
        setSearch(value);
        setCurrentPage(1);
    };

    // Reset to first page when category filter changes
    const handleCategoryFilterChange = (value: string) => {
        setCategoryFilter(value);
        setCurrentPage(1);
    };

    // Reset to first page when status filter changes
    const handleStatusFilterChange = (value: string) => {
        setStatusFilter(value);
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

    // Clear category filter and reset pagination
    const clearCategoryFilter = () => {
        setCategoryFilter('');
        setStatusFilter('');
        setCurrentPage(1);
    };

    // Clear status filter and reset pagination
    const clearStatusFilter = () => {
        setStatusFilter('');
        setCurrentPage(1);
    };

    // Clear all filters
    const clearAllFilters = () => {
        setSearch('');
        setCategoryFilter('');
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
        router.delete(`/manager/room/${id}`, {
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
    const activeFiltersCount = (search ? 1 : 0) + (categoryFilter ? 1 : 0) + (statusFilter ? 1 : 0);
    const getFilterDescription = () => {
        const parts = [];
        if (search) parts.push(`"${search}"`);

        if (categoryFilter) {
            const selectedCategory = availableCategories.find((cat) => cat?.id.toString() === categoryFilter);
            if (selectedCategory) parts.push(`Category: ${selectedCategory.name}`);
        }

        if (statusFilter) {
            parts.push(`Status: ${statusFilter}`);
        }

        return parts.join(' • ');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Rooms" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-xl">Rooms</CardTitle>
                                <CardDescription>
                                    Manage your rooms and their details
                                    {activeFiltersCount > 0 && (
                                        <span className="ml-2 text-sm text-blue-600">• Filtered by {getFilterDescription()}</span>
                                    )}
                                </CardDescription>
                            </div>
                            <Button asChild>
                                <Link href="/manager/room/create">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Room
                                </Link>
                            </Button>
                        </div>

                        {/* Search and Filter Bar */}
                        <div className="flex flex-col gap-4 pt-4">
                            {/* Search and Filters Row */}
                            <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
                                {/* Search Input - Full width on mobile, flexible on desktop */}
                                <div className="relative flex-1 lg:max-w-sm">
                                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        placeholder="Search rooms..."
                                        value={search}
                                        onChange={(e) => handleSearchChange(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>

                                {/* Filters - Full width on mobile, auto width on desktop */}
                                <div className="flex gap-2">
                                    {/* Category Filter */}
                                    <div className="relative">
                                        <Filter className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                        <Select value={categoryFilter} onValueChange={handleCategoryFilterChange}>
                                            <SelectTrigger className="w-full pl-10 lg:w-[150px]">
                                                <SelectValue placeholder="Category" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {availableCategories.map((category) => (
                                                    <SelectItem key={category?.id} value={category?.id.toString()}>
                                                        {category?.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="relative">
                                        <Filter className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                        <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
                                            <SelectTrigger className="w-full pl-10 lg:w-[150px]">
                                                <SelectValue placeholder="Status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="available">Available</SelectItem>
                                                <SelectItem value="reserved">Reserved</SelectItem>
                                                <SelectItem value="occupied">Occupied</SelectItem>
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

                                    {categoryFilter && (
                                        <Button type="button" variant="outline" size="sm" onClick={clearCategoryFilter}>
                                            <X className="mr-2 h-4 w-4" />
                                            Clear Category
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
                                        <TableHead className="w-[130px]">Image</TableHead>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Category</TableHead>
                                        <TableHead>Monthly Fee</TableHead>
                                        <TableHead>Occupancy</TableHead>
                                        {/* <TableHead>Condition</TableHead> */}
                                        {/* <TableHead>Description</TableHead> */}
                                        <TableHead className="w-[100px]">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {paginatedData.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={8} className="h-24 text-center">
                                                {activeFiltersCount > 0 ? `No rooms found matching your filters.` : 'No rooms found.'}
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        paginatedData.map((room) => (
                                            <TableRow key={room.id}>
                                                <TableCell>
                                                    {room.image ? (
                                                        <img
                                                            src={`/storage/${room.image}`}
                                                            alt={room.name}
                                                            className="h-12 w-20 rounded-md object-cover"
                                                        />
                                                    ) : (
                                                        <div className="flex h-12 w-16 items-center justify-center rounded-md bg-gray-100 text-xs text-gray-400">
                                                            No Image
                                                        </div>
                                                    )}
                                                </TableCell>
                                                <TableCell className="font-medium">{room.name}</TableCell>
                                                <TableCell>{room.room_category?.name}</TableCell>
                                                <TableCell>{formatCurrency(room.room_category?.monthly_rental_fee || 0)}</TableCell>
                                                <TableCell>{getRoomStatusBadge(room.occupancy_status)}</TableCell>
                                                {/* <TableCell>
                                                    <Badge variant="success">clean</Badge>
                                                </TableCell> */}
                                                {/* <TableCell className="max-w-[150px]">
                                                    <div className="truncate" title={room.description}>
                                                        {room.description || '-'}
                                                    </div>
                                                </TableCell> */}
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
                                                                <Link href={`/manager/room/${room.id}`}>
                                                                    <Eye className="mr-2 h-4 w-4" />
                                                                    View
                                                                </Link>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem className="text-yellow-600" asChild>
                                                                <Link href={`/manager/room/${room.id}/edit`}>
                                                                    <Edit className="mr-2 h-4 w-4 text-yellow-600" />
                                                                    Edit
                                                                </Link>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem className="text-red-600" onClick={() => setDeleteId(room.id)}>
                                                                <Trash2 className="mr-2 h-4 w-4 text-red-600" />
                                                                Delete
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
            <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>This will permanently delete the room and its associated image.</AlertDialogDescription>
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
        </AppLayout>
    );
}
