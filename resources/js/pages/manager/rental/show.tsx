import CostSummary from '@/components/rental/cost-summary';
import PaymentSummary from '@/components/rental/payment-summary';
import RentalPaymentHistory from '@/components/rental/rental-payment-history';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type PageProps } from '@/types';
import { PaymentSummary as PaymentSummaryType } from '@/types/payment-summary';
import { Rental } from '@/types/rental';
import { formatCurrency, formatDate } from '@/utils/format';
import { Head, Link, usePage } from '@inertiajs/react';
import { Check, Edit, X } from 'lucide-react';

interface RentalDetailPageProps extends PageProps {
    rental: Rental;
    paymentSummary: PaymentSummaryType;
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

    console.log('deposit return', rental);

    // Check if it's cash payment
    const isCashPayment = rental.payment_type?.name.toLowerCase() === 'cash';
    const bookingFee = rental.booking_fee?.amount || 0;
    const rentalDuration = rental.rental_period?.month || 0;

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
                                                <Label className="text-sm font-medium">Entry Date</Label>
                                                <Input value={formatDate(rental.entry_date)} disabled className="bg-muted" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-sm font-medium">Exit Date</Label>
                                                <Input value={formatDate(rental.exit_date)} disabled className="bg-muted" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-sm font-medium">Booking Fee</Label>
                                                <Input value={bookingFee > 0 ? formatCurrency(bookingFee) : '-'} disabled className="bg-muted" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-sm font-medium">Status</Label>
                                                <Input value={rental.status || '-'} disabled className="bg-muted" />
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

                                    {/* Deposit Return Information */}
                                    {rental.deposit_return && (
                                        <>
                                            <Separator />
                                            <div className="space-y-4">
                                                <h3 className="text-lg font-medium">Deposit Return Information</h3>
                                                <div className="grid gap-4 md:grid-cols-2">
                                                    <div className="space-y-2">
                                                        <Label className="text-sm font-medium">Return Date</Label>
                                                        <Input value={formatDate(rental.deposit_return.returned_at)} disabled className="bg-muted" />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label className="text-sm font-medium">Proof Image</Label>
                                                        <div className="mt-1">
                                                            <Dialog>
                                                                <DialogTrigger asChild>
                                                                    <Button variant="outline" size="sm" className="h-8 text-xs">
                                                                        View Proof
                                                                    </Button>
                                                                </DialogTrigger>
                                                                <DialogContent className="max-w-2xl">
                                                                    <DialogHeader>
                                                                        <DialogTitle>Proof of Deposit Return</DialogTitle>
                                                                    </DialogHeader>
                                                                    <div className="space-y-4">
                                                                        <div className="flex justify-center">
                                                                            <img
                                                                                src={`/storage/${rental.deposit_return.proof_image}`}
                                                                                alt="Proof of deposit return"
                                                                                className="max-h-96 max-w-full rounded-lg border object-contain"
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                </DialogContent>
                                                            </Dialog>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Sidebar - Using separate components */}
                        <div className="space-y-6">
                            {/* Cost Summary Component */}
                            <CostSummary rental={rental} />

                            {/* Payment Summary Component */}
                            <PaymentSummary paymentSummary={paymentSummary} />
                        </div>
                    </div>

                    {/* Payment History - Full Width */}
                    <RentalPaymentHistory rental={rental} paymentStatus={paymentSummary.payment_status} tenant={rental.user} />
                </div>
            </div>
        </AppLayout>
    );
}
