import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { type BreadcrumbItem, type PageProps } from '@/types';
import { Room } from '@/types/room';
import { RoomCategory } from '@/types/room-category';
import { formatCurrency } from '@/utils/format';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { Check, ChevronsUpDown, ImageIcon, Save, Upload, X } from 'lucide-react';
import { type ChangeEvent, useEffect, useState } from 'react';

interface RoomEditPageProps extends PageProps {
    room: Room & {
        room_images?: Array<{
            id: number;
            image: string;
        }>;
    };
    categories: RoomCategory[];
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
    errors: Record<string, string>;
}

interface PreviewImage {
    file: File;
    url: string;
    id: string;
}

interface ExistingImage {
    id: number;
    url: string;
}

export default function EditRoom() {
    const { room, categories, errors } = usePage<RoomEditPageProps>().props;
    const [previewImages, setPreviewImages] = useState<PreviewImage[]>([]);
    const [existingImages, setExistingImages] = useState<ExistingImage[]>([]);
    const [openCategory, setOpenCategory] = useState(false);

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Manager',
        },
        {
            title: 'Rooms',
            href: '/manager/room',
        },
        {
            title: 'Edit Room',
        },
    ];

    const { data, setData, post, processing } = useForm({
        name: room.name,
        room_category_id: room.room_category_id.toString(),
        description: room.description || '',
        images: [] as File[],
        deleted_images: [] as number[],
        _method: 'PUT' as const,
    });

    // Initialize existing images
    useEffect(() => {
        if (room.room_images && room.room_images.length > 0) {
            setExistingImages(
                room.room_images.map((img) => ({
                    id: img.id,
                    url: `${window.location.origin}/storage/${img.image}`,
                })),
            );
        }
    }, [room.room_images]);

    // Find selected category
    const selectedCategory = categories.find((category) => category.id.toString() === data.room_category_id);

    const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);

        if (files.length === 0) return;

        // Count current images (existing + new previews + new files)
        const totalImages = existingImages.length + previewImages.length + files.length;

        if (totalImages > 3) {
            alert('Maximum 3 images allowed. Please select fewer images.');
            return;
        }

        const validFiles: File[] = [];

        files.forEach((file) => {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                alert(`${file.name} is not a valid image file.`);
                return;
            }

            // Validate file size (2MB)
            if (file.size > 2 * 1024 * 1024) {
                alert(`${file.name} is too large. Maximum file size is 2MB.`);
                return;
            }

            validFiles.push(file);

            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                const preview: PreviewImage = {
                    file,
                    url: reader.result as string,
                    id: `${Date.now()}-${Math.random()}`,
                };

                setPreviewImages((prev) => [...prev, preview]);
            };
            reader.readAsDataURL(file);
        });

        if (validFiles.length > 0) {
            setData('images', [...data.images, ...validFiles]);
        }

        // Reset input
        e.target.value = '';
    };

    const removeNewImage = (imageId: string) => {
        const imageToRemove = previewImages.find((img) => img.id === imageId);
        if (!imageToRemove) return;

        // Remove from preview
        setPreviewImages((prev) => prev.filter((img) => img.id !== imageId));

        // Remove from form data
        setData(
            'images',
            data.images.filter((file) => file !== imageToRemove.file),
        );
    };

    const deleteExistingImage = (imageId: number) => {
        // Remove from existing images display
        setExistingImages((prev) => prev.filter((img) => img.id !== imageId));

        // Add to deleted_images list for backend
        setData('deleted_images', [...data.deleted_images, imageId]);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Ensure all required fields are filled
        if (!data.name || !data.room_category_id) {
            return;
        }

        post(`/manager/room/${room.id}`, {
            onSuccess: () => {
                // Redirect will be handled by the controller
            },
            onError: (errors) => {
                console.log('Validation errors:', errors);
            },
        });
    };

    const handleCancel = () => {
        router.get('/manager/room');
    };

    // Calculate total current images for display
    const totalCurrentImages = existingImages.length + previewImages.length;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit Room - ${room.name}`} />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Edit Room</h1>
                        <p className="text-muted-foreground">Update room information and specifications</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="grid items-start gap-6 lg:grid-cols-3">
                    {/* Room Information Form */}
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle>Room Information</CardTitle>
                            <CardDescription>Update the room details and specifications</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                <div className="space-y-4">
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="name" className="text-sm font-medium">
                                                Room Name *
                                            </Label>
                                            <Input
                                                id="name"
                                                type="text"
                                                value={data.name}
                                                onChange={(e) => setData('name', e.target.value)}
                                                className={cn(errors.name && 'border-red-500')}
                                                placeholder="Enter room name"
                                            />
                                            {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="room_category_id" className="text-sm font-medium">
                                                Room Category *
                                            </Label>
                                            <Popover open={openCategory} onOpenChange={setOpenCategory}>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        role="combobox"
                                                        aria-expanded={openCategory}
                                                        className={cn('w-full justify-between', errors.room_category_id && 'border-red-500')}
                                                    >
                                                        {selectedCategory ? (
                                                            <div className="flex flex-col items-start">
                                                                <span className="font-medium">{selectedCategory.name}</span>
                                                                <span className="text-xs text-muted-foreground">
                                                                    {formatCurrency(selectedCategory.monthly_rental_fee)}/month
                                                                </span>
                                                            </div>
                                                        ) : (
                                                            'Select category...'
                                                        )}
                                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-[400px] p-0" align="start">
                                                    <Command>
                                                        <CommandInput placeholder="Search categories..." />
                                                        <CommandList>
                                                            <CommandEmpty>No category found.</CommandEmpty>
                                                            <CommandGroup>
                                                                {categories.map((category) => (
                                                                    <CommandItem
                                                                        key={category.id}
                                                                        value={`${category.name}`}
                                                                        onSelect={() => {
                                                                            setData('room_category_id', category.id.toString());
                                                                            setOpenCategory(false);
                                                                        }}
                                                                    >
                                                                        <Check
                                                                            className={cn(
                                                                                'mr-2 h-4 w-4',
                                                                                data.room_category_id === category.id.toString()
                                                                                    ? 'opacity-100'
                                                                                    : 'opacity-0',
                                                                            )}
                                                                        />
                                                                        <div className="flex flex-col">
                                                                            <span className="font-medium">{category.name}</span>
                                                                            <span className="text-sm text-muted-foreground">
                                                                                {formatCurrency(category.monthly_rental_fee)}/month
                                                                            </span>
                                                                        </div>
                                                                    </CommandItem>
                                                                ))}
                                                            </CommandGroup>
                                                        </CommandList>
                                                    </Command>
                                                </PopoverContent>
                                            </Popover>
                                            {errors.room_category_id && <p className="text-sm text-red-500">{errors.room_category_id}</p>}
                                        </div>
                                    </div>
                                </div>

                                <Separator />

                                {/* Room Details */}
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="description" className="text-sm font-medium">
                                            Description
                                        </Label>
                                        <Textarea
                                            id="description"
                                            value={data.description}
                                            onChange={(e) => setData('description', e.target.value)}
                                            className={cn(errors.description && 'border-red-500')}
                                            placeholder="Enter room description..."
                                            rows={4}
                                        />
                                        {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex flex-col gap-3 pt-6 sm:flex-row sm:justify-end">
                                    <Button type="button" variant="outline" onClick={handleCancel} disabled={processing} className="sm:w-auto">
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={processing} className="sm:w-auto">
                                        <Save className="mr-2 h-4 w-4" />
                                        {processing ? 'Updating...' : 'Update Room'}
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Room Images Card */}
                    <Card className="lg:col-span-1">
                        <CardHeader>
                            <CardTitle>Room Images</CardTitle>
                            <CardDescription>Manage images for this room (Max: 3 images, 2MB each)</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {/* Upload Area */}
                                <div className="space-y-2">
                                    <Label htmlFor="images" className="text-sm font-medium">
                                        Add New Images
                                    </Label>
                                    <div className="flex h-32 w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-muted-foreground/25 transition-colors hover:border-muted-foreground/50">
                                        <Upload className="h-6 w-6 text-muted-foreground" />
                                        <div className="text-center text-sm text-muted-foreground">
                                            <label htmlFor="images" className="cursor-pointer font-medium text-primary hover:text-primary/80">
                                                Click to upload images
                                            </label>
                                            <p className="mt-1">PNG, JPG up to 2MB each</p>
                                            <p className="mt-1 text-xs text-green-600">{totalCurrentImages}/3 images</p>
                                        </div>
                                    </div>
                                    <input id="images" type="file" multiple accept="image/*" onChange={handleImageChange} className="hidden" />
                                    {errors.images && <p className="text-sm text-red-500">{errors.images}</p>}
                                </div>

                                {/* Current Images Section */}
                                {(existingImages.length > 0 || previewImages.length > 0) && (
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium">Current Images</Label>
                                        <div className="relative">
                                            <Carousel className="w-full">
                                                <CarouselContent>
                                                    {/* Existing Images */}
                                                    {existingImages.map((existing) => (
                                                        <CarouselItem key={`existing-${existing.id}`}>
                                                            <div className="group relative">
                                                                <img
                                                                    src={existing.url}
                                                                    alt="Room image"
                                                                    className="h-64 w-full rounded-lg border object-cover"
                                                                />
                                                                <Button
                                                                    type="button"
                                                                    variant="destructive"
                                                                    size="sm"
                                                                    className="absolute top-2 right-2 opacity-0 transition-opacity group-hover:opacity-100"
                                                                    onClick={() => deleteExistingImage(existing.id)}
                                                                >
                                                                    <X className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        </CarouselItem>
                                                    ))}

                                                    {/* New Preview Images */}
                                                    {previewImages.map((preview) => (
                                                        <CarouselItem key={`preview-${preview.id}`}>
                                                            <div className="group relative">
                                                                <img
                                                                    src={preview.url}
                                                                    alt="New room image"
                                                                    className="h-64 w-full rounded-lg border object-cover"
                                                                />
                                                                <Button
                                                                    type="button"
                                                                    variant="destructive"
                                                                    size="sm"
                                                                    className="absolute top-2 right-2 opacity-0 transition-opacity group-hover:opacity-100"
                                                                    onClick={() => removeNewImage(preview.id)}
                                                                >
                                                                    <X className="h-4 w-4" />
                                                                </Button>
                                                                <div className="absolute bottom-2 left-2">
                                                                    <span className="rounded bg-green-500 px-2 py-1 text-xs font-medium text-white">
                                                                        New
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </CarouselItem>
                                                    ))}
                                                </CarouselContent>

                                                {existingImages.length + previewImages.length > 1 && (
                                                    <>
                                                        <CarouselPrevious type="button" className="absolute top-1/2 left-2 -translate-y-1/2" />
                                                        <CarouselNext type="button" className="absolute top-1/2 right-2 -translate-y-1/2" />
                                                    </>
                                                )}
                                            </Carousel>
                                        </div>
                                    </div>
                                )}

                                {/* Empty State when no images */}
                                {existingImages.length === 0 && previewImages.length === 0 && (
                                    <div className="flex h-32 w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-muted-foreground/25">
                                        <ImageIcon className="h-8 w-8 text-muted-foreground/50" />
                                        <p className="text-sm text-muted-foreground/70">No images available</p>
                                    </div>
                                )}

                                {/* Deletion Summary */}
                                {data.deleted_images.length > 0 && (
                                    <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3 text-sm">
                                        <p className="font-medium text-yellow-800">Pending Deletions:</p>
                                        <p className="text-yellow-700">
                                            {data.deleted_images.length} image(s) will be permanently removed when you save changes
                                        </p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </form>
            </div>
        </AppLayout>
    );
}
