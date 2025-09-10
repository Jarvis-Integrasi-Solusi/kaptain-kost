<?php

namespace App\Http\Controllers\Manager\Rental;

use App\Http\Controllers\Controller;
use App\Models\BookingFee;
use App\Models\DepositReturn;
use App\Models\PaymentType;
use App\Models\Rental;
use App\Models\RentalPeriod;
use App\Models\Room;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Illuminate\Validation\ValidationException;



class RecordController extends Controller
{
    public function index(Request $request)
    {
        try {
            $user = Auth::user();

            $allRentals = Rental::with([
                    'room.roomCategory',
                    'user',
                    'rentalPeriod',
                    'paymentType'
                ])
                ->where('company_id', $user->company_id)
                ->orderBy('created_at', 'desc')
                ->get();

            return Inertia::render('manager/rental/index', [
                'rentals' => $allRentals,
                'filters' => [
                    'search' => $request->get('search', ''),
                ],
            ]);
        } catch (\Exception $e) {
            Log::error('Error loading rentals: ' . $e->getMessage());
            return redirect()
                ->back()
                ->with('error', [
                    'title' => 'Error!',
                    'message' => 'An error occurred while updating the room. Please try again.' . $e->getMessage()
                ]);
        }
    }

    public function create()
    {
        $user = Auth::user();
        
        // Get available rooms for this company
        $rooms = Room::with('roomCategory')
            ->whereHas('roomCategory', function ($query) use ($user) {
                $query->where('company_id', $user->company_id);
            })
            ->get();
            
        // Get tenants (users with tenant role) for this company
        $tenants = User::where('company_id', $user->company_id)
            ->where('role', 'tenant')
            ->select('id', 'name', 'email')
            ->get();
            
        // Get rental periods
        $rental_periods = RentalPeriod::all();
        
        // Get payment types
        $payment_types = PaymentType::all();

        // Get booking fee options
        $booking_fees = BookingFee::all();
        
        return Inertia::render('manager/rental/create', [
            'rooms' => $rooms,
            'tenants' => $tenants,
            'rental_periods' => $rental_periods,
            'payment_types' => $payment_types,
            'booking_fees' => $booking_fees,
        ]);
    }

