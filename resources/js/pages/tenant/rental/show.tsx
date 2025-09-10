import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type PageProps } from '@/types';
import { PaymentSummary } from '@/types/payment-summary';
import { Rental } from '@/types/rental';
import { RentalPayment } from '@/types/rental-payment';
import { getPaymentStatusBadge, getRemainingTOPBadge, getRentalStatusBadge } from '@/utils/badges';
import { formatCurrency, formatDate } from '@/utils/format';
import { getPaymentCategory } from '@/utils/type';
import { Head, router, usePage } from '@inertiajs/react';
import { CreditCard, FileImage, ImageIcon, LayoutList } from 'lucide-react';
import { useMemo } from 'react';

interface TenantRentalShowProps extends PageProps {
    rental: Rental;
    paymentSummary: PaymentSummary;
    nextPayment?: RentalPayment;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Tenant',
    },
    {
        title: 'My Rentals',
        href: '/tenant/rental',
    },
    {
        title: 'Detail',
    },
];

export default function TenantRentalShow() {
    const { rental, paymentSummary } = usePage<TenantRentalShowProps>().props;

    // Calculate costs
    const monthlyFee = rental.room.room_category.monthly_rental_fee;
    const managementFee = rental.room.room_category.management_fee;
    const depositFee = rental.room.room_category.deposit_fee;
    const bookingFee = rental.booking_fee?.amount || 0;
    const rentalDuration = rental.rental_period?.month || 0;
    const totalRentalCost = (monthlyFee + managementFee) * rentalDuration;

    console.log('room images:', rental.room.room_images);

    const displayImages = useMemo(() => {
        if (rental.room.room_images && rental.room.room_images.length > 0) {
            return rental.room.room_images.map((img) => ({
                id: img.id,
                url: img.url,
                alt: `${rental.room.name} - Image ${img.id}`,
            }));
        } else if (rental.room.image) {
            return [
                {
                    id: 1,
                    url: `/storage/${rental.room.image}`,
                    alt: rental.room.name,
                },
            ];
        }
        return [];
    }, [rental.room.room_images, rental.room.image, rental.room.name]);

    const handlePaymentDetail = (paymentId: number) => {
        router.get(`/tenant/rental/payment/${paymentId}`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Rental Details - ${rental.room.name}`} />

            <div className="flex h-full flex-1 flex-col">
                {/* Hero Section with Image Slider */}
                <div className="relative h-64 overflow-hidden sm:h-80">
                    {displayImages.length > 0 ? (
                        <Carousel className="h-full w-full">
                            <CarouselContent>
                                {displayImages.map((image) => (
                                    <CarouselItem key={`hero-image-${image.id}`}>
                                        <div className="relative h-64 sm:h-80">
                                            <img src={image.url} alt={image.alt} className="h-full w-full object-cover" />
                                            <div className="absolute inset-0 bg-black/40" />

                                            {/* Image counter */}
                                            {displayImages.length > 1 && (
                                                <div className="absolute top-4 right-4">
                                                    <span className="rounded bg-black/70 px-2 py-1 text-xs font-medium text-white">
                                                        {displayImages.findIndex((img) => img.id === image.id) + 1} / {displayImages.length}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </CarouselItem>
                                ))}
                            </CarouselContent>

                            {/* Show navigation arrows only if there are multiple images */}
                            {displayImages.length > 1 && (
                                <>
                                    <CarouselPrevious className="absolute top-1/2 left-4 -translate-y-1/2 bg-black/50 text-white hover:bg-black/70" />
                                    <CarouselNext className="absolute top-1/2 right-4 -translate-y-1/2 bg-black/50 text-white hover:bg-black/70" />
                                </>
                            )}
                        </Carousel>
                    ) : (
                        // Fallback gradient background when no images
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500">
                            <div className="absolute inset-0 bg-black/30" />
                            <div className="flex h-full items-center justify-center">
                                <ImageIcon className="h-16 w-16 text-white/50" />
                            </div>
                        </div>
                    )}

                    {/* Room Info Overlay */}
                    <div className="absolute right-0 bottom-0 left-0 bg-gradient-to-t from-black/60 to-transparent p-6 text-white">
                        <div className="flex items-end justify-between">
                            <div>
                                <h1 className="text-xl font-bold sm:text-3xl">{rental.room.name}</h1>
                                <div className="mt-2 flex items-center gap-1 md:gap-2">
                                    <LayoutList className="h-3 w-3 md:h-4 md:w-4" />
                                    <span className="text-xs md:text-sm">{rental.room.room_category.name}</span>
                                </div>
                            </div>
                            <div className="text-black">{getRentalStatusBadge(rental.status)}</div>
                        </div>
                    </div>

                    {/* Image indicators for multiple images */}
                    {displayImages.length > 1 && (
                        <div className="absolute bottom-20 left-1/2 flex -translate-x-1/2 space-x-2">
                            {displayImages.map((_, index) => (
                                <div key={index} className="h-2 w-2 rounded-full bg-white/50" />
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex-1 p-4 sm:p-6">
                    {/* Price & Progress Section */}
                    <div className="mb-6">
                        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                            <div>
                                <div className="text-xl font-bold text-gray-900 md:text-2xl dark:text-gray-100">
                                    {formatCurrency(rental.total_price)}
                                </div>
                                <div className="text-xs text-gray-500 md:text-sm">
                                    Total for {rentalDuration} months • {rental.payment_type?.name} Payment
                                </div>
                            </div>
                        </div>

                        {/* Payment Progress */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-sm md:text-lg">Payment Progress</CardTitle>
                                    <div>{getPaymentStatusBadge(paymentSummary.payment_status)}</div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Progress value={paymentSummary.payment_progress} className="h-1.5 md:h-3" />
                                <div className="flex justify-between text-xs md:text-sm">
                                    <span className="text-gray-600 dark:text-gray-400">Paid: {formatCurrency(paymentSummary.total_paid)}</span>
                                    <span className="font-medium">Remaining: {formatCurrency(paymentSummary.remaining_balance)}</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid items-start gap-6 lg:grid-cols-2">
                        {/* Cost Summary */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-sm md:text-lg">Cost Breakdown</CardTitle>
                                <CardDescription className="text-xs md:text-sm">Detailed pricing information</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-3">
                                    <div className="flex justify-between text-xs md:text-sm">
                                        <span className="text-gray-600 dark:text-gray-400">Monthly Rental Fee</span>
                                        <span className="font-medium">{formatCurrency(monthlyFee)}</span>
                                    </div>
                                    <div className="flex justify-between text-xs md:text-sm">
                                        <span className="text-gray-600 dark:text-gray-400">Management Fee</span>
                                        <span className="font-medium">{formatCurrency(managementFee)}</span>
                                    </div>
                                    <div className="flex justify-between text-xs md:text-sm">
                                        <span className="text-gray-600 dark:text-gray-400">Duration</span>
                                        <span className="font-medium">{rentalDuration} months</span>
                                    </div>
                                    <div className="flex justify-between text-xs md:text-sm">
                                        <span className="text-gray-600 dark:text-gray-400">Total Rental Cost</span>
                                        <span className="font-medium">{formatCurrency(totalRentalCost)}</span>
                                    </div>

                                    <Separator />

                                    <div className="flex justify-between text-xs md:text-sm">
                                        <span className="text-gray-600 dark:text-gray-400">Deposit Fee</span>
                                        <span className="font-medium">{formatCurrency(depositFee)}</span>
                                    </div>
                                    {bookingFee > 0 && (
                                        <div className="flex justify-between text-xs md:text-sm">
                                            <span className="text-gray-600 dark:text-gray-400">Booking Fee</span>
                                            <span className="font-medium">{formatCurrency(bookingFee)}</span>
                                        </div>
                                    )}

                                    <Separator />

                                    <div className="flex justify-between text-sm font-medium md:text-lg">
                                        <span>Total Price</span>
                                        <span>{formatCurrency(rental.total_price)}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Rental Details */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-sm md:text-lg">Rental Information</CardTitle>
                                <CardDescription className="text-xs md:text-sm">Contract details and period</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-3">
                                    <div className="flex justify-between text-xs md:text-sm">
                                        <span className="text-gray-600 dark:text-gray-400">Entry Date</span>
                                        <span className="font-medium">{formatDate(rental.entry_date)}</span>
                                    </div>
                                    <div className="flex justify-between text-xs md:text-sm">
                                        <span className="text-gray-600 dark:text-gray-400">Exit Date</span>
                                        <span className="font-medium">{formatDate(rental.exit_date)}</span>
                                    </div>
                                    <div className="flex justify-between text-xs md:text-sm">
                                        <span className="text-gray-600 dark:text-gray-400">Payment Type</span>
                                        <span className="font-medium">{rental.payment_type?.name || '-'}</span>
                                    </div>
                                    <div className="flex justify-between text-xs md:text-sm">
                                        <span className="text-gray-600 dark:text-gray-400">Payment Method</span>
                                        <span className="font-medium">{rental.is_down_payment_paid_full ? 'Full Payment' : 'Installment'}</span>
                                    </div>
                                </div>

                                {/* Deposit Return Info */}
                                {rental.deposit_return && (
                                    <>
                                        <Separator />
                                        <div>
                                            <h4 className="mb-2 text-xs font-medium text-green-700 md:text-sm dark:text-green-400">
                                                Deposit Returned
                                            </h4>
                                            <div className="flex items-center justify-between text-xs md:text-sm">
                                                <span className="text-gray-600 dark:text-gray-400">Return Date</span>
                                                <span className="font-medium">{formatDate(rental.deposit_return.returned_at)}</span>
                                            </div>
                                            {rental.deposit_return.proof_image && (
                                                <div className="mt-2">
                                                    <Dialog>
                                                        <DialogTrigger asChild>
                                                            <Button variant="outline" size="sm" className="h-8 text-xs">
                                                                <FileImage className="mr-1 h-3 w-3" />
                                                                View Proof
                                                            </Button>
                                                        </DialogTrigger>
                                                        <DialogContent className="max-w-2xl">
                                                            <DialogHeader>
                                                                <DialogTitle className="text-xs md:text-sm">Proof of Deposit Return</DialogTitle>
                                                            </DialogHeader>
                                                            <div className="flex justify-center">
                                                                <img
                                                                    src={`/storage/${rental.deposit_return.proof_image}`}
                                                                    alt="Proof of deposit return"
                                                                    className="max-h-96 max-w-full rounded-lg border object-contain"
                                                                />
                                                            </div>
                                                        </DialogContent>
                                                    </Dialog>
                                                </div>
                                            )}
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Payment Bills */}
                    <Card className="mt-6">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-sm md:text-lg">Payment Bills</CardTitle>
                            <CardDescription className="text-xs md:text-sm">Track all your payments and transactions</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {rental.rental_payments && rental.rental_payments.length > 0 ? (
                                <div className="space-y-3">
                                    {rental.rental_payments.map((payment, index) => (
                                        <div
                                            key={payment.id}
                                            className="flex cursor-pointer items-center justify-between rounded-lg border p-3 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
                                            onClick={() => handlePaymentDetail(payment.id)}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div>
                                                    <div className="text-xs font-medium md:text-sm" key={index}>
                                                        {getPaymentCategory(payment.category)}
                                                    </div>
                                                    <div className="mt-1 text-xs font-medium md:text-sm">
                                                        top : {getRemainingTOPBadge(payment.billing_date, payment.due_date, payment.payment_status)}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right text-xs md:text-sm">
                                                <div className="font-semibold">{formatCurrency(payment.amount)}</div>
                                                <div className="mt-1">{getPaymentStatusBadge(payment.payment_status)}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-8 text-center">
                                    <CreditCard className="mx-auto h-12 w-12 text-gray-400" />
                                    <h3 className="mt-4 text-sm font-medium text-gray-900 dark:text-gray-100">No Payment History</h3>
                                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                        Payment history will appear here once payments are made.
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
