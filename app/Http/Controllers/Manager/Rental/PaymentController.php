<?php

namespace App\Http\Controllers\Manager\Rental;

use App\Http\Controllers\Controller;
use App\Models\RentalPayment;

class PaymentController extends Controller
{
    public function markAsPaid( $id)
    {
        $rentalPayment = RentalPayment::find($id);


        if (!$rentalPayment) {
            return redirect()->back()
                ->with('error', [
                    'title' => 'Payment Not Found',
                    'message' => 'The specified payment record was not found.'
                ]);
        }

        if ($rentalPayment->payment_status === 'paid') {
            return redirect()->back()
                ->with('error', [
                    'title' => 'Payment Already Marked as Paid',
                    'message' => 'This payment record has already been marked as paid.'
                ]);
        }

        // change rental status to reserved


        try {
            $rentalPayment->payment_status = 'paid';
            $rentalPayment->paid_at = now();
            $rentalPayment->save();

            // change rental status to reserved
            if ($rentalPayment->category === 'booking_fee') {
                $rental = $rentalPayment->rental;
                $rental->status = 'reserved';
                $rental->save();
            }

            return redirect()->back()
                ->with('success', [
                    'title' => 'Payment Marked as Paid',
                    'message' => 'The payment has been successfully marked as paid.'
                ]);
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', [
                    'title' => 'Error!',
                    'message' => 'An error occurred while marking the payment as paid. Please try again.'
                ]);
        }
    }
}
