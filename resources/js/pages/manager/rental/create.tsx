import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { type BreadcrumbItem, type PageProps } from '@/types';
import { PaymentType } from '@/types/payment-type';
import { RentalPeriod } from '@/types/rental-period';
import { Room } from '@/types/room';
import { User } from '@/types/user';
import { formatCurrency } from '@/utils/format';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { Check, ChevronsUpDown, Plus, Save } from 'lucide-react';
import { useMemo, useState } from 'react';

interface CreateRentalRecordPageProps extends PageProps {
    rooms: Room[];
    tenants: User[];
    rental_periods: RentalPeriod[];
    payment_types: PaymentType[];
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
    user_id: string;
    room_id: string;
    rental_period_id: string;
    payment_type_id: string;
    entry_date: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Manager',
    },
    {
        title: 'Rental Records',
        href: '/manager/rental',
    },
    {
        title: 'Create',
        href: '/manager/rental/create',
    },
];

export default function CreateRentalRecord() {
    const { rooms, tenants, rental_periods, payment_types, errors } = usePage<CreateRentalRecordPageProps>().props;

    const [openTenant, setOpenTenant] = useState(false);
    const [openRoom, setOpenRoom] = useState(false);

    const { data, setData, post, processing, reset } = useForm<FormData>({
        user_id: '',
        room_id: '',
        rental_period_id: '',
        payment_type_id: '',
        entry_date: '',
    });

    // Get selected tenant and room for display
    const selectedTenant = tenants.find((tenant) => tenant.id.toString() === data.user_id);
    const selectedRoom = rooms.find((room) => room.id.toString() === data.room_id);

    // Calculate totals based on selected room and rental period
    const calculations = useMemo(() => {
        const selectedRoom = rooms.find((room) => room.id.toString() === data.room_id);
        const selectedPeriod = rental_periods.find((period) => period.id.toString() === data.rental_period_id);

        if (!selectedRoom || !selectedPeriod) {
            return {
                monthlyFee: 0,
                managementFee: 0,
                depositFee: 0,
                totalMonthlyFee: 0,
                totalRentalFee: 0,
                totalPrice: 0,
                exitDate: null,
                durationMonths: 0,
            };
        }

        const monthlyFee = selectedRoom.room_category.monthly_rental_fee;
        const managementFee = selectedRoom.room_category.management_fee;
        const depositFee = selectedRoom.room_category.deposit_fee;
        const totalMonthlyFee = monthlyFee;
        const totalRentalFee = totalMonthlyFee * selectedPeriod.month;
        const totalPrice = depositFee + totalRentalFee + managementFee;

        // Calculate exit date - FIXED: Using proper date calculation
        let exitDate = null;
        if (data.entry_date) {
            const entryDate = new Date(data.entry_date);
            // Create new date and add months properly
            exitDate = new Date(entryDate.getFullYear(), entryDate.getMonth() + selectedPeriod.month, entryDate.getDate());
        }

        return {
            monthlyFee,
            managementFee,
            depositFee,
            totalMonthlyFee,
            totalRentalFee,
            totalPrice,
            exitDate,
            durationMonths: selectedPeriod.month,
        };
    }, [data.room_id, data.rental_period_id, data.entry_date, rooms, rental_periods]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Ensure all required fields are filled
        if (!data.user_id || !data.room_id || !data.rental_period_id || !data.payment_type_id || !data.entry_date) {
            return;
        }

        post('/manager/rental', {
            onSuccess: () => {
                reset();
            },
            onError: (errors) => {
                console.log('Validation errors:', errors);
            },
        });
    };

    const handleCancel = () => {
        router.get('/manager/rental');
    };

    const handleCreateTenant = () => {
        router.get('/manager/user/tenant/create?redirect_to=manager.rental.record.create');
    };

    const formatDate = (date: Date | null) => {
        if (!date || isNaN(date.getTime())) return '';
        return date.toLocaleDateString('en-US', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Rental Record" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Create Rental Record</h1>
                        <p className="text-muted-foreground">Add a new rental record for a tenant</p>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Main Form */}
                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Rental Information</CardTitle>
                                <CardDescription>Enter the rental details for the tenant</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {/* Tenant Selection with Search */}
                                    <div className="space-y-2">
                                        <Label htmlFor="user_id" className="text-sm font-medium">
                                            Tenant *
                                        </Label>
                                        <div className="flex gap-2">
                                            <Popover open={openTenant} onOpenChange={setOpenTenant}>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        role="combobox"
                                                        aria-expanded={openTenant}
                                                        className={cn('flex-1 justify-between', errors.user_id && 'border-red-500')}
                                                    >
                                                        {selectedTenant ? (
                                                            <div className="flex flex-col items-start">
                                                                <span className="font-medium">{selectedTenant.name}</span>
                                                                <span className="text-xs text-muted-foreground">{selectedTenant.email}</span>
                                                            </div>
                                                        ) : (
                                                            'Select tenant...'
                                                        )}
                                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-[400px] p-0" align="start">
                                                    <Command>
                                                        <CommandInput placeholder="Search tenants..." />
                                                        <CommandList>
                                                            <CommandEmpty>No tenant found.</CommandEmpty>
                                                            <CommandGroup>
                                                                {tenants.map((tenant) => (
                                                                    <CommandItem
                                                                        key={tenant.id}
                                                                        value={`${tenant.name} ${tenant.email}`}
                                                                        onSelect={() => {
                                                                            setData('user_id', tenant.id.toString());
                                                                            setOpenTenant(false);
                                                                        }}
                                                                    >
                                                                        <Check
                                                                            className={cn(
                                                                                'mr-2 h-4 w-4',
                                                                                data.user_id === tenant.id.toString() ? 'opacity-100' : 'opacity-0',
                                                                            )}
                                                                        />
                                                                        <div className="flex flex-col">
                                                                            <span className="font-medium">{tenant.name}</span>
                                                                            <span className="text-sm text-muted-foreground">{tenant.email}</span>
                                                                        </div>
                                                                    </CommandItem>
                                                                ))}
                                                            </CommandGroup>
                                                        </CommandList>
                                                    </Command>
                                                </PopoverContent>
                                            </Popover>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="icon"
                                                onClick={handleCreateTenant}
                                                className="shrink-0"
                                                title="Create new tenant"
                                            >
                                                <Plus className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        {errors.user_id && <p className="text-sm text-red-500">{errors.user_id}</p>}
                                    </div>

                                    {/* Room Selection with Search */}
                                    <div className="space-y-2">
                                        <Label htmlFor="room_id" className="text-sm font-medium">
                                            Room *
                                        </Label>
                                        <Popover open={openRoom} onOpenChange={setOpenRoom}>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    role="combobox"
                                                    aria-expanded={openRoom}
                                                    className={cn('w-full justify-between', errors.room_id && 'border-red-500')}
                                                >
                                                    {selectedRoom ? (
                                                        <div className="flex flex-col items-start">
                                                            <span className="font-medium">{selectedRoom.name}</span>
                                                            <span className="text-xs text-muted-foreground">
                                                                {selectedRoom.room_category.name} -{' '}
                                                                {formatCurrency(selectedRoom.room_category.monthly_rental_fee)}/month
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        'Select room...'
                                                    )}
                                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-[400px] p-0" align="start">
                                                <Command>
                                                    <CommandInput placeholder="Search rooms..." />
                                                    <CommandList>
                                                        <CommandEmpty>No room found.</CommandEmpty>
                                                        <CommandGroup>
                                                            {rooms.map((room) => (
                                                                <CommandItem
                                                                    key={room.id}
                                                                    value={`${room.name} ${room.room_category.name}`}
                                                                    onSelect={() => {
                                                                        setData('room_id', room.id.toString());
                                                                        setOpenRoom(false);
                                                                    }}
                                                                >
                                                                    <Check
                                                                        className={cn(
                                                                            'mr-2 h-4 w-4',
                                                                            data.room_id === room.id.toString() ? 'opacity-100' : 'opacity-0',
                                                                        )}
                                                                    />
                                                                    <div className="flex flex-col">
                                                                        <span className="font-medium">{room.name}</span>
                                                                        <span className="text-sm text-muted-foreground">
                                                                            {room.room_category.name} -{' '}
                                                                            {formatCurrency(room.room_category.monthly_rental_fee)}/month
                                                                        </span>
                                                                    </div>
                                                                </CommandItem>
                                                            ))}
                                                        </CommandGroup>
                                                    </CommandList>
                                                </Command>
                                            </PopoverContent>
                                        </Popover>
                                        {errors.room_id && <p className="text-sm text-red-500">{errors.room_id}</p>}
                                    </div>

                                    <Separator />

                                    {/* Rental Details */}
                                    <div className="space-y-4">
                                        <div>
                                            <h3 className="text-lg font-medium">Rental Details</h3>
                                            <p className="text-sm text-muted-foreground">Set the rental period and dates</p>
                                        </div>

                                        <div className="grid gap-4 sm:grid-cols-2">
                                            <div className="space-y-2">
                                                <Label htmlFor="rental_period_id" className="text-sm font-medium">
                                                    Rental Period *
                                                </Label>
                                                <Select value={data.rental_period_id} onValueChange={(value) => setData('rental_period_id', value)}>
                                                    <SelectTrigger className={errors.rental_period_id ? 'border-red-500' : ''}>
                                                        <SelectValue placeholder="Select period" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {rental_periods.map((period) => (
                                                            <SelectItem key={period.id} value={period.id.toString()}>
                                                                {period.name} ({period.month} months)
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                {errors.rental_period_id && <p className="text-sm text-red-500">{errors.rental_period_id}</p>}
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="payment_type_id" className="text-sm font-medium">
                                                    Payment Type *
                                                </Label>
                                                <Select value={data.payment_type_id} onValueChange={(value) => setData('payment_type_id', value)}>
                                                    <SelectTrigger className={errors.payment_type_id ? 'border-red-500' : ''}>
                                                        <SelectValue placeholder="Select payment type" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {payment_types.map((type) => (
                                                            <SelectItem key={type.id} value={type.id.toString()}>
                                                                {type.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                {errors.payment_type_id && <p className="text-sm text-red-500">{errors.payment_type_id}</p>}
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="entry_date" className="text-sm font-medium">
                                                    Entry Date *
                                                </Label>
                                                <Input
                                                    id="entry_date"
                                                    type="date"
                                                    value={data.entry_date}
                                                    onChange={(e) => setData('entry_date', e.target.value)}
                                                    className={errors.entry_date ? 'border-red-500' : ''}
                                                    min={new Date().toISOString().split('T')[0]} // Set minimum date to today
                                                />
                                                {errors.entry_date && <p className="text-sm text-red-500">{errors.entry_date}</p>}
                                            </div>

                                            <div className="space-y-2">
                                                <Label className="text-sm font-medium">Exit Date</Label>
                                                <Input
                                                    value={calculations.exitDate ? formatDate(calculations.exitDate) : ''}
                                                    disabled
                                                    className="bg-muted"
                                                />
                                                <p className="text-xs text-muted-foreground">
                                                    Calculated automatically based on entry date and rental period
                                                </p>
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
                                <CardDescription>Preview of rental pricing</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Deposit Fee</span>
                                        <span className="font-medium">{formatCurrency(calculations.depositFee)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Management Fee</span>
                                        <span className="font-medium">{formatCurrency(calculations.managementFee)}</span>
                                    </div>

                                    <Separator />

                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Monthly Rental Fee</span>
                                        <span className="font-medium">{formatCurrency(calculations.monthlyFee)}</span>
                                    </div>

                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Duration</span>
                                        <span className="font-medium">{calculations.durationMonths} months</span>
                                    </div>

                                    <div className="flex justify-between font-medium">
                                        <span>Total Rental Fee</span>
                                        <span>{formatCurrency(calculations.totalRentalFee)}</span>
                                    </div>

                                    <Separator />

                                    <div className="space-y-2 rounded-lg bg-blue-50 p-3 dark:bg-blue-950/30">
                                        <div className="flex justify-between font-medium text-blue-800 dark:text-blue-300">
                                            <span>Total Price</span>
                                            <span className="text-lg">{formatCurrency(calculations.totalPrice)}</span>
                                        </div>
                                    </div>

                                    {calculations.exitDate && (
                                        <>
                                            <Separator />
                                            <div className="space-y-2 rounded-lg bg-green-50 p-3 dark:bg-green-950/30">
                                                <div className="text-sm font-medium text-green-800 dark:text-green-300">Rental Period</div>
                                                <div className="text-xs text-green-700 dark:text-green-400">
                                                    {data.entry_date ? formatDate(new Date(data.entry_date)) : 'Start Date'} →{' '}
                                                    {formatDate(calculations.exitDate)}
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
