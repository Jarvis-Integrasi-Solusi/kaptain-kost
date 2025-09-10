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
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { User } from '@/types';
import { Rental } from '@/types/rental';
import { getPaymentStatusBadge, getRemainingTOPBadge } from '@/utils/badges';
import { formatCurrency, formatDate } from '@/utils/format';
import { router } from '@inertiajs/react';
import { CreditCard, ImageIcon, RotateCcw, Upload, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface RentalPaymentHistoryProps {
    rental: Rental;
    paymentStatus: string;
    tenant: User;
}

export default function RentalPaymentHistory({ rental, paymentStatus, tenant }: RentalPaymentHistoryProps) {
    const [selectedPaymentId, setSelectedPaymentId] = useState<number | null>(null);
    const [isMarkingPaid, setIsMarkingPaid] = useState(false);
    const [paidAtDate, setPaidAtDate] = useState('');
    const [showReturnDepositDialog, setShowReturnDepositDialog] = useState(false);
    const [returnDepositDate, setReturnDepositDate] = useState('');
    const [isReturningDeposit, setIsReturningDeposit] = useState(false);
    const [proofImage, setProofImage] = useState<File | null>(null);
    const [proofImagePreview, setProofImagePreview] = useState<string>('');
    const [validationErrors, setValidationErrors] = useState<{ [key: string]: string[] }>({});

    // Set default date to today when dialog opens
    useEffect(() => {
        if (selectedPaymentId) {
            const today = new Date();
            const formattedDate = today.toISOString().split('T')[0]; // Format: YYYY-MM-DD
            setPaidAtDate(formattedDate);
        }
    }, [selectedPaymentId]);

    // Set default date for return deposit dialog - must be today or future
    useEffect(() => {
        if (showReturnDepositDialog) {
            const today = new Date();
            const formattedDate = today.toISOString().split('T')[0];
            setReturnDepositDate(formattedDate);
        }
    }, [showReturnDepositDialog]);

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

    // Handle image upload for proof
    const handleProofImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Clear previous validation errors
        setValidationErrors((prev) => ({ ...prev, proof_image: [] }));

        // Validate file type
        if (!file.type.startsWith('image/')) {
            setValidationErrors((prev) => ({ ...prev, proof_image: ['Please select a valid image file (PNG, JPG, JPEG).'] }));
            return;
        }

        // Validate file size (2MB)
        if (file.size > 2 * 1024 * 1024) {
            setValidationErrors((prev) => ({ ...prev, proof_image: ['File size must be less than 2MB.'] }));
            return;
        }

        setProofImage(file);

        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setProofImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    // Remove proof image
    const removeProofImage = () => {
        setProofImage(null);
        setProofImagePreview('');
        setValidationErrors((prev) => ({ ...prev, proof_image: [] }));
    };

    // Get deposit amount from rental
    const getDepositAmount = () => {
        return rental.room?.room_category?.deposit_fee || 0;
    };

    // Validate return date
    const validateReturnDate = (date: string) => {
        const today = new Date().toISOString().split('T')[0];
        if (date < today) {
            setValidationErrors((prev) => ({ ...prev, return_date: ['Return date must be today or in the future.'] }));
            return false;
        }
        setValidationErrors((prev) => ({ ...prev, return_date: [] }));
        return true;
    };

    // Handle Mark as Paid with date
    const handleMarkAsPaid = (id: number) => {
        setIsMarkingPaid(true);
        router.post(
            `/manager/rental/payment/${id}/mark-as-paid`,
            {
                paid_at: paidAtDate,
            },
            {
                onSuccess: () => {
                    setSelectedPaymentId(null);
                    setIsMarkingPaid(false);
                    setPaidAtDate('');
                },
                onError: () => {
                    setIsMarkingPaid(false);
                },
            },
        );
    };

    // Handle Return Deposit
    const handleReturnDeposit = () => {
        // Clear previous errors
        setValidationErrors({});

        // Client-side validation
        let hasErrors = false;

        if (!returnDepositDate) {
            setValidationErrors((prev) => ({ ...prev, return_date: ['Return date is required.'] }));
            hasErrors = true;
        } else if (!validateReturnDate(returnDepositDate)) {
            hasErrors = true;
        }

        if (!proofImage) {
            setValidationErrors((prev) => ({ ...prev, proof_image: ['Proof of transfer image is required.'] }));
            hasErrors = true;
        }

        if (hasErrors) return;

        setIsReturningDeposit(true);

        const formData = new FormData();
        formData.append('returned_at', returnDepositDate);
        if (proofImage) {
            formData.append('proof_image', proofImage);
        }

        router.post(`/manager/rental/${rental.id}/return-deposit`, formData, {
            onSuccess: () => {
                setShowReturnDepositDialog(false);
                setIsReturningDeposit(false);
                setReturnDepositDate('');
                setProofImage(null);
                setProofImagePreview('');
                setValidationErrors({});
            },
            onError: (errors) => {
                setIsReturningDeposit(false);
                // Convert Inertia errors to our expected format
                const formattedErrors: { [key: string]: string[] } = {};
                Object.keys(errors).forEach((key) => {
                    const error = errors[key];
                    formattedErrors[key] = Array.isArray(error) ? error : [error];
                });
                setValidationErrors(formattedErrors);
            },
        });
    };

    // Handle dialog close
    const handleDialogClose = () => {
        setSelectedPaymentId(null);
        setPaidAtDate('');
    };

    // Handle return deposit dialog close
    const handleReturnDepositDialogClose = () => {
        setShowReturnDepositDialog(false);
        setReturnDepositDate('');
        setProofImage(null);
        setProofImagePreview('');
        setValidationErrors({});
    };

    // Handle return date change with validation
    const handleReturnDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const date = e.target.value;
        setReturnDepositDate(date);
        if (date) {
            validateReturnDate(date);
        }
    };

    return (
        <>
            <Card className="w-full overflow-x-auto">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Payment Bills</CardTitle>
                            <CardDescription>All payments made for this rental</CardDescription>
                        </div>
                        {paymentStatus?.toLowerCase() === 'paid' && !rental.is_deposit_returned && (
                            <Button variant="outline" size="sm" onClick={() => setShowReturnDepositDialog(true)} className="flex items-center gap-2">
                                <RotateCcw className="h-4 w-4" />
                                Return Deposit
                            </Button>
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Billing Date</TableHead>
                                    <TableHead>Due Date</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead className="md:table-cell">Remaining TOP</TableHead>
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
                                            <TableCell>{formatDate(payment.due_date)}</TableCell>
                                            <TableCell className="font-semibold">{formatCurrency(payment.amount)}</TableCell>
                                            <TableCell className="md:table-cell">
                                                {getRemainingTOPBadge(payment.billing_date, payment.due_date, payment.payment_status)}
                                            </TableCell>
                                            <TableCell>{getPaymentStatusBadge(payment.payment_status)}</TableCell>
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

            {/* Alert Dialog for Mark as Paid */}
            <AlertDialog open={!!selectedPaymentId} onOpenChange={handleDialogClose}>
                <AlertDialogContent className="max-w-2xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Mark Payment as Paid</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will update the status of this payment record to <strong>Paid</strong>. Please select the payment date.
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <div className="grid gap-4 py-4">
                        {/* Payment Proof Image */}
                        {selectedPaymentId && rental.rental_payments.find((p) => p.id === selectedPaymentId)?.payment_proof && (
                            <div className="space-y-2">
                                <Label>Payment Proof</Label>
                                <div className="flex justify-center">
                                    <img
                                        src={`/storage/${rental.rental_payments.find((p) => p.id === selectedPaymentId)?.payment_proof}`}
                                        alt="Payment proof"
                                        className="max-h-80 max-w-full rounded-lg border object-contain"
                                    />
                                </div>
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="paid_at">Paid At</Label>
                            <Input
                                id="paid_at"
                                type="date"
                                value={paidAtDate}
                                onChange={(e) => setPaidAtDate(e.target.value)}
                                className="w-full"
                                required
                            />
                        </div>
                    </div>

                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={handleDialogClose}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => selectedPaymentId && handleMarkAsPaid(selectedPaymentId)}
                            disabled={isMarkingPaid || !paidAtDate}
                            className="bg-green-600 hover:bg-green-700"
                        >
                            {isMarkingPaid ? 'Marking...' : 'Mark as Paid'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            
            {/* Alert Dialog for Return Deposit */}
            <AlertDialog open={showReturnDepositDialog} onOpenChange={handleReturnDepositDialogClose}>
                <AlertDialogContent className="max-h-[90vh] w-[90%] !max-w-4xl overflow-y-auto">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Return Deposit</AlertDialogTitle>
                        <AlertDialogDescription>
                            Return deposit to <strong>{tenant.name}</strong>. Please provide the return date and proof of transfer.
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <div className="grid items-stretch gap-6 py-4 lg:grid-cols-2">
                        {/* Left Column */}
                        <div className="flex h-full flex-col justify-between space-y-6">
                            {/* Tenant Bank Information */}
                            <div className="space-y-3">
                                <Label className="text-sm font-medium">Tenant Bank Information</Label>
                                <div className="h-full rounded-lg border bg-muted/50 p-4">
                                    <div className="grid gap-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Account Holder:</span>
                                            <span className="font-medium">{tenant.bank_account_holder || '-'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Bank Name:</span>
                                            <span className="font-medium">{tenant.bank_name || '-'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Account Number:</span>
                                            <span className="font-medium">{tenant.bank_account_number || '-'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Deposit Amount:</span>
                                            <span className="font-medium">{formatCurrency(getDepositAmount())}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Return Date and Proof of Transfer */}
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="return_date">Return Date *</Label>
                                    <Input
                                        id="return_date"
                                        type="date"
                                        value={returnDepositDate}
                                        onChange={handleReturnDateChange}
                                        className="w-full"
                                        min={new Date().toISOString().split('T')[0]} // Prevent past dates
                                        required
                                    />
                                    {validationErrors.return_date && <p className="text-sm text-red-500">{validationErrors.return_date[0]}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="proof_image">Proof of Transfer *</Label>
                                    <div className="flex h-20 w-full flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-muted-foreground/25 transition-colors hover:border-muted-foreground/50">
                                        <Upload className="h-4 w-4 text-muted-foreground" />
                                        <div className="text-center text-xs text-muted-foreground">
                                            <label htmlFor="proof_image" className="cursor-pointer font-medium text-primary hover:text-primary/80">
                                                Upload proof
                                            </label>
                                            <p>PNG, JPG, JPEG up to 2MB</p>
                                        </div>
                                    </div>
                                    <input
                                        id="proof_image"
                                        type="file"
                                        accept="image/jpeg,image/png,image/jpg"
                                        onChange={handleProofImageChange}
                                        className="hidden"
                                    />
                                    {validationErrors.proof_image && <p className="text-sm text-red-500">{validationErrors.proof_image[0]}</p>}
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
                                            alt="Proof of transfer"
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
                                        <p className="text-sm text-muted-foreground/70">No proof image selected</p>
                                        <p className="text-xs text-muted-foreground/50">Upload an image to see preview here</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={handleReturnDepositDialogClose}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleReturnDeposit}
                            disabled={isReturningDeposit || !returnDepositDate || !proofImage}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            {isReturningDeposit ? 'Processing...' : 'Return Deposit'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
