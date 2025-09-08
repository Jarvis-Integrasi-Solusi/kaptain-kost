import TenantRentalHistory from '@/components/tenant/tenant-rental-history';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type PageProps } from '@/types';
import { Rental } from '@/types/rental';
import { User } from '@/types/user';
import { Head, router, usePage } from '@inertiajs/react';
import { Edit } from 'lucide-react';

interface TenantShowPageProps extends PageProps {
    tenant: User;
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

export default function ShowTenant() {
    const { tenant, rentals } = usePage<TenantShowPageProps>().props;

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Manager',
        },
        {
            title: 'Users',
        },
        {
            title: 'Tenants',
            href: '/manager/user/tenant',
        },
        {
            title: tenant.name,
            href: `/manager/user/tenant/${tenant.id}`,
        },
    ];

    const handleEdit = () => {
        router.get(`/manager/user/tenant/${tenant.id}/edit`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Tenant Detail - ${tenant.name}`} />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div>
                            <h1 className="text-2xl font-bold">Tenant Detail</h1>
                            <p className="text-muted-foreground">View tenant account information</p>
                        </div>
                    </div>
                    <Button variant="outline" onClick={handleEdit}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Tenant
                    </Button>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Tenant Information */}
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">Tenant Information</CardTitle>
                            <CardDescription>Personal and contact details</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                {/* Basic Information */}
                                <div className="space-y-4">
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium">Full Name</Label>
                                            <Input value={tenant.name} disabled className="bg-muted" />
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium">Email Address</Label>
                                            <Input value={tenant.email} disabled className="bg-muted" />
                                        </div>
                                    </div>

                                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium">Username</Label>
                                            <Input value={tenant.username || '-'} disabled className="bg-muted" />
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium">Telephone</Label>
                                            <Input value={tenant.telephone || '-'} disabled className="bg-muted" />
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium">Gender</Label>
                                            <Input
                                                value={tenant.gender ? tenant.gender.charAt(0).toUpperCase() + tenant.gender.slice(1) : '-'}
                                                disabled
                                                className="bg-muted"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <Separator />

                                {/* Contact Information */}
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium">Address</Label>
                                        <Textarea value={tenant.address || '-'} disabled className="bg-muted" rows={3} />
                                    </div>

                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium">Emergency Contact</Label>
                                            <Input value={tenant.guardian_name || '-'} disabled className="bg-muted" />
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium">Emergency Contact Telephone</Label>
                                            <Input value={tenant.guardian_telephone || '-'} disabled className="bg-muted" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Profile Image & Rental Summary */}
                    <div className="space-y-6">
                        {/* Profile Image Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Profile Image</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex justify-center">
                                    {tenant.image ? (
                                        <img src={tenant.image} alt={`${tenant.name} profile`} className="h-48 w-48 rounded-lg border object-cover" />
                                    ) : (
                                        <div className="flex h-48 w-48 flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted">
                                            <p className="text-sm text-muted-foreground">No image uploaded</p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Tenant Rental History Component */}
                    <TenantRentalHistory rentals={rentals} tenantName={tenant.name} />
                </div>
            </div>
        </AppLayout>
    );
}
