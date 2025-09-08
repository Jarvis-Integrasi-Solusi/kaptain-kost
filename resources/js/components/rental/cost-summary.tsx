import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Rental } from '@/types/rental';
import { formatCurrency } from '@/utils/format';

interface CostSummaryProps {
    rental: Rental;
}

export default function CostSummary({ rental }: CostSummaryProps) {
    // Calculate costs based on the same logic as the original component
    const monthlyFee = rental.room.room_category.monthly_rental_fee;
    const managementFee = rental.room.room_category.management_fee;
    const depositFee = rental.room.room_category.deposit_fee;
    const bookingFee = rental.booking_fee?.amount || 0;

    const rentalDuration = rental.rental_period?.month || 0;

    // Total rental cost (monthly fee + management fee) × duration
    const totalRentalCost = (monthlyFee + managementFee) * rentalDuration;

    // Net rental cost (deduct booking fee + add deposit fee)
    const netRentalCost = totalRentalCost - bookingFee + depositFee;

    // Rental Cost Without Deposit and Booking Fee
    const rentalCost = totalRentalCost - bookingFee;

    // Total price (full rental cost + deposit fee)
    const totalPrice = depositFee + totalRentalCost;

    const getPaymentBreakdown = () => {
        const paymentType = rental.payment_type?.name.toLowerCase();
        let breakdown: { label: string; amount: number; percentage?: number | null }[] = [];

        if (paymentType === 'cash') {
            if (rental.is_down_payment_paid_full) {
                // Full cash payment (100%)
                breakdown = [
                    {
                        label: 'Settlement (100%)',
                        amount: netRentalCost,
                        percentage: 100,
                    },
                ];
            } else {
                // Cash payment split into down payment and settlement
                breakdown = [
                    { label: 'Down Payment (50%)', amount: netRentalCost * 0.5, percentage: 50 },
                    { label: 'Settlement (50%)', amount: netRentalCost * 0.5, percentage: 50 },
                ];
            }
        } else if (paymentType === 'partial') {
            // Partial payment with multiple installments
            breakdown = [
                { label: 'Down Payment (50%)', amount: netRentalCost * 0.5, percentage: 50 },
                { label: 'Rental Fee 1st (20%)', amount: netRentalCost * 0.2, percentage: 20 },
                { label: 'Rental Fee 2nd (20%)', amount: netRentalCost * 0.2, percentage: 20 },
                { label: 'Rental Fee 3rd (10%)', amount: netRentalCost * 0.1, percentage: 10 },
            ];
        } else if (paymentType === 'monthly') {
            // Monthly payment including a portion of deposit
            const monthlyPayment = monthlyFee + managementFee;
            const depositPerMonth = depositFee / rentalDuration;
            const bookingPermonth = bookingFee / rentalDuration;
            const totalMonthly = monthlyPayment + depositPerMonth - bookingPermonth;

            breakdown = [
                {
                    label: `Monthly Payment × ${rentalDuration}`,
                    amount: totalMonthly,
                    percentage: null,
                },
                {
                    label: `Total Monthly Payment`,
                    amount: totalMonthly * rentalDuration,
                    percentage: null,
                },
            ];
        }

        return breakdown;
    };

    const paymentBreakdown = getPaymentBreakdown();

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

    return (
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
                        <span className="font-medium">{formatCurrency(rentalCost)}</span>
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
                                <p className="text-xs text-blue-600 dark:text-blue-400">*Total has been included by booking fee</p>
                            </>
                        ) : (
                            <>
                                <div className="flex justify-between font-medium text-blue-800 dark:text-blue-300">
                                    <span>Total Price</span>
                                    <span className="text-lg">{formatCurrency(netRentalCost)}</span>
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
    );
}
