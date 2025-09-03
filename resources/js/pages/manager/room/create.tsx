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
import { formatCurrency } from '@/utils/format';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { Check, ChevronsUpDown, ImageIcon, Save, Upload, X } from 'lucide-react';
import { type ChangeEvent, useState } from 'react';

interface RoomCategory {
    id: number;
    name: string;
    monthly_rental_fee: number;
    deposit_fee: number;
    management_fee: number;
}

interface RoomCreatePageProps extends PageProps {
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

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Manager',
    },
    {
        title: 'Rooms',
        href: '/manager/room',
    },
    {
        title: 'Create',
        href: '/manager/room/create',
    },
];

export default function CreateRoom() {
    const { categories, errors } = usePage<RoomCreatePageProps>().props;
    const [previewImages, setPreviewImages] = useState<PreviewImage[]>([]);
    const [openCategory, setOpenCategory] = useState(false);

    const { data, setData, post, processing, reset } = useForm({
        name: '',
        room_category_id: '',
        description: '',
        images: [] as File[],
    });

    // Find selected category
    const selectedCategory = categories.find((category) => category.id.toString() === data.room_category_id);

    const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);

        if (files.length === 0) return;

        // Check total images limit (current + new)
        const totalImages = previewImages.length + files.length;
        if (totalImages > 10) {
            alert('Maximum 10 images allowed. Please select fewer images.');
            return;
        }

        const validFiles: File[] = [];
        // const newPreviews: PreviewImage[] = [];

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

    const removeImage = (imageId: string) => {
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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Ensure all required fields are filled
        if (!data.name || !data.room_category_id) {
            return;
        }

        post('/manager/room', {
            onSuccess: () => {
                reset();
                setPreviewImages([]);
            },
            onError: (errors) => {
                console.log('Validation errors:', errors);
            },
        });
    };

    const handleCancel = () => {
        router.get('/manager/room');
    };

    

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Room" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Create Room</h1>
                        <p className="text-muted-foreground">Add a new room to your property</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="grid items-start gap-6 lg:grid-cols-3">
                    {/* Room Information Form */}
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle>Room Information</CardTitle>
                            <CardDescription>Enter the room details and specifications</CardDescription>
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
                                        {processing ? 'Creating...' : 'Create'}
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Room Images Card */}
                    <Card className="lg:col-span-1">
                        <CardHeader>
                            <CardTitle>Room Images</CardTitle>
                            <CardDescription>Upload images for this room (Max: 3 images, 2MB each)</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {/* Upload Area */}
                                <div className="space-y-2">
                                    <Label htmlFor="images" className="text-sm font-medium">
                                        Room Images
                                    </Label>
                                    <div className="flex h-32 w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-muted-foreground/25 transition-colors hover:border-muted-foreground/50">
                                        <Upload className="h-6 w-6 text-muted-foreground" />
                                        <div className="text-center text-sm text-muted-foreground">
                                            <label htmlFor="images" className="cursor-pointer font-medium text-primary hover:text-primary/80">
                                                Click to upload images
                                            </label>
                                            <p className="mt-1">PNG, JPG up to 2MB each</p>
                                            {previewImages.length > 0 && (
                                                <p className="mt-1 text-xs text-green-600">{previewImages.length}/3 images selected</p>
                                            )}
                                        </div>
                                    </div>
                                    <input id="images" type="file" multiple accept="image/*" onChange={handleImageChange} className="hidden" />
                                    {errors.images && <p className="text-sm text-red-500">{errors.images}</p>}
                                </div>

                                {/* Image Preview Carousel */}
                                {previewImages.length > 0 && (
                                    
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium">Preview Images</Label>
                                        <div className="relative">
                                            <Carousel className="w-full">
                                                <CarouselContent>
                                                    {previewImages.map((preview) => (
                                                        <CarouselItem key={preview.id}>
                                                            <div className="group relative">
                                                                <img
                                                                    src={preview.url}
                                                                    alt="Room preview"
                                                                    className="h-64 w-full rounded-lg border object-cover"
                                                                />
                                                                <Button
                                                                    type="button"
                                                                    variant="destructive"
                                                                    size="sm"
                                                                    className="absolute top-2 right-2 opacity-0 transition-opacity group-hover:opacity-100"
                                                                    onClick={() => removeImage(preview.id)}
                                                                >
                                                                    <X className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        </CarouselItem>
                                                    ))}
                                                </CarouselContent>

                                                {previewImages.length > 1 && (
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
                                {previewImages.length === 0 && (
                                    <div className="flex h-32 w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-muted-foreground/25">
                                        <ImageIcon className="h-8 w-8 text-muted-foreground/50" />
                                        <p className="text-sm text-muted-foreground/70">No images selected</p>
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
