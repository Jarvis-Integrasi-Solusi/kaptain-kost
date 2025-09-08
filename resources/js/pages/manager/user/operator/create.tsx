import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { type BreadcrumbItem, type PageProps } from '@/types';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { Save, User, X } from 'lucide-react';
import { type ChangeEvent, useState } from 'react';

interface OperatorCreatePageProps extends PageProps {
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

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Manager',
    },
    {
        title: 'Users',
    },
    {
        title: 'Operators',
        href: '/manager/user/operator',
    },
    {
        title: 'Create',
        href: '/manager/user/operator/create',
    },
];

export default function CreateOperator() {
    const { errors } = usePage<OperatorCreatePageProps>().props;
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    const { data, setData, post, processing, reset } = useForm({
        name: '',
        email: '',
        username: '',
        telephone: '',
        gender: '',
        address: '',
        password: '',
        password_confirmation: '',
        image: null as File | null,
    });

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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Ensure all required fields are filled
        if (!data.name || !data.email || !data.password) {
            return;
        }

        post('/manager/user/operator', {
            onSuccess: () => {
                reset();
                setPreviewImage(null);
            },
            onError: (errors) => {
                console.log('Validation errors:', errors);
            },
        });
    };

    const handleCancel = () => {
        router.get('/manager/user/operator');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Operator" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Create Operator</h1>
                        <p className="text-muted-foreground">Add a new operator account</p>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-3 lg:items-start">
                    {/* Operator Information Form */}
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle>Operator Information</CardTitle>
                            <CardDescription>Enter the operator account details</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                {/* Basic Information */}
                                <div className="space-y-4">
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="name" className="text-sm font-medium">
                                                Full Name *
                                            </Label>
                                            <Input
                                                id="name"
                                                type="text"
                                                value={data.name}
                                                onChange={(e) => setData('name', e.target.value)}
                                                className={cn(errors.name && 'border-red-500')}
                                                placeholder="Enter full name"
                                            />
                                            {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="email" className="text-sm font-medium">
                                                Email Address *
                                            </Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                value={data.email}
                                                onChange={(e) => setData('email', e.target.value)}
                                                className={cn(errors.email && 'border-red-500')}
                                                placeholder="Enter email address"
                                            />
                                            {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                                        </div>
                                    </div>

                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="username" className="text-sm font-medium">
                                                Username
                                            </Label>
                                            <Input
                                                id="username"
                                                type="text"
                                                value={data.username}
                                                onChange={(e) => setData('username', e.target.value)}
                                                className={cn(errors.username && 'border-red-500')}
                                                placeholder="Enter username"
                                            />
                                            {errors.username && <p className="text-sm text-red-500">{errors.username}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="telephone" className="text-sm font-medium">
                                                Telephone
                                            </Label>
                                            <Input
                                                id="telephone"
                                                inputMode="numeric"
                                                type="number"
                                                value={data.telephone}
                                                onChange={(e) => setData('telephone', e.target.value)}
                                                className={cn(errors.telephone && 'border-red-500')}
                                                placeholder="Enter telephone number"
                                            />
                                            {errors.telephone && <p className="text-sm text-red-500">{errors.telephone}</p>}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="gender" className="text-sm font-medium">
                                            Gender
                                        </Label>
                                        <Select value={data.gender} onValueChange={(value) => setData('gender', value)}>
                                            <SelectTrigger className={cn(errors.gender && 'border-red-500')}>
                                                <SelectValue placeholder="Select gender" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="male">Male</SelectItem>
                                                <SelectItem value="female">Female</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {errors.gender && <p className="text-sm text-red-500">{errors.gender}</p>}
                                    </div>
                                </div>

                                {/* Account Security */}
                                <div className="space-y-4">
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="password" className="text-sm font-medium">
                                                Password *
                                            </Label>
                                            <Input
                                                id="password"
                                                type="password"
                                                value={data.password}
                                                onChange={(e) => setData('password', e.target.value)}
                                                className={cn(errors.password && 'border-red-500')}
                                                placeholder="Enter password"
                                            />
                                            {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="password_confirmation" className="text-sm font-medium">
                                                Confirm Password *
                                            </Label>
                                            <Input
                                                id="password_confirmation"
                                                type="password"
                                                value={data.password_confirmation}
                                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                                className={cn(errors.password_confirmation && 'border-red-500')}
                                                placeholder="Confirm password"
                                            />
                                            {errors.password_confirmation && <p className="text-sm text-red-500">{errors.password_confirmation}</p>}
                                        </div>
                                    </div>
                                </div>

                                <Separator />

                                {/* Contact Information */}
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="address" className="text-sm font-medium">
                                            Address
                                        </Label>
                                        <Textarea
                                            id="address"
                                            value={data.address}
                                            onChange={(e) => setData('address', e.target.value)}
                                            className={cn(errors.address && 'border-red-500')}
                                            placeholder="Enter address..."
                                            rows={3}
                                        />
                                        {errors.address && <p className="text-sm text-red-500">{errors.address}</p>}
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex flex-col gap-3 pt-6 sm:flex-row sm:justify-end">
                                    <Button type="button" variant="outline" onClick={handleCancel} disabled={processing} className="sm:w-auto">
                                        Cancel
                                    </Button>
                                    <Button onClick={handleSubmit} disabled={processing} className="sm:w-auto">
                                        <Save className="mr-2 h-4 w-4" />
                                        {processing ? 'Creating...' : 'Create Operator'}
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Profile Image Card */}
                    <Card className="self-start lg:col-span-1">
                        <CardHeader>
                            <CardTitle>Profile Image</CardTitle>
                            <CardDescription>Upload a profile image for the operator</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {previewImage ? (
                                    <div className="relative">
                                        <img src={previewImage} alt="Profile preview" className="h-48 w-full rounded-lg border object-cover" />
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
                                        <User className="h-8 w-8 text-muted-foreground" />
                                        <div className="text-center text-sm text-muted-foreground">
                                            <label htmlFor="image" className="cursor-pointer font-medium text-primary hover:text-primary/80">
                                                Click to upload
                                            </label>
                                            <p className="mt-1">PNG, JPG, GIF up to 2MB</p>
                                        </div>
                                    </div>
                                )}
                                <input id="image" type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                                {errors.image && <p className="text-sm text-red-500">{errors.image}</p>}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
