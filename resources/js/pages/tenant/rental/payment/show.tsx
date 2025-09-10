import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type PageProps } from '@/types';
import { RentalPayment } from '@/types/rental-payment';
import { getPaymentStatusBadge, getRemainingTOPBadge } from '@/utils/badges';
import { formatCurrency, formatDate } from '@/utils/format';
import { getPaymentCategory } from '@/utils/type';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { CreditCard, FileImage, ImageIcon, QrCode, Upload, Wallet, X } from 'lucide-react';
import { useRef, useState } from 'react';

interface PaymentDetailProps extends PageProps {
    payment: RentalPayment;
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
        title: 'Payment',
    },
];

export default function PaymentDetail() {
    const { payment } = usePage<PaymentDetailProps>().props;
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
    const [showCashPaymentDialog, setShowCashPaymentDialog] = useState(false);
    const [proofImage, setProofImage] = useState<File | null>(null);
    const [proofImagePreview, setProofImagePreview] = useState<string | null>(null);
    const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});
    const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { setData, reset } = useForm({
        payment_proof: null as File | null,
    });

    const handlePaymentAction = () => {
        if (selectedPaymentMethod === 'payment_gateway') {
            // Handle payment gateway action
            console.log('Proceeding to payment gateway');
        } else if (selectedPaymentMethod === 'cash') {
            setShowCashPaymentDialog(true);
        }
    };

    const handleCashPaymentDialogClose = () => {
        setShowCashPaymentDialog(false);
        setProofImage(null);
        setProofImagePreview(null);
        setValidationErrors({});
        reset();
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleProofImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            // Validate file size (2MB = 2048KB)
            if (file.size > 2048 * 1024) {
                alert('File size exceeds 2MB. Please select a smaller file.');
                return;
            }

            // Validate file type
            if (!file.type.match(/^image\/(jpeg|png|jpg)$/)) {
                alert('Invalid file type. Please select a PNG, JPG, or JPEG image.');
                return;
            }

            setProofImage(file);
            setData('payment_proof', file);

            // Create preview
            const reader = new FileReader();
            reader.onload = (e) => {
                setProofImagePreview(e.target?.result as string);
            };
            reader.readAsDataURL(file);

            // Clear validation errors
            if (validationErrors.payment_proof) {
                const newErrors = { ...validationErrors };
                delete newErrors.payment_proof;
                setValidationErrors(newErrors);
            }
        }
    };

    const removeProofImage = () => {
        setProofImage(null);
        setProofImagePreview(null);
        setData('payment_proof', null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleCashPaymentSubmit = () => {
        if (!proofImage) {
            setValidationErrors({
                payment_proof: ['Payment proof is required.'],
            });
            return;
        }

        setIsSubmittingPayment(true);

        const formData = new FormData();
        formData.append('payment_proof', proofImage);
        formData.append('_method', 'POST');

        router.post(route('tenant.rental.payment.cash', payment.id), formData, {
            forceFormData: true,
            onSuccess: () => {
                setIsSubmittingPayment(false);
                handleCashPaymentDialogClose();
            },
            onError: (errors) => {
                setIsSubmittingPayment(false);
                // Convert Inertia errors to our expected format
                const formattedErrors: Record<string, string[]> = {};
                Object.keys(errors).forEach((key) => {
                    const error = errors[key];
                    formattedErrors[key] = Array.isArray(error) ? error : [error];
                });
                setValidationErrors(formattedErrors);
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Payment Detail - ${payment.rental.room.name}`} />

            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                <div className="p-4 pb-20 sm:p-6">
                    {/* Payment Details  */}
                    <Card className="mb-6">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-sm md:text-lg">Payment Information</CardTitle>
                            <span>{getPaymentStatusBadge(payment.payment_status)}</span>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-3">
                                <div className="flex justify-between text-xs md:text-sm">
                                    <span className="text-gray-600 dark:text-gray-400">Payment ID</span>
                                    <span className="font-medium">#{payment.id.toString().padStart(6, '0')}</span>
                                </div>

                                <div className="flex justify-between text-xs md:text-sm">
                                    <span className="text-gray-600 dark:text-gray-400">Room</span>
                                    <span className="font-medium">{payment.rental.room.name}</span>
                                </div>

                                <div className="flex justify-between text-xs md:text-sm">
                                    <span className="text-gray-600 dark:text-gray-400">Room Category</span>
                                    <span className="font-medium">{payment.rental.room.room_category.name}</span>
                                </div>

                                <Separator />

                                <div className="flex justify-between text-xs md:text-sm">
                                    <span className="text-gray-600 dark:text-gray-400">Payment Category</span>
                                    <span className="font-medium">{getPaymentCategory(payment.category)}</span>
                                </div>

                                <div className="flex justify-between text-xs md:text-sm">
                                    <span className="text-gray-600 dark:text-gray-400">Billing Date</span>
                                    <span className="font-medium">{formatDate(payment.billing_date)}</span>
                                </div>

                                <div className="flex justify-between text-xs md:text-sm">
                                    <span className="text-gray-600 dark:text-gray-400">Due Date</span>
                                    <span className="font-medium">{formatDate(payment.due_date)}</span>
                                </div>

                                <div className="flex justify-between text-xs md:text-sm">
                                    <span className="text-gray-600 dark:text-gray-400">Amount</span>
                                    <span className="font-medium">{formatCurrency(payment.amount)}</span>
                                </div>

                                <div className="flex justify-between text-xs md:text-sm">
                                    <span className="text-gray-600 dark:text-gray-400">Remaining TOP</span>
                                    <span>{getRemainingTOPBadge(payment.billing_date, payment.due_date, payment.payment_status)}</span>
                                </div>

                                {payment.payment_status === 'paid' && (
                                    <>
                                        <Separator />
                                        {payment.payment_method && (
                                            <div className="flex justify-between text-xs md:text-sm">
                                                <span className="text-gray-600 dark:text-gray-400">Payment Method</span>
                                                <span className="font-medium capitalize">{payment.payment_method.replace('_', ' ')}</span>
                                            </div>
                                        )}

                                        {payment.paid_at && (
                                            <div className="flex justify-between text-xs md:text-sm">
                                                <span className="text-gray-600 dark:text-gray-400">Paid Date</span>
                                                <span className="font-medium">{formatDate(payment.paid_at)}</span>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>

                            {/* Payment Proof */}
                            {payment.payment_proof && payment.payment_status !== 'unpaid' && (
                                <>
                                    <Separator />
                                    <div>
                                        <p className="mb-2 text-sm font-medium">Payment Proof</p>
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button variant="outline" size="sm" className="h-8 text-xs">
                                                    <FileImage className="mr-1 h-3 w-3" />
                                                    View
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="max-w-2xl">
                                                <DialogHeader>
                                                    <DialogTitle>Payment Proof</DialogTitle>
                                                </DialogHeader>
                                                <div className="flex justify-center">
                                                    <img
                                                        src={`/storage/${payment.payment_proof}`}
                                                        alt="Payment proof"
                                                        className="max-h-96 max-w-full rounded-lg border object-contain"
                                                    />
                                                </div>
                                            </DialogContent>
                                        </Dialog>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>

                    {/* Payment Method Selection - Only show if payment is pending */}
                    {payment.payment_status === 'unpaid' && (
                        <Card className="mb-6">
                            <CardHeader>
                                <CardTitle className="text-base md:text-lg">Choose Payment Method</CardTitle>
                                <CardDescription className="text-xs md:text-sm">Select your preferred payment method</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <RadioGroup value={selectedPaymentMethod} onValueChange={setSelectedPaymentMethod}>
                                    <div className="space-y-3">
                                        {/* Payment Gateway Option */}
                                        {payment.rental.company.doku_api_key && (
                                            <div className="flex items-center space-x-3 rounded-lg border p-4 hover:bg-gray-50 dark:hover:bg-gray-800">
                                                <RadioGroupItem value="payment_gateway" id="payment_gateway" />
                                                <Label htmlFor="payment_gateway" className="flex flex-1 cursor-pointer items-center gap-2">
                                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                                                        <QrCode className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="text-xs font-medium md:text-sm">Digital Payment</p>
                                                        <p className="mt-0.5 text-[8px] text-muted-foreground md:mt-1 md:text-xs">
                                                            Bank Transfer, Qris, E-wallet, etc.
                                                        </p>
                                                    </div>
                                                </Label>
                                            </div>
                                        )}

                                        {/* Cash Option */}
                                        <div className="flex items-center space-x-3 rounded-lg border p-4 hover:bg-gray-50 dark:hover:bg-gray-800">
                                            <RadioGroupItem value="cash" id="cash" />
                                            <Label htmlFor="cash" className="flex flex-1 cursor-pointer items-center gap-2">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                                                    <Wallet className="h-5 w-5 text-green-600 dark:text-green-400" />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-xs font-medium md:text-sm">Cash Payment</p>
                                                    <p className="mt-0.5 text-[8px] text-gray-500 md:mt-1 md:text-xs dark:text-gray-400">
                                                        Upload your proof of payment and wait for admin approval.
                                                    </p>
                                                </div>
                                            </Label>
                                        </div>
                                    </div>
                                </RadioGroup>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Fixed Bottom Action - Only show if payment is pending */}
                {payment.payment_status === 'unpaid' && (
                    <div className="fixed right-0 bottom-0 left-0 border-t bg-white p-4 sm:relative sm:bg-transparent sm:p-0 dark:border-gray-700 dark:bg-gray-800 sm:dark:bg-transparent">
                        <div className="mx-auto max-w-lg sm:max-w-none">
                            <Button className="w-full" size="lg" disabled={!selectedPaymentMethod} onClick={handlePaymentAction}>
                                <CreditCard className="mr-2 h-4 w-4" />
                                {selectedPaymentMethod === 'payment_gateway'
                                    ? 'Proceed to Payment Gateway'
                                    : selectedPaymentMethod === 'cash'
                                      ? 'Upload Payment Proof'
                                      : 'Select Payment Method'}
                            </Button>

                            {selectedPaymentMethod && (
                                <p className="mt-2 text-center text-xs text-gray-500 dark:text-gray-400">
                                    Amount to pay: <span className="font-medium">{formatCurrency(payment.amount)}</span>
                                </p>
                            )}
                        </div>
                    </div>
                )}

                {/* Cash Payment Dialog */}
                <AlertDialog open={showCashPaymentDialog} onOpenChange={handleCashPaymentDialogClose}>
                    <AlertDialogContent className="max-h-[90vh] w-[90%] !max-w-4xl overflow-y-auto">
                        <AlertDialogHeader>
                            <AlertDialogTitle>Cash Payment</AlertDialogTitle>
                        </AlertDialogHeader>

                        <div className="grid items-stretch gap-6 py-4 lg:grid-cols-2">
                            {/* Left Column */}
                            <div className="flex h-full flex-col justify-between space-y-6">
                                {/* Payment Information */}
                                <div className="space-y-3">
                                    <Label className="text-sm font-medium md:text-lg">Payment Information</Label>
                                    <div className="mt-0.5 h-full rounded-lg border bg-muted/50 p-4 md:mt-1">
                                        <div className="grid gap-2 text-xs md:text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Payment ID:</span>
                                                <span className="font-medium">#{payment.id.toString().padStart(6, '0')}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Room:</span>
                                                <span className="font-medium">{payment.rental.room.name}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Category:</span>
                                                <span className="font-medium">{getPaymentCategory(payment.category)}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Due Date:</span>
                                                <span className="font-medium">{formatDate(payment.due_date)}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Amount:</span>
                                                <span className="font-medium">{formatCurrency(payment.amount)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Upload Payment Proof */}
                                <div className="mt-2 space-y-4">
                                    <div className="space-y-2">
                                        <Label className="text-sm md:text-lg" htmlFor="payment_proof">
                                            Payment Proof *
                                        </Label>
                                        <div
                                            className="flex h-20 w-full cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-muted-foreground/25 transition-colors hover:border-muted-foreground/50"
                                            onClick={() => fileInputRef.current?.click()}
                                        >
                                            <Upload className="h-4 w-4 text-muted-foreground" />
                                            <div className="text-center text-xs text-muted-foreground">
                                                <span className="font-medium text-primary hover:text-primary/80">Upload payment proof</span>
                                                <p>PNG, JPG, JPEG up to 2MB</p>
                                            </div>
                                        </div>
                                        <input
                                            ref={fileInputRef}
                                            id="payment_proof"
                                            type="file"
                                            accept="image/jpeg,image/png,image/jpg"
                                            onChange={handleProofImageChange}
                                            className="hidden"
                                        />
                                        {validationErrors.payment_proof && (
                                            <p className="text-sm text-red-500">{validationErrors.payment_proof[0]}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Right Column */}
                            <div className="flex h-full flex-col">
                                <Label className="mb-2 text-sm font-medium">Proof Preview</Label>
                                <div className="flex-1">
                                    {proofImagePreview ? (
                                        <div className="relative h-64 w-full md:h-80">
                                            <img
                                                src={proofImagePreview}
                                                alt="Payment proof preview"
                                                className="h-full w-full rounded-lg border object-cover"
                                            />
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="sm"
                                                className="absolute top-2 right-2"
                                                onClick={removeProofImage}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="flex h-full min-h-80 w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-muted-foreground/25">
                                            <ImageIcon className="h-12 w-12 text-muted-foreground/50" />
                                            <p className="text-sm text-muted-foreground/70">No payment proof selected</p>
                                            <p className="text-xs text-muted-foreground/50">Upload an image to see preview here</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <AlertDialogFooter>
                            <AlertDialogCancel onClick={handleCashPaymentDialogClose}>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={handleCashPaymentSubmit}
                                disabled={isSubmittingPayment || !proofImage}
                                className="bg-green-600 hover:bg-green-700"
                            >
                                {isSubmittingPayment ? 'Submitting...' : 'Submit Payment Proof'}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </AppLayout>
    );
}
