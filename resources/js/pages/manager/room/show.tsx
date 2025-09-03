import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type PageProps } from '@/types';
import { Rental } from '@/types/rental';
import { Room } from '@/types/room';
import { formatCurrency } from '@/utils/format';
import { Head, router, usePage } from '@inertiajs/react';
import { ChevronLeft, ChevronRight, Edit, Eye, ImageIcon, Search } from 'lucide-react';
import { useMemo, useState } from 'react';

interface RoomShowPageProps extends PageProps {
    room: Room & {
        room_images?: Array<{
            id: number;
            image: string;
        }>;
    };
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

export default function ShowRoom() {
    const { room, rentals } = usePage<RoomShowPageProps>().props;
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(3);

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Manager',
        },
        {
            title: 'Rooms',
            href: '/manager/room',
        },
        {
            title: room.name,
            href: `/manager/room/${room.id}`,
        },
    ];

    const handleEdit = () => {
        router.get(`/manager/room/${room.id}/edit`);
    };

    // Filter and paginate rental data
    const { paginatedData, totalPages, totalItems } = useMemo(() => {
        // Filter data based on search
        const filtered = rentals.filter((rental) => {
            if (!search.trim()) return true;

            const searchTerm = search.toLowerCase().trim();
            return (
                rental.user?.name?.toLowerCase().includes(searchTerm) ||
                rental.user?.email?.toLowerCase().includes(searchTerm) ||
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

    // Prepare images for display (handle both single image and multiple images)
    const displayImages = useMemo(() => {
        if (room.room_images && room.room_images.length > 0) {
            return room.room_images.map((img) => ({
                id: img.id,
                url: `/storage/${img.image}`,
                alt: `${room.name} - Image ${img.id}`,
            }));
        } else if (room.image) {
            // Fallback to single image if room_images is not available
            return [
                {
                    id: 1,
                    url: `/storage/${room.image}`,
                    alt: room.name,
                },
            ];
        }
        return [];
    }, [room.room_images, room.image, room.name]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Room - ${room.name}`} />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div>
                            <h1 className="text-2xl font-bold">{room.name}</h1>
                            <p className="text-muted-foreground">Room details and information</p>
                        </div>
                    </div>
                    <Button variant="outline" onClick={handleEdit}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Room
                    </Button>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Room Information Form */}
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle>Room Information</CardTitle>
                            <CardDescription>Room details and specifications</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name" className="text-sm font-medium">
                                            Room Name
                                        </Label>
                                        <Input id="name" type="text" value={room.name} disabled className="bg-muted" />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="room_category_id" className="text-sm font-medium">
                                            Room Category
                                        </Label>
                                        <Input
                                            id="room_category_id"
                                            type="text"
                                            value={`${room.room_category.name} - ${formatCurrency(room.room_category.monthly_rental_fee)}/month`}
                                            disabled
                                            className="bg-muted"
                                        />
                                    </div>
                                </div>

                                <Separator />

                                <div className="space-y-2">
                                    <Label htmlFor="description" className="text-sm font-medium">
                                        Description
                                    </Label>
                                    <Textarea id="description" value={room.description || ''} disabled className="bg-muted" rows={8} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Room Images Card */}
                    <Card className="lg:col-span-1">
                        <CardHeader>
                            <CardTitle>Room Images</CardTitle>
                            <CardDescription>
                                {displayImages.length > 0
                                    ? `${displayImages.length} image${displayImages.length > 1 ? 's' : ''}`
                                    : 'No images available'}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {displayImages.length > 0 ? (
                                <div className="relative">
                                    <Carousel className="w-full">
                                        <CarouselContent>
                                            {displayImages.map((image) => (
                                                <CarouselItem key={`room-image-${image.id}`}>
                                                    <div className="relative">
                                                        <img src={image.url} alt={image.alt} className="h-80 w-full rounded-lg border object-cover" />
                                                        {/* Image counter */}
                                                        {displayImages.length > 1 && (
                                                            <div className="absolute right-2 bottom-2">
                                                                <span className="rounded bg-black/70 px-2 py-1 text-xs font-medium text-white">
                                                                    {displayImages.findIndex((img) => img.id === image.id) + 1} /{' '}
                                                                    {displayImages.length}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </CarouselItem>
                                            ))}
                                        </CarouselContent>

                                        {/* Show navigation arrows only if there are multiple images */}
                                        {displayImages.length > 1 && (
                                            <>
                                                <CarouselPrevious className="absolute top-1/2 left-2 -translate-y-1/2" />
                                                <CarouselNext className="absolute top-1/2 right-2 -translate-y-1/2" />
                                            </>
                                        )}
                                    </Carousel>

                                    {/* Image indicators for multiple images */}
                                    {displayImages.length > 1 && (
                                        <div className="flex justify-center space-x-2 pt-3">
                                            {displayImages.map((_, index) => (
                                                <div key={index} className="h-2 w-2 rounded-full bg-muted-foreground/30" />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="flex h-80 w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/10">
                                    <ImageIcon className="h-12 w-12 text-muted-foreground/50" />
                                    <div className="text-center text-sm text-muted-foreground">
                                        <p className="font-medium">No images available</p>
                                        <p>This room doesn't have any images uploaded</p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Rental History Card */}
                    <Card className="lg:col-span-3">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Rental History</CardTitle>
                                    <CardDescription>
                                        All rental history for this room
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
                                            <TableHead>Tenant</TableHead>
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
                                                        : 'No rental records found for this room.'}
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            paginatedData.map((rental) => (
                                                <TableRow key={rental.id}>
                                                    <TableCell>
                                                        <div>
                                                            <div className="font-medium">{rental.user?.name}</div>
                                                            <div className="text-sm text-muted-foreground">{rental.user?.email}</div>
                                                        </div>
                                                    </TableCell>
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
