import RoomRentalHistory from '@/components/room/room-rental-history';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type PageProps } from '@/types';
import { Rental } from '@/types/rental';
import { Room } from '@/types/room';
import { formatCurrency } from '@/utils/format';
import { Head, router, usePage } from '@inertiajs/react';
import { Edit, ImageIcon } from 'lucide-react';
import { useMemo } from 'react';

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

                    {/* Rental History Component */}
                    <RoomRentalHistory rentals={rentals} />
                </div>
            </div>
        </AppLayout>
    );
}