    public function show(string $id)
    {
        try {
            $user = Auth::user();
            
            $rental = Rental::with([
                    'room.roomCategory',
                    'user',
                    'paymentType',
                    'rentalPeriod',
                    'rentalPayments',
                    'bookingFee',
                    'depositReturn'
                ])
                ->where('id', $id)
                ->where('company_id', $user->company_id)
                ->firstOrFail();

            // Calculate payment summary
            $totalPaid = $rental->rentalPayments()->where('payment_status', 'paid')->sum('amount');
            $remainingBalance = max(0, $rental->total_price - $totalPaid);            
            $paymentStatus = $remainingBalance <= 0 ? 'Paid' : 'Pending';
            
            // Calculate payment progress percentage
            $paymentProgress = $rental->total_price > 0 ? ($totalPaid / $rental->total_price) * 100 : 0;

            // Get booking fee options
            $booking_fees = BookingFee::all();

            return Inertia::render('manager/rental/show', [
                'rental' => $rental,
                'paymentSummary' => [
                    'total_price' => $rental->total_price,
                    'total_paid' => $totalPaid,
                    'remaining_balance' => $remainingBalance,
                    'payment_status' => $paymentStatus,
                    'payment_progress' => round($paymentProgress, 2),
                    'booking_fees' => $booking_fees
                ]
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return redirect()->route('manager.rental.record.index')
                ->with('error', [
                    'title' => 'Rental Not Found',
                    'message' => 'The specified rental record does not exist.'
                ]);
        } catch (\Exception $e) {
            Log::error('Error showing rental: ' . $e->getMessage());
            return redirect()->route('manager.rental.record.index')
                ->with('error', [
                    'title' => 'Error!',
                    'message' => 'An error occurred while loading the rental record. Please try again.'
                ]);
        }
    }


    public function store(Request $request)
    {
        $user = Auth::user();

        try {

            // Validate the request
            $validated = $request->validate([
                'user_id' => [
                    'required',
                    'integer',
                    'exists:users,id'
                ],
                'room_id' => [
                    'required',
                    'integer',
                    'exists:rooms,id'
                ],
                'rental_period_id' => [
                    'required',
                    'integer',
                    'exists:rental_periods,id'
                ],
                'payment_type_id' => [
                    'required',
                    'integer',
                    'exists:payment_types,id'
                ],
                'entry_date' => [
                    'required',
                    'date',
                    'after_or_equal:today'
                ],
                'booking_fee_id' => [
                    'nullable',
                    'exists:booking_fees,id'
                ],
                'is_down_payment_paid_full' => [
                    'boolean'
                ]
            ]);

            // Get the selected room and rental period for calculations
            $room = Room::with('roomCategory')->findOrFail($validated['room_id']);
            $rentalPeriod = RentalPeriod::findOrFail($validated['rental_period_id']);
            
            // Verify the room belongs to the user's company
            if ($room->roomCategory->company_id !== $user->company_id) {
                throw new \Exception('Room does not belong to your company.');
            }
            
            // Verify the tenant belongs to the user's company
            $tenant = User::where('id', $validated['user_id'])
                ->where('company_id', $user->company_id)
                ->where('role', 'tenant')
                ->first();
                
            if (!$tenant) {
                throw new \Exception('Invalid tenant selected.');
            }

            Log::info('Found tenant:', [$tenant->toArray()]);

            // Calculate exit date
            $entryDate = new \DateTime($validated['entry_date']);
            $exitDate = clone $entryDate;
            
            // Check which field exists in rental period
            $months = isset($rentalPeriod->month) ? $rentalPeriod->month : $rentalPeriod->duration_months;
            
            $exitDate->add(new \DateInterval('P' . $months . 'M'));

            // ===== RENTAL CONFLICT VALIDATIONS =====
            
            // 1. Check if tenant already has active rental in the same company during this period
            $existingTenantRental = Rental::where('user_id', $validated['user_id'])
                ->where('company_id', $user->company_id)
                ->where(function ($query) use ($entryDate, $exitDate) {
                    $query->where(function ($q) use ($entryDate, $exitDate) {
                        // Case 1: New rental starts during existing rental
                        $q->where('entry_date', '<=', $entryDate->format('Y-m-d'))
                        ->where('exit_date', '>', $entryDate->format('Y-m-d'));
                    })->orWhere(function ($q) use ($entryDate, $exitDate) {
                        // Case 2: New rental ends during existing rental
                        $q->where('entry_date', '<', $exitDate->format('Y-m-d'))
                        ->where('exit_date', '>=', $exitDate->format('Y-m-d'));
                    })->orWhere(function ($q) use ($entryDate, $exitDate) {
                        // Case 3: New rental completely encompasses existing rental
                        $q->where('entry_date', '>=', $entryDate->format('Y-m-d'))
                        ->where('exit_date', '<=', $exitDate->format('Y-m-d'));
                    });
                })
                ->with('room')
                ->first();

            if ($existingTenantRental) {
                return redirect()->back()
                    ->with('error', [
                        'title' => 'Tenant Already Has Active Rental',
                        'message' => "Tenant {$tenant->name} already has an active rental in room {$existingTenantRental->room->name} from {$existingTenantRental->entry_date} to {$existingTenantRental->exit_date}."
                    ])
                    ->withInput();
            }

            // 2. Check if room is already occupied during this period
            $existingRoomRental = Rental::where('room_id', $validated['room_id'])
                ->where(function ($query) use ($entryDate, $exitDate) {
                    $query->where(function ($q) use ($entryDate, $exitDate) {
                        // Case 1: New rental starts during existing rental
                        $q->where('entry_date', '<=', $entryDate->format('Y-m-d'))
                        ->where('exit_date', '>', $entryDate->format('Y-m-d'));
                    })->orWhere(function ($q) use ($entryDate, $exitDate) {
                        // Case 2: New rental ends during existing rental
                        $q->where('entry_date', '<', $exitDate->format('Y-m-d'))
                        ->where('exit_date', '>=', $exitDate->format('Y-m-d'));
                    })->orWhere(function ($q) use ($entryDate, $exitDate) {
                        // Case 3: New rental completely encompasses existing rental
                        $q->where('entry_date', '>=', $entryDate->format('Y-m-d'))
                        ->where('exit_date', '<=', $exitDate->format('Y-m-d'));
                    });
                })
                ->with('user')
                ->first();

            if ($existingRoomRental) {
                return redirect()->back()
                    ->with('error', [
                        'title' => 'Room Already Occupied',
                        'message' => "Room {$room->name} is already occupied by {$existingRoomRental->user->name} from {$existingRoomRental->entry_date} to {$existingRoomRental->exit_date}."
                    ])
                    ->withInput();
            }

            // 3. Check for potential booking conflicts (optional - if you have booking system)
            // You can add booking table validation here if needed
            // For now, we'll just check if there are any future rentals that might conflict
            
            $futureRoomRental = Rental::where('room_id', $validated['room_id'])
                ->where('entry_date', '>', $entryDate->format('Y-m-d'))
                ->where('entry_date', '<', $exitDate->format('Y-m-d'))
                ->with('user')
                ->first();

            if ($futureRoomRental) {
                return redirect()->back()
                    ->with('error', [
                        'title' => 'Room Booking Conflict',
                        'message' => "Room {$room->name} has a future booking by {$futureRoomRental->user->name} starting on {$futureRoomRental->entry_date}, which conflicts with your selected rental period ending on {$exitDate->format('Y-m-d')}."
                    ])
                    ->withInput();
            }

            // ===== END OF CONFLICT VALIDATIONS =====

            // Calculate total price
            $monthlyFee = $room->roomCategory->monthly_rental_fee;
            $managementFee = $room->roomCategory->management_fee;
            $depositFee = $room->roomCategory->deposit_fee;
            $totalMonthlyFee = $monthlyFee + $managementFee;
            $totalRentalFee = $totalMonthlyFee * $months;
            $totalPrice = $depositFee + $totalRentalFee;


            // Prepare rental data
            $rentalData = [
                'company_id' => $user->company_id,
                'user_id' => $validated['user_id'],
                'room_id' => $validated['room_id'],
                'rental_period_id' => $validated['rental_period_id'],
                'payment_type_id' => $validated['payment_type_id'],
                'entry_date' => $validated['entry_date'],
                'exit_date' => $exitDate->format('Y-m-d'),
                'total_price' => $totalPrice,
                'booking_fee_id' => $validated['booking_fee_id'],
                'is_down_payment_paid_full' => $validated['is_down_payment_paid_full'] ?? false
            ];

            // Create the rental record
            $rental = Rental::create($rentalData);

            return redirect()->route('manager.rental.record.index')
                ->with('success', [
                    'title' => 'Rental Record Created!',
                    'message' => "Rental record for {$tenant->name} in room {$room->name} has been created successfully."
                ]);

        } catch (ValidationException $e) {
            Log::info('Validation error during rental creation: ' . $e);
            return back()
                ->withErrors($e->errors())
                ->withInput();
        } catch (\Exception $e) {
            return back()
                ->with('error', [
                    'title' => 'Error!',
                    'message' => 'An error occurred while creating the rental record: ' . $e->getMessage()
                ])
                ->withInput();
        }
    }

    public function destroy(string $id)
    {
        Try {
            $user = Auth::user();
            $rental = Rental::where('id', $id)
                ->where('company_id', $user->company_id)
                ->firstOrFail();

            $rental->delete();

            return redirect()->route('manager.rental.record.index')
                ->with('success', [
                    'title' => 'Rental Deleted',
                    'message' => "Rental record has been deleted successfully."
                ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return back()->with('error', [
                'title' => 'Rental Not Found',
                'message' => 'The specified rental record does not exist.'
            ]);
        } catch (\Exception $e) {
            Log::info('error ' . $e);
            return back()->with('error', [
                'title' => 'Error!',
                'message' => 'An error occurred while deleting the rental record. Please try again.'
            ]);
        }
    }

    public function edit(string $id)
    {
        try {
            $user = Auth::user();
            
            // Get the rental record with relations
            $rental = Rental::with([
                    'room.roomCategory',
                    'user',
                    'paymentType',
                    'rentalPeriod',
                ])
                ->where('id', $id)
                ->where('company_id', $user->company_id)
                ->firstOrFail();

            // Get available rooms for this company
            $rooms = Room::with('roomCategory')
                ->whereHas('roomCategory', function ($query) use ($user) {
                    $query->where('company_id', $user->company_id);
                })
                ->get();
                
            // Get tenants (users with tenant role) for this company
            $tenants = User::where('company_id', $user->company_id)
                ->where('role', 'tenant')
                ->select('id', 'name', 'email')
                ->get();
                
            // Get rental periods
            $rental_periods = RentalPeriod::all();
            
            // Get payment types
            $payment_types = PaymentType::all();

            // Get booking fees
            $booking_fees = BookingFee::all();

            return Inertia::render('manager/rental/edit', [
                'rental' => $rental,
                'rooms' => $rooms,
                'tenants' => $tenants,
                'rental_periods' => $rental_periods,
                'payment_types' => $payment_types,
                'booking_fees' => $booking_fees,
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return redirect()->route('manager.rental.record.index')
                ->with('error', [
                    'title' => 'Rental Not Found',
                    'message' => 'The specified rental record does not exist.'
                ]);
        } catch (\Exception $e) {
            Log::error('Error loading rental for edit: ' . $e->getMessage());
            return redirect()->route('manager.rental.record.index')
                ->with('error', [
                    'title' => 'Error!',
                    'message' => 'An error occurred while loading the rental record. Please try again.'
                ]);
        }
    }

    public function update(Request $request, string $id)
    {
        $user = Auth::user();

        try {
            // Find the rental record
            $rental = Rental::where('id', $id)
                ->where('company_id', $user->company_id)
                ->firstOrFail();

            if ($rental->status !== 'booked') {
                return redirect()->route('manager.rental.record.index')
                    ->with('error', [
                        'title' => 'Room Already Occupied',
                        'message' => "Payment data can't be updated, please recreate the rental."
                    ])
                    ->withInput();
            }

            // Validate the request
            $validated = $request->validate([
                'user_id' => [
                    'required',
                    'integer',
                    'exists:users,id'
                ],
                'room_id' => [
                    'required',
                    'integer',
                    'exists:rooms,id'
                ],
                'rental_period_id' => [
                    'required',
                    'integer',
                    'exists:rental_periods,id'
                ],
                'payment_type_id' => [
                    'required',
                    'integer',
                    'exists:payment_types,id'
                ],
                'entry_date' => [
                    'required',
                    'date'
                ],
                'is_down_payment_paid_full' => [
                    'boolean'
                ]

            ]);

            // Get the selected room and rental period for calculations
            $room = Room::with('roomCategory')->findOrFail($validated['room_id']);
            $rentalPeriod = RentalPeriod::findOrFail($validated['rental_period_id']);
            
            // Verify the room belongs to the user's company
            if ($room->roomCategory->company_id !== $user->company_id) {
                throw new \Exception('Room does not belong to your company.');
            }
            
            // Verify the tenant belongs to the user's company
            $tenant = User::where('id', $validated['user_id'])
                ->where('company_id', $user->company_id)
                ->where('role', 'tenant')
                ->first();
                
            if (!$tenant) {
                throw new \Exception('Invalid tenant selected.');
            }

            // Calculate exit date
            $entryDate = new \DateTime($validated['entry_date']);
            $exitDate = clone $entryDate;
            
            // Check which field exists in rental period
            $months = isset($rentalPeriod->month) ? $rentalPeriod->month : $rentalPeriod->duration_months;
            
            $exitDate->add(new \DateInterval('P' . $months . 'M'));

            // ===== RENTAL CONFLICT VALIDATIONS (excluding current rental) =====
            
            // 1. Check if tenant already has active rental in the same company during this period
            $existingTenantRental = Rental::where('user_id', $validated['user_id'])
                ->where('company_id', $user->company_id)
                ->where('id', '!=', $rental->id) // Exclude current rental
                ->where(function ($query) use ($entryDate, $exitDate) {
                    $query->where(function ($q) use ($entryDate, $exitDate) {
                        // Case 1: New rental starts during existing rental
                        $q->where('entry_date', '<=', $entryDate->format('Y-m-d'))
                        ->where('exit_date', '>', $entryDate->format('Y-m-d'));
                    })->orWhere(function ($q) use ($entryDate, $exitDate) {
                        // Case 2: New rental ends during existing rental
                        $q->where('entry_date', '<', $exitDate->format('Y-m-d'))
                        ->where('exit_date', '>=', $exitDate->format('Y-m-d'));
                    })->orWhere(function ($q) use ($entryDate, $exitDate) {
                        // Case 3: New rental completely encompasses existing rental
                        $q->where('entry_date', '>=', $entryDate->format('Y-m-d'))
                        ->where('exit_date', '<=', $exitDate->format('Y-m-d'));
                    });
                })
                ->with('room')
                ->first();

            if ($existingTenantRental) {
                return redirect()->back()
                    ->with('error', [
                        'title' => 'Tenant Already Has Active Rental',
                        'message' => "Tenant {$tenant->name} already has an active rental in room {$existingTenantRental->room->name} from {$existingTenantRental->entry_date} to {$existingTenantRental->exit_date}."
                    ])
                    ->withInput();
            }

            // 2. Check if room is already occupied during this period
            $existingRoomRental = Rental::where('room_id', $validated['room_id'])
                ->where('id', '!=', $rental->id) // Exclude current rental
                ->where(function ($query) use ($entryDate, $exitDate) {
                    $query->where(function ($q) use ($entryDate, $exitDate) {
                        // Case 1: New rental starts during existing rental
                        $q->where('entry_date', '<=', $entryDate->format('Y-m-d'))
                        ->where('exit_date', '>', $entryDate->format('Y-m-d'));
                    })->orWhere(function ($q) use ($entryDate, $exitDate) {
                        // Case 2: New rental ends during existing rental
                        $q->where('entry_date', '<', $exitDate->format('Y-m-d'))
                        ->where('exit_date', '>=', $exitDate->format('Y-m-d'));
                    })->orWhere(function ($q) use ($entryDate, $exitDate) {
                        // Case 3: New rental completely encompasses existing rental
                        $q->where('entry_date', '>=', $entryDate->format('Y-m-d'))
                        ->where('exit_date', '<=', $exitDate->format('Y-m-d'));
                    });
                })
                ->with('user')
                ->first();

            if ($existingRoomRental) {
                return redirect()->back()
                    ->with('error', [
                        'title' => 'Room Already Occupied',
                        'message' => "Room {$room->name} is already occupied by {$existingRoomRental->user->name} from {$existingRoomRental->entry_date} to {$existingRoomRental->exit_date}."
                    ])
                    ->withInput();
            }

            // 3. Check for potential booking conflicts with future rentals
            $futureRoomRental = Rental::where('room_id', $validated['room_id'])
                ->where('id', '!=', $rental->id) // Exclude current rental
                ->where('entry_date', '>', $entryDate->format('Y-m-d'))
                ->where('entry_date', '<', $exitDate->format('Y-m-d'))
                ->with('user')
                ->first();

            if ($futureRoomRental) {
                return redirect()->back()
                    ->with('error', [
                        'title' => 'Room Booking Conflict',
                        'message' => "Room {$room->name} has a future booking by {$futureRoomRental->user->name} starting on {$futureRoomRental->entry_date}, which conflicts with your updated rental period ending on {$exitDate->format('Y-m-d')}. Please choose a shorter rental period or different room."
                    ])
                    ->withInput();
            }

            // ===== END OF CONFLICT VALIDATIONS =====

            // Calculate total price
            $monthlyFee = $room->roomCategory->monthly_rental_fee;
            $managementFee = $room->roomCategory->management_fee;
            $depositFee = $room->roomCategory->deposit_fee;
            $totalMonthlyFee = $monthlyFee + $managementFee;
            $totalRentalFee = $totalMonthlyFee * $months;
            $totalPrice = $depositFee + $totalRentalFee;


            // Prepare rental data for update
            $updateData = [
                'user_id' => $validated['user_id'],
                'room_id' => $validated['room_id'],
                'rental_period_id' => $validated['rental_period_id'],
                'payment_type_id' => $validated['payment_type_id'],
                'entry_date' => $validated['entry_date'],
                'exit_date' => $exitDate->format('Y-m-d'),
                'total_price' => $totalPrice,
                'is_down_payment_paid_full' => $validated['is_down_payment_paid_full'] ?? false
            ];

            // Update the rental record
            $rental->update($updateData);

            // recreate rental payment data 
            $rental->rentalPayments()->delete();
            $rental->createPaymentRecords();

            
            return redirect()->route('manager.rental.record.show', $rental->id)
                ->with('success', [
                    'title' => 'Rental Record Updated!',
                    'message' => "Rental record for {$tenant->name} in room {$room->name} has been updated successfully."
                ]);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return redirect()->route('manager.rental.record.index')
                ->with('error', [
                    'title' => 'Rental Not Found',
                    'message' => 'The specified rental record does not exist.'
                ]);
        } catch (ValidationException $e) {
            Log::info('Validation error during rental update: ' . $e);
            return back()
                ->withErrors($e->errors())
                ->withInput();
        } catch (\Exception $e) {
            Log::error('Error updating rental: ' . $e->getMessage(), [
                'rental_id' => $id,
                'user_id' => $user->id,
                'request_data' => $validated ?? $request->all()
            ]);
            return back()
                ->with('error', [
                    'title' => 'Error!',
                    'message' => 'An error occurred while updating the rental record: ' . $e->getMessage()
                ])
                ->withInput();
        }
    }

    public function terminate(string $id) 
    {
        $user = Auth::user();

        $rental = Rental::where('id', $id)
            ->where('company_id', $user->company_id)
            ->firstOrFail();

        if ($rental->status === 'terminated') {
            return redirect()->back()
                ->with('error', [
                    'title' => 'Rental Already Terminated',
                    'message' => 'This rental record has already been terminated.'
                ]);
        }

        try {
            $rental->status = 'terminated';
            $rental->save();

            return redirect()->back()
                ->with('success', [
                    'title' => 'Rental Terminated',
                    'message' => 'The rental has been successfully terminated.'
                ]);
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', [
                    'title' => 'Error!',
                    'message' => 'An error occurred while terminating the rental. Please try again.'
                ]);
        }
    }

    public function returnDeposit(Request $request, $id)
    {
        $user = Auth::user();

        try {
            // Validasi input
            $validated = $request->validate([
                'returned_at' => [
                    'required',
                    'date',
                    'after_or_equal:' . now()->toDateString(),
                ],
                'proof_image' => [
                    'required',
                    'image',
                    'mimes:jpeg,png,jpg',
                    'max:2048',
                ],
            ]);

            $rental = Rental::with('user', 'room')->findOrFail($id);

            $path = $request->file('proof_image')->store('images/proof/deposit', 'public');

            $depositReturn = DepositReturn::create([
                'rental_id'    => $rental->id,
                'returned_at'  => $validated['returned_at'],
                'proof_image'  => $path,
            ]);

            $rental->update([
                'is_deposit_returned' => true,
                'status' => 'completed'
            ]);

            return redirect()->back()
                ->with('success', [
                    'title'   => 'Deposit Returned!',
                    'message' => "Deposit for {$rental->user->name} in room {$rental->room->name} has been returned successfully."
                ]);
        } catch (ValidationException $e) {
            Log::info('deposit return validation error: ' . $e);
            return back()
                ->withErrors($e->errors())
                ->withInput();
        } catch (\Exception $e) {
            return back()
                ->with('error', [
                    'title' => 'Error!',
                    'message' => 'Failed to return deposit: ' . $e->getMessage()
                ])
                ->withInput();
        }
    }
}