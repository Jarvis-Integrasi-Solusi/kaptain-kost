import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type PageProps } from '@/types';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { Save, Upload, X } from 'lucide-react';
import { type ChangeEvent, useEffect, useState } from 'react';

interface RoomCategory {
    id: number;
    name: string;
    monthly_rental_fee: number;
    deposit_fee: number;
    management_fee: number;
}

interface Room {
    id: number;
    name: string;
    description: string | null;
    image: string | null;
    room_category_id: number;
    roomCategory: RoomCategory;
}

interface RoomEditPageProps extends PageProps {
    room: Room;
    categories: RoomCategory[];
}

export default function EditRoom() {
    const { room, categories } = usePage<RoomEditPageProps>().props;
    const [previewImage, setPreviewImage] = useState<string | null>(null);

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

    const { data, setData, post, processing, errors } = useForm({
        name: room.name,
        room_category_id: room.room_category_id.toString(),
        description: room.description || '',
        image: null as File | null,
        _method: 'PUT' as const,
    });

    // Set initial preview image if room has existing image
    useEffect(() => {
        if (room.image) {
            setPreviewImage(`/storage/${room.image}`);
        }
    }, [room.image]);

    const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('image', file);

            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        setData('image', null);
        setPreviewImage(null);
        // Reset file input
        const fileInput = document.getElementById('image') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
    };

    const handleSubmit = (e: React.MouseEvent) => {
        e.preventDefault();
        post(`/manager/room/${room.id}`, {
            onSuccess: () => {
                // Redirect will be handled by the controller
            },
        });
    };

    const handleCancel = () => {
        router.get('/manager/room');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit Room - ${room.name}`} />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-4">
                            <div>
                                <CardTitle className="text-xl">Edit Room</CardTitle>
                                <CardDescription>Update room information</CardDescription>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent>
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
                                {/* Left Column - Image */}
                                <div className="space-y-4">
                                    <div>
                                        <Label htmlFor="image">Room Image</Label>
                                        <div className="mt-2">
                                            {previewImage ? (
                                                <div className="relative">
                                                    <img
                                                        src={previewImage}
                                                        alt="Room preview"
                                                        className="h-48 w-full rounded-lg border object-cover"
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="destructive"
                                                        size="sm"
                                                        className="absolute top-2 right-2"
                                                        onClick={removeImage}
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            ) : (
                                                <div className="flex h-48 w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-muted-foreground/25">
                                                    <Upload className="h-8 w-8 text-muted-foreground" />
                                                    <div className="text-center text-sm text-muted-foreground">
                                                        <label
                                                            htmlFor="image"
                                                            className="cursor-pointer font-medium text-primary hover:text-primary/80"
                                                        >
                                                            Click to upload
                                                        </label>
                                                        <p className="mt-1">PNG, JPG, GIF up to 2MB</p>
                                                        {room.image && (
                                                            <p className="mt-1 text-xs text-muted-foreground">
                                                                Current image will be kept if no new image is uploaded
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                            <input id="image" type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                                            {errors.image && <p className="mt-2 text-sm text-destructive">{errors.image}</p>}
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column - Form Fields */}
                                <div className="space-y-4">
                                    {/* Room Name */}
                                    <div>
                                        <Label htmlFor="name">Room Name *</Label>
                                        <Input
                                            id="name"
                                            type="text"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            className="mt-1"
                                            placeholder="Enter room name"
                                        />
                                        {errors.name && <p className="mt-1 text-sm text-destructive">{errors.name}</p>}
                                    </div>

                                    {/* Room Category */}
                                    <div>
                                        <Label htmlFor="room_category_id">Room Category *</Label>
                                        <Select value={data.room_category_id} onValueChange={(value) => setData('room_category_id', value)}>
                                            <SelectTrigger className="mt-1">
                                                <SelectValue placeholder="Select a category" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {categories.map((category) => (
                                                    <SelectItem key={category.id} value={category.id.toString()}>
                                                        {category.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.room_category_id && <p className="mt-1 text-sm text-destructive">{errors.room_category_id}</p>}
                                    </div>

                                    {/* Description */}
                                    <div>
                                        <Label htmlFor="description">Description</Label>
                                        <Textarea
                                            id="description"
                                            value={data.description}
                                            onChange={(e: { target: { value: string } }) => setData('description', e.target.value)}
                                            className="mt-1"
                                            placeholder="Enter room description..."
                                            rows={4}
                                        />
                                        {errors.description && <p className="mt-1 text-sm text-destructive">{errors.description}</p>}
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col gap-3 pt-6 sm:flex-row sm:justify-end">
                                <Button type="button" variant="outline" onClick={handleCancel} disabled={processing} className="sm:w-auto">
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={processing} onClick={handleSubmit} className="sm:w-auto">
                                    <Save className="mr-2 h-4 w-4" />
                                    {processing ? 'Updating...' : 'Update Room'}
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
