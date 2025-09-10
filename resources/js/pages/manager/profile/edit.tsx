import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { User, type BreadcrumbItem, type PageProps } from '@/types';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { Save, Upload, X } from 'lucide-react';
import { useEffect, useState, type ChangeEvent } from 'react';

interface ManagerProfileEditPageProps extends PageProps {
    user: User;
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

export default function EditManagerProfile() {
    const { user, errors } = usePage<ManagerProfileEditPageProps>().props;
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Dashboard',
            href: '/manager/dashboard',
        },
        {
            title: 'Profile',
        },
        {
            title: 'Edit Profile',
        },
    ];

    const { data, setData, post, processing } = useForm({
        name: user.name,
        email: user.email,
        username: user.username || '',
        telephone: user.telephone || '',
        gender: user.gender || '',
        address: user.address || '',
        guardian_name: user.guardian_name || '',
        guardian_telephone: user.guardian_telephone || '',
        image: null as File | null,
        remove_image: false,
        _method: 'PUT' as const,
    });

    // Set initial preview image if user has existing image
    useEffect(() => {
        if (user.image) {
            setPreviewImage(`/storage/${user.image}`);
        }
    }, [user.image]);

    const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file size (2MB)
            if (file.size > 2 * 1024 * 1024) {
                alert('The image may not be greater than 2MB.');
                e.target.value = '';
                return;
            }

            // Validate file type
            if (!file.type.startsWith('image/')) {
                alert('Please select a valid image file.');
                e.target.value = '';
                return;
            }

            setData((prev) => ({
                ...prev,
                image: file,
                remove_image: false, // Reset remove flag when new image selected
            }));

            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        setData((prev) => ({
            ...prev,
            image: null,
            remove_image: true, // Set to true when removing
        }));
        setPreviewImage(null);

        // Reset file input
        const fileInput = document.getElementById('image') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Ensure all required fields are filled
        if (!data.name || !data.email) {
            return;
        }

        // Debug log
        console.log('Submitting manager profile with data:', {
            ...data,
            image: data.image ? 'File object' : null,
            remove_image: data.remove_image,
        });

        // Inertia.js handles FormData automatically for file uploads
        post('/manager/profile', {
            forceFormData: true, // This tells Inertia to use FormData
            onSuccess: () => {
                console.log('Manager profile updated successfully');
            },
            onError: (errors) => {
                console.log('Validation errors:', errors);
            },
        });
    };

    const handleCancel = () => {
        router.get('/manager/dashboard');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Profile" />

            <div className="flex h-full flex-1 flex-col gap-4 p-3 md:gap-6 md:p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold md:text-2xl">Edit Profile</h1>
                        <p className="text-sm text-muted-foreground md:text-base">Update your personal information and details</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="grid gap-4 md:gap-6 lg:grid-cols-3 lg:items-start">
                    {/* Profile Information Form */}
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle className="text-sm md:text-base">Personal Information</CardTitle>
                            <CardDescription className="text-xs md:text-sm">Update your personal details and contact information</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4 md:space-y-6">
                                {/* Personal Information */}
                                <div className="space-y-3 md:space-y-4">
                                    <div className="grid gap-3 sm:grid-cols-2 md:gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="name" className="text-xs font-medium md:text-sm">
                                                Full Name *
                                            </Label>
                                            <Input
                                                id="name"
                                                type="text"
                                                value={data.name}
                                                onChange={(e) => setData('name', e.target.value)}
                                                className={cn(errors.name && 'border-red-500', 'text-xs md:text-sm')}
                                                placeholder="Enter your full name"
                                            />
                                            {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="email" className="text-xs font-medium md:text-sm">
                                                Email Address *
                                            </Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                value={data.email}
                                                onChange={(e) => setData('email', e.target.value)}
                                                className={cn(errors.email && 'border-red-500', 'text-xs md:text-sm')}
                                                placeholder="Enter your email address"
                                            />
                                            {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
                                        </div>
                                    </div>

                                    <div className="grid gap-3 sm:grid-cols-2 md:gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="username" className="text-xs font-medium md:text-sm">
                                                Username
                                            </Label>
                                            <Input
                                                id="username"
                                                type="text"
                                                value={data.username}
                                                onChange={(e) => setData('username', e.target.value)}
                                                className={cn(errors.username && 'border-red-500', 'text-xs md:text-sm')}
                                                placeholder="Enter your username"
                                            />
                                            {errors.username && <p className="text-xs text-red-500">{errors.username}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="telephone" className="text-xs font-medium md:text-sm">
                                                Phone Number
                                            </Label>
                                            <Input
                                                id="telephone"
                                                inputMode="numeric"
                                                type="tel"
                                                value={data.telephone}
                                                onChange={(e) => setData('telephone', e.target.value)}
                                                className={cn(errors.telephone && 'border-red-500', 'text-xs md:text-sm')}
                                                placeholder="Enter your phone number"
                                            />
                                            {errors.telephone && <p className="text-xs text-red-500">{errors.telephone}</p>}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="gender" className="text-xs font-medium md:text-sm">
                                            Gender
                                        </Label>
                                        <Select value={data.gender} onValueChange={(value) => setData('gender', value)}>
                                            <SelectTrigger className={cn(errors.gender && 'border-red-500', 'text-xs md:text-sm')}>
                                                <SelectValue placeholder="Select your gender" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="male" className="text-xs md:text-sm">
                                                    Male
                                                </SelectItem>
                                                <SelectItem value="female" className="text-xs md:text-sm">
                                                    Female
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {errors.gender && <p className="text-xs text-red-500">{errors.gender}</p>}
                                    </div>
                                </div>

                                {/* Contact Information */}
                                <div className="space-y-3 md:space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="address" className="text-xs font-medium md:text-sm">
                                            Address
                                        </Label>
                                        <Textarea
                                            id="address"
                                            value={data.address}
                                            onChange={(e) => setData('address', e.target.value)}
                                            className={cn(errors.address && 'border-red-500', 'text-xs md:text-sm')}
                                            placeholder="Enter your address..."
                                            rows={3}
                                        />
                                        {errors.address && <p className="text-xs text-red-500">{errors.address}</p>}
                                    </div>

                                    <div className="grid gap-3 sm:grid-cols-2 md:gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="guardian_name" className="text-xs font-medium md:text-sm">
                                                Emergency Contact
                                            </Label>
                                            <Input
                                                id="guardian_name"
                                                type="text"
                                                value={data.guardian_name}
                                                onChange={(e) => setData('guardian_name', e.target.value)}
                                                className={cn(errors.guardian_name && 'border-red-500', 'text-xs md:text-sm')}
                                                placeholder="Enter emergency contact name"
                                            />
                                            {errors.guardian_name && <p className="text-xs text-red-500">{errors.guardian_name}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="guardian_telephone" className="text-xs font-medium md:text-sm">
                                                Emergency Contact Phone
                                            </Label>
                                            <Input
                                                id="guardian_telephone"
                                                inputMode="numeric"
                                                type="tel"
                                                value={data.guardian_telephone}
                                                onChange={(e) => setData('guardian_telephone', e.target.value)}
                                                className={cn(errors.guardian_telephone && 'border-red-500', 'text-xs md:text-sm')}
                                                placeholder="Enter emergency contact phone"
                                            />
                                            {errors.guardian_telephone && <p className="text-xs text-red-500">{errors.guardian_telephone}</p>}
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex flex-col gap-2 pt-4 sm:flex-row sm:justify-end md:gap-3 md:pt-6">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={handleCancel}
                                        disabled={processing}
                                        className="text-xs sm:w-auto md:text-sm"
                                    >
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={processing} className="text-xs sm:w-auto md:text-sm">
                                        <Save className="mr-2 h-3 w-3 md:h-4 md:w-4" />
                                        {processing ? 'Updating...' : 'Update Profile'}
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Profile Image Card */}
                    <Card className="self-start lg:col-span-1">
                        <CardHeader>
                            <CardTitle className="text-sm md:text-base">Profile Picture</CardTitle>
                            <CardDescription className="text-xs md:text-sm">Upload a profile picture</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {previewImage && !data.remove_image ? (
                                    <div className="relative">
                                        <img
                                            src={previewImage}
                                            alt="Profile preview"
                                            className="h-40 w-full rounded-lg border object-cover md:h-72"
                                        />
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            size="sm"
                                            className="absolute top-2 right-2"
                                            onClick={removeImage}
                                        >
                                            <X className="h-3 w-3 md:h-4 md:w-4" />
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="flex h-40 w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-muted-foreground/25 md:h-48">
                                        <Upload className="h-6 w-6 text-muted-foreground md:h-8 md:w-8" />
                                        <div className="text-center text-xs text-muted-foreground md:text-sm">
                                            <label htmlFor="image" className="cursor-pointer font-medium text-primary hover:text-primary/80">
                                                Click to upload
                                            </label>
                                            <p className="mt-1">PNG, JPG up to 2MB</p>
                                            {data.remove_image ? (
                                                <p className="mt-1 text-[10px] text-orange-600 md:text-xs">
                                                    Current image will be removed upon saving
                                                </p>
                                            ) : (
                                                user.image && (
                                                    <p className="mt-1 text-[10px] text-muted-foreground md:text-xs">
                                                        Current image will be kept if no new image is uploaded
                                                    </p>
                                                )
                                            )}
                                        </div>
                                    </div>
                                )}
                                <input id="image" type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                                {errors.image && <p className="text-xs text-red-500">{errors.image}</p>}
                            </div>
                        </CardContent>
                    </Card>
                </form>
            </div>
        </AppLayout>
    );
}
