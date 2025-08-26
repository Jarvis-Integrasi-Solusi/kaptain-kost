import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type PageProps } from '@/types';
import { cleanCurrencyInput, formatCurrency, parseCurrency } from '@/utils/format';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';
import { useState } from 'react';

interface CreateRoomCategoryPageProps extends PageProps {
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

interface FormData {
    name: string;
    monthly_rental_fee: string;
    deposit_fee: string;
    management_fee: string;
    water_bill_fee: string;
    electricity_bill_fee: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Manager',
    },
    {
        title: 'Rooms',
    },
    {
        title: 'Category',
        href: '/manager/room-category',
    },
    {
        title: 'Create',
        href: '/manager/room-category/create',
    },
];

export default function CreateRoomCategory() {
    const { errors } = usePage<CreateRoomCategoryPageProps>().props;

    const { data, setData, post, processing, reset } = useForm<FormData>({
        name: '',
        monthly_rental_fee: '',
        deposit_fee: '',
        management_fee: '',
        water_bill_fee: '',
        electricity_bill_fee: '',
    });

    // State for formatted display values
    const [displayValues, setDisplayValues] = useState({
        monthly_rental_fee: '',
        deposit_fee: '',
        management_fee: '',
        water_bill_fee: '',
        electricity_bill_fee: '',
    });

    // Calculate totals
    const calculateTotal = () => {
        const monthly = parseFloat(data.monthly_rental_fee) || 0;
        const deposit = parseFloat(data.deposit_fee) || 0;
        const management = parseFloat(data.management_fee) || 0;
        const water = parseFloat(data.water_bill_fee) || 0;
        const electricity = parseFloat(data.electricity_bill_fee) || 0;

        return {
            monthlyTotal: monthly + management + water + electricity,
            initialTotal: deposit + monthly + management + water + electricity,
        };
    };

    const totals = calculateTotal();

    // Handle currency input formatting
    const handleCurrencyChange = (field: keyof typeof displayValues, value: string) => {
        // Clean input - allow only numbers and decimal separators
        const cleanValue = cleanCurrencyInput(value);

        // Parse to number
        const numericValue = parseCurrency(cleanValue);

        // Update form data with numeric string
        setData(field, numericValue.toString());

        // Update display value with formatting
        setDisplayValues((prev) => ({
            ...prev,
            [field]: numericValue > 0 ? formatCurrency(numericValue, { showSymbol: false }) : '',
        }));
    };

    // // Initialize display values when component mounts or data changes
    // useEffect(() => {
    //     const newDisplayValues = {} as typeof displayValues;
    //     Object.keys(displayValues).forEach((key) => {
    //         const fieldKey = key as keyof typeof displayValues;
    //         const value = parseFloat(data[fieldKey]) || 0;
    //         newDisplayValues[fieldKey] = value > 0 ? formatCurrency(value, { showSymbol: false }) : '';
    //     });
    //     setDisplayValues(newDisplayValues);
    // }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        console.log('Submitting form with data:', data);

        post('/manager/room-category', {
            onSuccess: (page) => {
                console.log('Form submitted successfully, page props:', page.props);
                // Reset both form data and display values
                reset();
            },
            onError: (errors) => {
                console.log('Form submission errors:', errors);
            },
        });
    };

    const handleCancel = () => {
        router.get('/manager/room-category');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Room Category" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Create Room Category</h1>
                        <p className="text-muted-foreground">Add a new room category with pricing details</p>
                    </div>
                    <Button variant="outline" asChild>
                        <Link href="/manager/room-category">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Categories
                        </Link>
                    </Button>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Main Form */}
                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Category Information</CardTitle>
                                <CardDescription>Enter the basic information and pricing for this room category</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {/* Category Name */}
                                    <div className="space-y-2">
                                        <Label htmlFor="name" className="text-sm font-medium">
                                            Category Name *
                                        </Label>
                                        <Input
                                            id="name"
                                            placeholder="e.g Floor A Room"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            className={errors.name ? 'border-red-500' : ''}
                                        />
                                        {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                                    </div>

                                    <Separator />

                                    {/* Pricing Section */}
                                    <div className="space-y-4">
                                        <div>
                                            <h3 className="text-lg font-medium">Pricing Details</h3>
                                            <p className="text-sm text-muted-foreground">Set the fees for this room category</p>
                                        </div>

                                        <div className="grid gap-4 sm:grid-cols-2">
                                            <div className="space-y-2">
                                                <Label htmlFor="monthly_rental_fee" className="text-sm font-medium">
                                                    Monthly Rental Fee *
                                                </Label>
                                                <Input
                                                    id="monthly_rental_fee"
                                                    placeholder="0.00"
                                                    value={displayValues.monthly_rental_fee}
                                                    onChange={(e) => handleCurrencyChange('monthly_rental_fee', e.target.value)}
                                                    className={errors.monthly_rental_fee ? 'border-red-500' : ''}
                                                />
                                                {errors.monthly_rental_fee && <p className="text-sm text-red-500">{errors.monthly_rental_fee}</p>}
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="deposit_fee" className="text-sm font-medium">
                                                    Deposit Fee *
                                                </Label>
                                                <Input
                                                    id="deposit_fee"
                                                    placeholder="0.00"
                                                    value={displayValues.deposit_fee}
                                                    onChange={(e) => handleCurrencyChange('deposit_fee', e.target.value)}
                                                    className={errors.deposit_fee ? 'border-red-500' : ''}
                                                />
                                                {errors.deposit_fee && <p className="text-sm text-red-500">{errors.deposit_fee}</p>}
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="management_fee" className="text-sm font-medium">
                                                    Management Fee *
                                                </Label>
                                                <Input
                                                    id="management_fee"
                                                    placeholder="0.00"
                                                    value={displayValues.management_fee}
                                                    onChange={(e) => handleCurrencyChange('management_fee', e.target.value)}
                                                    className={errors.management_fee ? 'border-red-500' : ''}
                                                />
                                                {errors.management_fee && <p className="text-sm text-red-500">{errors.management_fee}</p>}
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="water_bill_fee" className="text-sm font-medium">
                                                    Water Bill Fee *
                                                </Label>
                                                <Input
                                                    id="water_bill_fee"
                                                    placeholder="0.00"
                                                    value={displayValues.water_bill_fee}
                                                    onChange={(e) => handleCurrencyChange('water_bill_fee', e.target.value)}
                                                    className={errors.water_bill_fee ? 'border-red-500' : ''}
                                                />
                                                {errors.water_bill_fee && <p className="text-sm text-red-500">{errors.water_bill_fee}</p>}
                                            </div>

                                            <div className="space-y-2 sm:col-span-2">
                                                <Label htmlFor="electricity_bill_fee" className="text-sm font-medium">
                                                    Electricity Bill Fee *
                                                </Label>
                                                <Input
                                                    id="electricity_bill_fee"
                                                    placeholder="0.00"
                                                    value={displayValues.electricity_bill_fee}
                                                    onChange={(e) => handleCurrencyChange('electricity_bill_fee', e.target.value)}
                                                    className={errors.electricity_bill_fee ? 'border-red-500' : ''}
                                                />
                                                {errors.electricity_bill_fee && <p className="text-sm text-red-500">{errors.electricity_bill_fee}</p>}
                                            </div>
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
                                </form>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Summary Sidebar */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Cost Summary</CardTitle>
                                <CardDescription>Preview of pricing breakdown</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Monthly Rental</span>
                                        <span className="font-medium">{formatCurrency(parseFloat(data.monthly_rental_fee) || 0)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Management Fee</span>
                                        <span className="font-medium">{formatCurrency(parseFloat(data.management_fee) || 0)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Water Bill</span>
                                        <span className="font-medium">{formatCurrency(parseFloat(data.water_bill_fee) || 0)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Electricity Bill</span>
                                        <span className="font-medium">{formatCurrency(parseFloat(data.electricity_bill_fee) || 0)}</span>
                                    </div>

                                    <Separator />

                                    <div className="flex justify-between font-medium">
                                        <span>Monthly Total</span>
                                        <span className="text-lg">{formatCurrency(totals.monthlyTotal)}</span>
                                    </div>

                                    <Separator />

                                    <div className="space-y-2 rounded-lg bg-blue-50 p-3 dark:bg-blue-950/30">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Deposit Fee</span>
                                            <span className="font-medium">{formatCurrency(parseFloat(data.deposit_fee) || 0)}</span>
                                        </div>
                                        <div className="flex justify-between font-medium text-blue-800 dark:text-blue-300">
                                            <span>Initial Payment</span>
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
