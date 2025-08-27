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
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type PageProps } from '@/types';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { ChevronLeft, ChevronRight, Edit, MoreHorizontal, Plus, Search, Trash2, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

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
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [editingStatus, setEditingStatus] = useState<OccupancyStatus | null>(null);

    // Form for create
    const createForm = useForm({
        name: '',
    });

    // Form for edit
    const editForm = useForm({
        name: '',
    });

    // Reset create form when dialog closes
    useEffect(() => {
        if (!isCreateDialogOpen) {
            createForm.reset();
            createForm.clearErrors();
        }
    }, [isCreateDialogOpen]);

    // Reset edit form when dialog closes or editing status changes
    useEffect(() => {
        if (editingStatus) {
            editForm.setData('name', editingStatus.name);
        } else {
            editForm.reset();
            editForm.clearErrors();
        }
    }, [editingStatus]);

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

    // Handle create
    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post('/manager/room/occupancy-status', {
            onSuccess: () => {
                setIsCreateDialogOpen(false);
            },
        });
    };

    // Handle edit
    const handleEdit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingStatus) return;

        editForm.put(`/manager/room/occupancy-status/${editingStatus.id}`, {
            onSuccess: () => {
                setEditingStatus(null);
            },
        });
    };

    // Handle delete
    const handleDelete = async (id: number) => {
        setIsDeleting(true);
        router.delete(`/manager/room/occupancy-status/${id}`, {
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
                            <Button onClick={() => setIsCreateDialogOpen(true)}>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Status
                            </Button>
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
                                                            <DropdownMenuItem className="text-yellow-600" onClick={() => setEditingStatus(status)}>
                                                                <Edit className="mr-2 h-4 w-4 text-yellow-600" />
                                                                Edit
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem className="text-red-600" onClick={() => setDeleteId(status.id)}>
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

            {/* Create Dialog */}
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <form onSubmit={handleCreate}>
                        <DialogHeader>
                            <DialogTitle>Add New Occupancy Status</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="create-name">Name</Label>
                                <Input
                                    id="create-name"
                                    value={createForm.data.name}
                                    onChange={(e) => createForm.setData('name', e.target.value)}
                                    className={createForm.errors.name ? 'border-red-500' : ''}
                                    placeholder="Enter status name"
                                />
                                {createForm.errors.name && <p className="mt-1 text-sm text-red-500">{createForm.errors.name}</p>}
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={createForm.processing}>
                                {createForm.processing ? 'Creating...' : 'Create'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={!!editingStatus} onOpenChange={() => setEditingStatus(null)}>
                <DialogContent className="sm:max-w-[425px]">
                    <form onSubmit={handleEdit}>
                        <DialogHeader>
                            <DialogTitle>Edit Occupancy Status</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="edit-name">Name</Label>
                                <Input
                                    id="edit-name"
                                    value={editForm.data.name}
                                    onChange={(e) => editForm.setData('name', e.target.value)}
                                    className={editForm.errors.name ? 'border-red-500' : ''}
                                    placeholder="Enter status name"
                                />
                                {editForm.errors.name && <p className="mt-1 text-sm text-red-500">{editForm.errors.name}</p>}
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setEditingStatus(null)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={editForm.processing}>
                                {editForm.processing ? 'Updating...' : 'Update'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>This will permanently delete the occupancy status.</AlertDialogDescription>
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
