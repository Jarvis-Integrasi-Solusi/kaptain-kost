import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { PaymentSummary as PaymentSummaryType } from '@/types/payment-summary';
import { getPaymentStatusBadge } from '@/utils/badges';
import { formatCurrency } from '@/utils/format';

interface PaymentSummaryProps {
    paymentSummary: PaymentSummaryType;
}

export default function PaymentSummary({ paymentSummary }: PaymentSummaryProps) {
    // Simplified badge function

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-lg">Payment Summary</CardTitle>
                    </div>
                    {getPaymentStatusBadge(paymentSummary.payment_status)}
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
    );
}
