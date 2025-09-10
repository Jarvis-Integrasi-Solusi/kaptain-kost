<?php

namespace App\Http\Controllers\Tenant\Rental;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use App\Models\Rental;
use App\Models\BookingFee;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class RecordController extends Controller
{
    public function index()
    {
        try {
            $user = Auth::user();

            $rentals = Rental::with(['room.roomCategory'])
                ->where('user_id', $user->id)
                ->orderBy('created_at', 'desc')
                ->get();

            return Inertia::render('tenant/rental/index', [
                'rentals' => $rentals,
            ]);
        } catch (\Exception $e) {
            Log::error('Error loading rentals: ' . $e->getMessage());

            return redirect()
                ->back()
                ->with('error', [
                    'title' => 'Error!',
                    'message' => 'An error occurred while loading rentals. Please try again.'
                ]);
        }
    }

    public function show($id)
    {
        try {
            $user = Auth::user();

            $rental = Rental::with([
                    'room.roomCategory',
                    'room.roomImages',
                    'user',
                    'rentalPeriod',
                    'paymentType',
                    'rentalPayments' => function($query) {
                        $query->orderBy('billing_date', 'asc');
                    },
                    'bookingFee',
                    'depositReturn'
                ])
                ->where('user_id', $user->id)
                ->where('id', $id)
                ->firstOrFail();

            // Calculate payment summary
            $totalPaid = $rental->rentalPayments
                ->where('payment_status', 'paid')
                ->sum('amount');

            $remainingBalance = max(0, $rental->total_price - $totalPaid);
            $paymentStatus = $remainingBalance <= 0 ? 'Paid' : 'Pending';
            $paymentProgress = $rental->total_price > 0
                ? ($totalPaid / $rental->total_price) * 100
                : 0;

            // Create payment summary
            $paymentSummary = [
                'total_price' => $rental->total_price,
                'total_paid' => $totalPaid,
                'remaining_balance' => $remainingBalance,
                'payment_status' => $paymentStatus,
                'payment_progress' => round($paymentProgress, 2),
            ];

            // Find next payment due (pending payments ordered by billing_date)
            $nextPayment = $rental->rentalPayments
                ->where('payment_status', 'pending')
                ->sortBy('billing_date')
                ->first();

            return Inertia::render('tenant/rental/show', [
                'rental' => $rental,
                'paymentSummary' => $paymentSummary,
                'nextPayment' => $nextPayment,
            ]);

        } catch (ModelNotFoundException $e) {
            return redirect()
                ->route('tenant.rental.index')
                ->with('error', [
                    'title' => 'Not Found!',
                    'message' => 'Rental record not found or you do not have access to it.'
                ]);
        } catch (\Exception $e) {
            Log::error('Error loading rental detail: ' . $e->getMessage());
            return redirect()
                ->back()
                ->with('error', [
                    'title' => 'Error!',
                    'message' => 'An error occurred while loading rental details. Please try again.'
                ]);
        }
    }
}
