<?php

namespace App\Http\Controllers\Manager\Rental;

use App\Http\Controllers\Controller;
use App\Models\RentalPayment;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    public function markAsPaid(Request $request, $id)
    {
        $rentalPayment = RentalPayment::find($id);

        $paymentDate = $request->validate([
            'paid_at' => 'required|date',
        ]);

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

        try {
            $rentalPayment->payment_status = 'paid';
            $rentalPayment->paid_at = $paymentDate['paid_at'];
            $rentalPayment->save();

            // change rental status to occupied if the payment is for booking fee
            if ($rentalPayment->category === 'booking_fee') {
                $rental = $rentalPayment->rental;
                $rental->status = 'occupied';
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
