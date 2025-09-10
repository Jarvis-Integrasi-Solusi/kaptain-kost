<?php

namespace App\Http\Controllers\Tenant\Rental;

use App\Http\Controllers\Controller;
use App\Models\RentalPayment;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class PaymentController extends Controller
{
    public function show($rentalId) {
        try {
            $user = Auth::user();

            $payment = RentalPayment::with([
                    'rental' => function($query) use ($user) {
                        $query->where('user_id', $user->id);
                    },
                    'rental.room.roomCategory',
                    'rental.company',
                    'rental.user',
                    'rental.rentalPeriod',
                    'rental.paymentType',
                ])
                ->where('id', $rentalId)
                ->firstOrFail();

            return Inertia::render('tenant/rental/payment/show', [
                'payment' => $payment,
            ]);

        } catch (ModelNotFoundException $e) {
            return redirect()
                ->back()
                ->with('error', [
                    'title' => 'Not Found!',
                    'message' => 'The requested payment record was not found.'
                ]);
        } catch (\Exception $e) {
            Log::error('Error loading rental detail: ' . $e->getMessage());
            return redirect()
                ->back()
                ->with('error', [
                    'title' => 'Error!',
                    'message' => 'An error occurred while loading rental payment details. Please try again.'
                ]);
        }
    }

    public function cashPayment($id, Request $request) 
    {
        try {
            $user = Auth::user();

            $payment = RentalPayment::with([
                    'rental' => function($query) use ($user) {
                        $query->where('user_id', $user->id);
                    },
                    'rental.room.roomCategory',
                    'rental.company',
                    'rental.user',
                    'rental.rentalPeriod',
                    'rental.paymentType',
                ])
                ->where('id', $id)
                ->firstOrFail();

            if ($payment->rental->user_id !== $user->id) {
                return redirect()
                    ->back()
                    ->with('error', [
                        'title' => 'Unauthorized',
                        'message' => 'You are not authorized to view this payment.'
                    ]);
            }

            $request->validate([
                'payment_proof' => 'required|image|max:2048',
            ]);

        $path = $request->file('payment_proof')->store('images/proof/rental', 'public');

            $payment->update([
                'paid_at' => now(),
                'payment_method' => 'cash',
                'payment_proof' => $path,
                'payment_status' => 'pending',
            ]);

            return redirect()->back()
                ->with('success', [
                    'title'   => 'Cash Payment Submitted',
                    'message' => "Your cash payment proof has been submitted and is pending verification."
                ]);

        } catch (ModelNotFoundException $e) {
            return redirect()
                ->back()
                ->with('error', [
                    'title' => 'Not Found!',
                    'message' => 'The requested payment record was not found.'
                ]);
        } catch (\Exception $e) {
            return redirect()
                ->back()
                ->with('error', [
                    'title' => 'Error!',
                    'message' => 'An error occurred while loading rental payment details. Please try again.'
                ]);
        }
    }
}
