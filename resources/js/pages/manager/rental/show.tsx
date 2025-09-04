import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type PageProps } from '@/types';
import { PaymentSummary } from '@/types/payment-summary';
import { Rental } from '@/types/rental';
import { formatCurrency } from '@/utils/format';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Check, CreditCard, Edit, X } from 'lucide-react';
import { useState } from 'react';

interface RentalDetailPageProps extends PageProps {
    rental: Rental;
    paymentSummary: PaymentSummary;
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
        title: 'Detail',
    },
];

export default function RentalDetail() {
    const { rental, paymentSummary } = usePage<RentalDetailPageProps>().props;
    const [selectedPaymentId, setSelectedPaymentId] = useState<number | null>(null);
    const [isMarkingPaid, setIsMarkingPaid] = useState(false);

    // Fixed format date function to handle null/empty dates
    const formatDate = (dateString: string | null | undefined) => {
        if (!dateString) return '-';

        const date = new Date(dateString);
        // Check if date is valid
        if (isNaN(date.getTime())) return '-';

        return date.toLocaleDateString('en-US', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    // Function to format underscore fields to proper labels
    const formatLabel = (text: string) => {
        return text
            .split('_')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    // Function to format category names
    const formatCategory = (category: string) => {
        return formatLabel(category);
    };

    // Function to format payment method
    const formatPaymentMethod = (method: string) => {
        return formatLabel(method);
    };

    // Simplified badge function
    const getStatusBadge = (status: string) => {
        const normalizedStatus = status?.toLowerCase();

        if (normalizedStatus === 'paid') {
            return <Badge variant="success">{status}</Badge>;
        } else if (normalizedStatus === 'unpaid') {
            return <Badge variant="error">{status}</Badge>;
        } else if (normalizedStatus === 'pending') {
            return <Badge variant="warning">{status}</Badge>;
        }

        return <Badge variant="secondary">{status}</Badge>;
    };

    // Handle Mark as Paid
    const handleMarkAsPaid = (id: number) => {
        setIsMarkingPaid(true);
        router.post(
            `/manager/rental/payment/${id}/mark-as-paid`,
            {},
            {
                onSuccess: () => {
                    setSelectedPaymentId(null);
                    setIsMarkingPaid(false);
                },
                onError: () => {
                    setIsMarkingPaid(false);
                },
            },
        );
    };

    // Calculate rental duration
    const rentalDuration = rental.rental_period?.month || rental.rental_period?.month || 0;

    // Calculate breakdown similar to create page
    const monthlyFee = rental.room.room_category.monthly_rental_fee;
    const managementFee = rental.room.room_category.management_fee;
    const depositFee = rental.room.room_category.deposit_fee;
    const bookingFee = rental.booking_fee?.amount || 0;

    // Calculate costs similar to create page logic
    const totalRentalCost = (monthlyFee + managementFee) * rentalDuration;
    const netRentalCost = totalRentalCost - bookingFee + depositFee;
    const totalPrice = depositFee + totalRentalCost;
    const totalPriceNoBookingFee = depositFee + (totalRentalCost - bookingFee);

    // Check if it's cash payment
    const isCashPayment = rental.payment_type?.name.toLowerCase() === 'cash';

    // Calculate payment breakdown based on payment type
    const getPaymentBreakdown = () => {
        const paymentType = rental.payment_type?.name.toLowerCase();
        let breakdown: { label: string; amount: number; percentage?: number | null }[] = [];

        if (paymentType === 'cash') {
            if (rental.is_down_payment_paid_full) {
                breakdown = [
                    {
                        label: 'Settlement (100%)',
                        amount: netRentalCost,
                        percentage: 100,
                    },
                ];
            } else {
                breakdown = [
                    { label: 'Down Payment (50%)', amount: netRentalCost * 0.5, percentage: 50 },
                    { label: 'Settlement (50%)', amount: netRentalCost * 0.5, percentage: 50 },
                ];
            }
        } else if (paymentType === 'partial') {
            breakdown = [
                { label: 'Down Payment (50%)', amount: netRentalCost * 0.5, percentage: 50 },
                { label: 'Rental Fee 1st (20%)', amount: netRentalCost * 0.2, percentage: 20 },
                { label: 'Rental Fee 2nd (20%)', amount: netRentalCost * 0.2, percentage: 20 },
                { label: 'Rental Fee 3rd (10%)', amount: netRentalCost * 0.1, percentage: 10 },
            ];
        } else if (paymentType === 'monthly') {
            const monthlyPayment = monthlyFee + managementFee;
            const depositPerMonth = depositFee / rentalDuration;
            breakdown = [
                {
                    label: `Monthly Payment × ${rentalDuration}`,
                    amount: monthlyPayment + depositPerMonth,
                    percentage: null,
                },
                {
                    label: `Total Monthly Payment`,
                    amount: (monthlyPayment + depositPerMonth) * rentalDuration,
                    percentage: null,
                },
            ];
        }

        return breakdown;
    };

    const paymentBreakdown = getPaymentBreakdown();

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Rental Detail - ${rental.user.name}`} />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Rental Detail</h1>
                        <p className="text-muted-foreground">
                            Rental record for {rental.user.name} in {rental.room.name}
                        </p>
                    </div>
                    {rental.status === 'booked' && (
                        <Button variant="outline" asChild className="w-fit">
                            <Link href={`/manager/rental/${rental.id}/edit`}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Rental
                            </Link>
                        </Button>
                    )}
                </div>

                <div className="grid gap-6">
                    {/* Grid Layout - responsive */}
                    <div className="grid gap-6 xl:grid-cols-3">
                        {/* Main Content */}
                        <div className="space-y-6 xl:col-span-2">
                            {/* Rental Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Rental Information</CardTitle>
                                    <CardDescription>Basic rental details and tenant information</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {/* Tenant Information */}
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-medium">Tenant and Room Information</h3>
                                        <div className="grid gap-4 md:grid-cols-2">
                                            <div className="space-y-2">
                                                <Label className="text-sm font-medium">Tenant Name</Label>
                                                <Input value={rental.user.name} disabled className="bg-muted" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-sm font-medium">Email</Label>
                                                <Input value={rental.user.email} disabled className="bg-muted" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Room Information */}
                                    <div className="space-y-4">
                                        <div className="grid gap-4 md:grid-cols-2">
                                            <div className="space-y-2">
                                                <Label className="text-sm font-medium">Room Name</Label>
                                                <Input value={rental.room.name} disabled className="bg-muted" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-sm font-medium">Room Category</Label>
                                                <Input
                                                    value={`${rental.room.room_category.name} - ${formatCurrency(rental.room.room_category.monthly_rental_fee)}/month`}
                                                    disabled
                                                    className="bg-muted"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <Separator />

                                    {/* Rental Details */}
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-medium">Rental Details</h3>
                                        <div className="grid gap-4 md:grid-cols-2">
                                            <div className="space-y-2">
                                                <Label className="text-sm font-medium">Rental Period</Label>
                                                <Input
                                                    value={rental.rental_period ? `${rental.rental_period.name} (${rentalDuration} months)` : '-'}
                                                    disabled
                                                    className="bg-muted"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-sm font-medium">Payment Type</Label>
                                                <Input value={rental.payment_type?.name || '-'} disabled className="bg-muted" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-sm font-medium">Booking Fee</Label>
                                                <Input value={bookingFee > 0 ? formatCurrency(bookingFee) : '-'} disabled className="bg-muted" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-sm font-medium">Entry Date</Label>
                                                <Input value={formatDate(rental.entry_date)} disabled className="bg-muted" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-sm font-medium">Exit Date</Label>
                                                <Input value={formatDate(rental.exit_date)} disabled className="bg-muted" />
                                            </div>
                                        </div>

                                        {/* Down Payment Option for Cash Payment */}
                                        {isCashPayment && (
                                            <div className="space-y-2">
                                                <Label className="text-sm font-medium">Down Payment Option</Label>
                                                <div className="flex items-center space-x-3 rounded-lg border bg-muted p-3">
                                                    <div className="flex items-center">
                                                        {rental.is_down_payment_paid_full ? (
                                                            <Check className="h-4 w-4 text-green-600" />
                                                        ) : (
                                                            <X className="h-4 w-4 text-red-600" />
                                                        )}
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="text-sm font-medium">
                                                            {rental.is_down_payment_paid_full ? 'Full payment upfront' : 'Split payment (50% + 50%)'}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {rental.is_down_payment_paid_full
                                                                ? 'Full payment made on entry date'
                                                                : '50% down payment + 50% settlement payment'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <Separator />

                                    {/* Total Price */}
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium">Total Price</Label>
                                        <Input value={formatCurrency(rental.total_price)} disabled className="bg-muted font-semibold" />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Cost Summary - Improved to match create page */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Cost Summary</CardTitle>
                                    <CardDescription>Detailed rental pricing breakdown</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-3">
                                        {/* Basic Fees */}
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Monthly Rental Fee</span>
                                            <span className="font-medium">{formatCurrency(monthlyFee)}</span>
                                        </div>

                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Management Fee</span>
                                            <span className="font-medium">{formatCurrency(managementFee)}</span>
                                        </div>

                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Duration</span>
                                            <span className="font-medium">{rentalDuration} months</span>
                                        </div>

                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Total Rental Cost</span>
                                            <span className="font-medium">{formatCurrency(totalRentalCost)}</span>
                                        </div>

                                        <Separator />

                                        {/* Booking Fee if exists */}
                                        {bookingFee > 0 && (
                                            <div className="flex justify-between text-sm">
                                                <span className="text-muted-foreground">Booking Fee</span>
                                                <span className="font-medium">{bookingFee > 0 ? formatCurrency(bookingFee) : '-'}</span>
                                            </div>
                                        )}

                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Net Rental Cost</span>
                                            <span className="font-medium">{formatCurrency(netRentalCost)}</span>
                                        </div>

                                        <Separator />

                                        {/* Payment Breakdown */}
                                        {paymentBreakdown.length > 0 && (
                                            <>
                                                <div>
                                                    <h4 className="mb-2 text-sm font-medium">Payment Schedule</h4>
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-muted-foreground">Deposit Fee</span>
                                                        <span className="font-medium">{formatCurrency(depositFee)}</span>
                                                    </div>
                                                    <div className="mt-2 space-y-2">
                                                        {paymentBreakdown.map((payment, index) => (
                                                            <div key={index} className="flex justify-between text-sm">
                                                                <span className="text-muted-foreground">{payment.label}</span>
                                                                <span className="font-medium">{formatCurrency(payment.amount)}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                                <Separator />
                                            </>
                                        )}

                                        {/* Total Price */}
                                        <div className="space-y-2 rounded-lg bg-blue-50 p-3 dark:bg-blue-950/30">
                                            {rental.status === 'booked' ? (
                                                <>
                                                    <div className="flex justify-between font-medium text-blue-800 dark:text-blue-300">
                                                        <span>Total Price</span>
                                                        <span className="text-lg">{formatCurrency(totalPrice)}</span>
                                                    </div>
                                                    <p className="text-xs text-blue-600 dark:text-blue-400">
                                                        *Total has been included by booking fee
                                                    </p>
                                                </>
                                            ) : (
                                                <>
                                                    <div className="flex justify-between font-medium text-blue-800 dark:text-blue-300">
                                                        <span>Total Price</span>
                                                        <span className="text-lg">{formatCurrency(totalPriceNoBookingFee)}</span>
                                                    </div>
                                                    <p className="text-xs text-blue-600 dark:text-blue-400">*Total has been reduced by booking fee</p>
                                                </>
                                            )}
                                        </div>

                                        {/* Rental Period */}
                                        <Separator />
                                        <div className="space-y-2 rounded-lg bg-green-50 p-3 dark:bg-green-950/30">
                                            <div className="text-sm font-medium text-green-800 dark:text-green-300">Rental Period</div>
                                            <div className="text-xs text-green-700 dark:text-green-400">
                                                {formatDate(rental.entry_date)} → {formatDate(rental.exit_date)}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Payment Summary - Separate Card */}
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle className="text-lg">Payment Summary</CardTitle>
                                        </div>
                                        {getStatusBadge(paymentSummary.payment_status)}
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-3">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Total Paid</span>
                                            <span className="font-medium text-green-600">{formatCurrency(paymentSummary.total_paid)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Remaining Balance</span>
                                            <span className="font-medium text-red-600">{formatCurrency(paymentSummary.remaining_balance)}</span>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-muted-foreground">Payment Progress</span>
                                                <span className="font-medium">{paymentSummary.payment_progress}%</span>
                                            </div>
                                            <Progress value={paymentSummary.payment_progress} className="h-2" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Payment History - Full Width */}

                    <Card className="w-full overflow-x-auto">
                        <CardHeader>
                            <CardTitle>Payment History</CardTitle>
                            <CardDescription>All payments made for this rental</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Category</TableHead>
                                            <TableHead>Billing Date</TableHead>
                                            <TableHead>Amount</TableHead>
                                            <TableHead className="sm:table-cell">Status</TableHead>
                                            <TableHead className="md:table-cell">Method</TableHead>
                                            <TableHead className="md:table-cell">Paid At</TableHead>
                                            <TableHead className="md:table-cell">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {rental.rental_payments.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={7} className="h-24 text-center">
                                                    No payments found for this rental.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            rental.rental_payments.map((payment) => (
                                                <TableRow key={payment.id}>
                                                    <TableCell className="font-medium">{formatCategory(payment.category || '-')}</TableCell>
                                                    <TableCell>{formatDate(payment.billing_date)}</TableCell>
                                                    <TableCell className="font-semibold">{formatCurrency(payment.amount)}</TableCell>
                                                    <TableCell>{getStatusBadge(payment.payment_status)}</TableCell>
                                                    <TableCell>{formatPaymentMethod(payment.payment_method || '-')}</TableCell>
                                                    <TableCell>{formatDate(payment.paid_at)}</TableCell>
                                                    <TableCell>
                                                        <TooltipProvider>
                                                            <div className="flex gap-1">
                                                                {payment.payment_status.toLowerCase() !== 'paid' && (
                                                                    <Tooltip>
                                                                        <TooltipTrigger asChild>
                                                                            <Button
                                                                                variant="outline"
                                                                                size="sm"
                                                                                className="h-8 w-8 p-0"
                                                                                onClick={() => setSelectedPaymentId(payment.id)}
                                                                            >
                                                                                <CreditCard className="h-4 w-4" />
                                                                            </Button>
                                                                        </TooltipTrigger>
                                                                        <TooltipContent>
                                                                            <p>Mark as Paid</p>
                                                                        </TooltipContent>
                                                                    </Tooltip>
                                                                )}

                                                                {/* <Tooltip>
                                                                    <TooltipTrigger asChild>
                                                                        <Button
                                                                            variant="outline"
                                                                            size="sm"
                                                                            className="h-8 w-8 p-0 text-yellow-600 hover:text-yellow-700"
                                                                        >
                                                                            <Bell className="h-4 w-4" />
                                                                        </Button>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent>
                                                                        <p>Send Payment Reminder</p>
                                                                    </TooltipContent>
                                                                </Tooltip>

                                                                <Tooltip>
                                                                    <TooltipTrigger asChild>
                                                                        <Button
                                                                            variant="outline"
                                                                            size="sm"
                                                                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                                                                        >
                                                                            <Trash2 className="h-4 w-4" />
                                                                        </Button>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent>
                                                                        <p>Delete Payment</p>
                                                                    </TooltipContent>
                                                                </Tooltip> */}
                                                            </div>
                                                        </TooltipProvider>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <AlertDialog open={!!selectedPaymentId} onOpenChange={() => setSelectedPaymentId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Mark Payment as Paid?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will update the status of this payment record to <strong>Paid</strong>.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setSelectedPaymentId(null)}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => selectedPaymentId && handleMarkAsPaid(selectedPaymentId)}
                            disabled={isMarkingPaid}
                            className="bg-green-600 hover:bg-green-700"
                        >
                            {isMarkingPaid ? 'Marking...' : 'Mark as Paid'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
