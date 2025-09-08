import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type PageProps } from '@/types';
import { formatCurrency } from '@/utils/format';
import { Head, router, usePage } from '@inertiajs/react';
import { Edit } from 'lucide-react';
import { RoomCategory } from '@/types/room-category';

interface RoomCategoryShowPageProps extends PageProps {
    category: RoomCategory;
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

export default function ShowRoomCategory() {
    const { category } = usePage<RoomCategoryShowPageProps>().props;

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Manager',
        },
        {
            title: 'Rooms',
        },
        {
            title: 'Category',
            href: '/manager/room/category',
        },
        {
            title: category.name,
            href: `/manager/room/category/${category.id}`,
        },
    ];

    // Calculate totals
    const calculateTotal = () => {
        const monthly = category.monthly_rental_fee || 0;
        const deposit = category.deposit_fee || 0;
        const management = category.management_fee || 0;

        return {
            monthlyTotal: monthly + management,
            initialTotal: deposit + monthly + management,
        };
    };

    const totals = calculateTotal();

    const handleEdit = () => {
        router.get(`/manager/room/category/${category.id}/edit`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Category - ${category.name}`} />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div>
                            <h1 className="text-2xl font-bold">{category.name}</h1>
                            <p className="text-muted-foreground">Room category details and pricing</p>
                        </div>
                    </div>
                    <Button variant="outline" onClick={handleEdit}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Category
                    </Button>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Main Form */}
                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Category Information</CardTitle>
                                <CardDescription>Room category details and pricing information</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-6">
                                    {/* Category Name */}
                                    <div className="space-y-2">
                                        <Label htmlFor="name" className="text-sm font-medium">
                                            Category Name
                                        </Label>
                                        <Input id="name" value={category.name} disabled className="bg-muted" />
                                    </div>

                                    <Separator />

                                    {/* Pricing Section */}
                                    <div className="space-y-4">
                                        <div>
                                            <h3 className="text-lg font-medium">Pricing Details</h3>
                                            <p className="text-sm text-muted-foreground">Fees for this room category</p>
                                        </div>

                                        <div className="grid gap-4 sm:grid-cols-2">
                                            <div className="space-y-2">
                                                <Label htmlFor="monthly_rental_fee" className="text-sm font-medium">
                                                    Monthly Rental Fee
                                                </Label>
                                                <Input
                                                    id="monthly_rental_fee"
                                                    value={formatCurrency(category.monthly_rental_fee, { showSymbol: false })}
                                                    disabled
                                                    className="bg-muted"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="deposit_fee" className="text-sm font-medium">
                                                    Deposit Fee
                                                </Label>
                                                <Input
                                                    id="deposit_fee"
                                                    value={formatCurrency(category.deposit_fee, { showSymbol: false })}
                                                    disabled
                                                    className="bg-muted"
                                                />
                                            </div>

                                            <div className="space-y-2 sm:col-span-2">
                                                <Label htmlFor="management_fee" className="text-sm font-medium">
                                                    Management Fee
                                                </Label>
                                                <Input
                                                    id="management_fee"
                                                    value={formatCurrency(category.management_fee, { showSymbol: false })}
                                                    disabled
                                                    className="bg-muted"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Summary Sidebar */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Cost Summary</CardTitle>
                                <CardDescription>Pricing breakdown overview</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Monthly Rental</span>
                                        <span className="font-medium">{formatCurrency(category.monthly_rental_fee)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Management Fee</span>
                                        <span className="font-medium">{formatCurrency(category.management_fee)}</span>
                                    </div>

                                    <Separator />

                                    <div className="flex justify-between text-sm font-medium">
                                        <span>Monthly Total</span>
                                        <span className="text-sm">{formatCurrency(totals.monthlyTotal)}</span>
                                    </div>

                                    <Separator />

                                    <div className="space-y-2 rounded-lg bg-blue-50 p-3 dark:bg-blue-950/30">
                                        <div className="flex justify-between text-sm">
                                            <span className="font-medium">Deposit Fee</span>
                                            <span className="font-medium">{formatCurrency(category.deposit_fee)}</span>
                                        </div>
                                        <div className="flex justify-between font-medium text-blue-800 dark:text-blue-300">
                                            <span>Total Price</span>
                                            <span className="text-lg">{formatCurrency(totals.initialTotal)}</span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
