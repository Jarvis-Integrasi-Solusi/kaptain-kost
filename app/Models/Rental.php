<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class Rental extends Model
{
    protected $table = 'rentals';
    protected $guarded = ['id', 'created_at', 'updated_at'];

    protected static function booted()
    {
        static::created(function ($rental) {
            $rental->createPaymentRecords();
        });
    }


public function createPaymentRecords()
{
    $this->load(['room.roomCategory', 'rentalPeriod', 'paymentType', 'bookingFee']);
    
    $roomCategory = $this->room->roomCategory;
    $rentalPeriod = $this->rentalPeriod;
    $paymentType = $this->paymentType;
    $bookingFee = $this->bookingFee;
    
    $entryDate = Carbon::parse($this->entry_date);
    $payments = [];

    Log::info("🔹 Start creating payments", [
        'rental_id' => $this->id,
        'payment_type' => $paymentType->name,
        'entry_date' => $entryDate->toDateString(),
    ]);

    // 1. Deposit Fee
    $payments[] = [
        'rental_id' => $this->id,
        'billing_date' => $entryDate->toDateString(),
        'amount' => $roomCategory->deposit_fee,
        'category' => 'deposit_fee',
        'payment_status' => 'unpaid',
        'payment_method' => null,
        'paid_at' => null,
        'created_at' => now(),
        'updated_at' => now()
    ];
    Log::info("✅ Deposit fee added", [
        'amount' => $roomCategory->deposit_fee,
    ]);

    // 2. Booking Fee
    if ($bookingFee) {
        $payments[] = [
            'rental_id' => $this->id,
            'billing_date' => $entryDate->toDateString(),
            'amount' => $bookingFee->amount,
            'category' => 'booking_fee',
            'payment_status' => 'unpaid',
            'payment_method' => null,
            'paid_at' => null,
            'created_at' => now(),
            'updated_at' => now()
        ];
        Log::info("✅ Booking fee added", [
            'amount' => $bookingFee->amount,
        ]);
    }

    // Kalkulasi
    $rentalMonths = $rentalPeriod->month;
    $totalRentalCost = ($roomCategory->monthly_rental_fee + $roomCategory->management_fee) * $rentalMonths;
    $bookingFeeAmount = $bookingFee ? $bookingFee->amount : 0;
    $netRentalCost = $totalRentalCost - $bookingFeeAmount;

    Log::info("💰 Rental calculation", [
        'months' => $rentalMonths,
        'total_rental_cost' => $totalRentalCost,
        'booking_fee' => $bookingFeeAmount,
        'net_rental_cost' => $netRentalCost,
    ]);

    // 3. Payment Type Handling
    if ($paymentType->name === 'Cash') {
        $payments = array_merge($payments, $this->createCashPayments($entryDate, $netRentalCost));
    } elseif ($paymentType->name === 'Partial') {
        $payments = array_merge($payments, $this->createPartialPayments($entryDate, $netRentalCost));
    } elseif ($paymentType->name === 'Monthly') {
        $payments = array_merge($payments, $this->createMonthlyPayments($entryDate, $roomCategory, $rentalMonths));
    }

    // Insert
    if (!empty($payments)) {
        DB::table('rental_payments')->insert($payments);
        Log::info("🎉 Inserted payment records", [
            'rental_id' => $this->id,
            'count' => count($payments)
        ]);
    }
}

private function createCashPayments($entryDate, $netRentalCost)
{
    $payments = [];

    if ($this->is_down_payment_paid_full) {
        $payments[] = [
            'rental_id' => $this->id,
            'billing_date' => $entryDate->toDateString(),
            'amount' => $netRentalCost,
            'category' => 'down_payment_fee',
            'payment_status' => 'unpaid',
            'payment_method' => null,
            'paid_at' => null,
            'created_at' => now(),
            'updated_at' => now()
        ];
        Log::info("💳 Cash full DP created", ['amount' => $netRentalCost]);
    } else {
        $downPaymentAmount = $netRentalCost * 0.5;
        $remainingAmount = $netRentalCost * 0.5;

        $payments[] = [
            'rental_id' => $this->id,
            'billing_date' => $entryDate->toDateString(),
            'amount' => $downPaymentAmount,
            'category' => 'down_payment_fee',
            'payment_status' => 'unpaid',
            'payment_method' => null,
            'paid_at' => null,
            'created_at' => now(),
            'updated_at' => now()
        ];
        Log::info("💳 Cash DP 50% created", ['amount' => $downPaymentAmount]);

        $payments[] = [
            'rental_id' => $this->id,
            'billing_date' => $entryDate->copy()->addMonth()->toDateString(),
            'amount' => $remainingAmount,
            'category' => 'rental_fee',
            'payment_status' => 'unpaid',
            'payment_method' => null,
            'paid_at' => null,
            'created_at' => now(),
            'updated_at' => now()
        ];
        Log::info("💳 Cash remaining 50% created", ['amount' => $remainingAmount]);
    }

    return $payments;
}

private function createPartialPayments($entryDate, $netRentalCost)
{
    $payments = [];

    $downPaymentAmount = $netRentalCost * 0.5;

    $payments[] = [
        'rental_id' => $this->id,
        'billing_date' => $entryDate->toDateString(),
        'amount' => $downPaymentAmount,
        'category' => 'down_payment_fee',
        'payment_status' => 'unpaid',
        'payment_method' => null,
        'paid_at' => null,
        'created_at' => now(),
        'updated_at' => now()
    ];
    Log::info("💳 Partial DP 50% created", ['amount' => $downPaymentAmount]);

    $partialPercentages = [20.00, 20.00, 10.00];
    for ($i = 0; $i < 3; $i++) {
        $amount = $netRentalCost * ($partialPercentages[$i] / 100);
        $billingDate = $entryDate->copy()->addMonths($i + 1);

        $payments[] = [
            'rental_id' => $this->id,
            'billing_date' => $billingDate->toDateString(),
            'amount' => $amount,
            'category' => 'rental_fee',
            'payment_status' => 'unpaid',
            'payment_method' => null,
            'paid_at' => null,
            'created_at' => now(),
            'updated_at' => now()
        ];
        Log::info("💳 Partial rental fee created", [
            'month' => $i + 1,
            'amount' => $amount,
            'percentage' => $partialPercentages[$i]
        ]);
    }

    return $payments;
}

private function createMonthlyPayments($entryDate, $roomCategory, $rentalMonths)
{
    $payments = [];
    $monthlyAmount = $roomCategory->monthly_rental_fee + $roomCategory->management_fee;

    $currentBillingDate = $entryDate->copy();

    for ($i = 0; $i < $rentalMonths; $i++) {
        $payments[] = [
            'rental_id' => $this->id,
            'billing_date' => $currentBillingDate->toDateString(),
            'amount' => $monthlyAmount,
            'category' => 'rental_fee',
            'payment_status' => 'unpaid',
            'payment_method' => null,
            'paid_at' => null,
            'created_at' => now(),
            'updated_at' => now()
        ];
        Log::info("📆 Monthly rental fee created", [
            'month' => $i + 1,
            'date' => $currentBillingDate->toDateString(),
            'amount' => $monthlyAmount
        ]);

        $currentBillingDate->addMonth();
    }

    return $payments;
}

    // public function createPaymentRecords()
    // {
    //     // Load necessary relationships
    //     $this->load(['room.roomCategory', 'rentalPeriod', 'paymentType', 'bookingFee']);
        
    //     $roomCategory = $this->room->roomCategory;
    //     $rentalPeriod = $this->rentalPeriod;
    //     $paymentType = $this->paymentType;
    //     $bookingFee = $this->bookingFee;
        
    //     $entryDate = Carbon::parse($this->entry_date);
    //     $payments = [];

    //     // 1. Always Create Deposit Fee Payment
    //     $payments[] = [
    //         'rental_id' => $this->id,
    //         'billing_date' => $entryDate->toDateString(),
    //         'amount' => $roomCategory->deposit_fee,
    //         'category' => 'deposit_fee',
    //         'payment_status' => 'unpaid',
    //         'payment_method' => null,
    //         'paid_at' => null,
    //         'created_at' => now(),
    //         'updated_at' => now()
    //     ];

    //     // 2. Create Booking Fee Payment (if booking exists)
    //     if ($bookingFee) {
    //         $payments[] = [
    //             'rental_id' => $this->id,
    //             'billing_date' => $entryDate->toDateString(),
    //             'amount' => $bookingFee->amount,
    //             'category' => 'booking_fee',
    //             'payment_status' => 'unpaid',
    //             'payment_method' => null,
    //             'paid_at' => null,
    //             'created_at' => now(),
    //             'updated_at' => now()
    //         ];
    //     }

    //     // Calculate total rental cost
    //     $rentalMonths = $rentalPeriod->month;
    //     $totalRentalCost = ($roomCategory->monthly_rental_fee + $roomCategory->management_fee) * $rentalMonths;
    //     $bookingFeeAmount = $bookingFee ? $bookingFee->amount : 0;
    //     $netRentalCost = $totalRentalCost - $bookingFeeAmount;

    //     // 3. Create payments based on Payment Type
    //     if ($paymentType->name === 'cash') {
    //         $payments = array_merge($payments, $this->createCashPayments($entryDate, $netRentalCost));
    //     } elseif ($paymentType->name === 'partial') {
    //         $payments = array_merge($payments, $this->createPartialPayments($entryDate, $netRentalCost));
    //     } elseif ($paymentType->name === 'monthly') {
    //         $payments = array_merge($payments, $this->createMonthlyPayments($entryDate, $roomCategory, $rentalMonths));
    //     }

    //     // Insert all payments at once
    //     if (!empty($payments)) {
    //         DB::table('rental_payments')->insert($payments);
    //     }
    // }

    // private function createCashPayments($entryDate, $netRentalCost)
    // {
    //     $payments = [];

    //     if ($this->is_down_payment_paid_full) {
    //         // Full down payment
    //         $payments[] = [
    //             'rental_id' => $this->id,
    //             'billing_date' => $entryDate->toDateString(),
    //             'amount' => $netRentalCost,
    //             'category' => 'down_payment_fee',
    //             'payment_status' => 'unpaid',
    //             'payment_method' => null,
    //             'paid_at' => null,
    //             'created_at' => now(),
    //             'updated_at' => now()
    //         ];
    //     } else {
    //         // 50% down payment + 50% rental fee
    //         $downPaymentAmount = $netRentalCost * 0.5;
    //         $remainingAmount = $netRentalCost * 0.5;

    //         // Down payment 50%
    //         $payments[] = [
    //             'rental_id' => $this->id,
    //             'billing_date' => $entryDate->toDateString(),
    //             'amount' => $downPaymentAmount,
    //             'category' => 'down_payment_fee',
    //             'payment_status' => 'unpaid',
    //             'payment_method' => null,
    //             'paid_at' => null,
    //             'created_at' => now(),
    //             'updated_at' => now()
    //         ];

    //         // Remaining 50% rental fee (due next month)
    //         $payments[] = [
    //             'rental_id' => $this->id,
    //             'billing_date' => $entryDate->copy()->addMonth()->toDateString(),
    //             'amount' => $remainingAmount,
    //             'category' => 'rental_fee',
    //             'payment_status' => 'unpaid',
    //             'payment_method' => null,
    //             'paid_at' => null,
    //             'created_at' => now(),
    //             'updated_at' => now()
    //         ];
    //     }

    //     return $payments;
    // }

    // private function createPartialPayments($entryDate, $netRentalCost)
    // {
    //     $payments = [];

    //     // 50% down payment
    //     $downPaymentAmount = $netRentalCost * 0.5;
    //     $remainingAmount = $netRentalCost * 0.5;

    //     $payments[] = [
    //         'rental_id' => $this->id,
    //         'billing_date' => $entryDate->toDateString(),
    //         'amount' => $downPaymentAmount,
    //         'category' => 'down_payment_fee',
    //         'payment_status' => 'unpaid',
    //         'payment_method' => null,
    //         'paid_at' => null,
    //         'created_at' => now(),
    //         'updated_at' => now()
    //     ];

    //     // Create 3 rental fee payments: 20%, 20%, 10% of remaining amount
    //     $partialPercentages = [20.00, 20.00, 10.00];
        
    //     for ($i = 0; $i < 3; $i++) {
    //         $amount = $remainingAmount * ($partialPercentages[$i] / 100);
    //         $billingDate = $entryDate->copy()->addMonths($i + 1);

    //         $payments[] = [
    //             'rental_id' => $this->id,
    //             'billing_date' => $billingDate->toDateString(),
    //             'amount' => $amount,
    //             'category' => 'rental_fee',
    //             'payment_status' => 'unpaid',
    //             'payment_method' => null,
    //             'paid_at' => null,
    //             'created_at' => now(),
    //             'updated_at' => now()
    //         ];
    //     }

    //     return $payments;
    // }

    // private function createMonthlyPayments($entryDate, $roomCategory, $rentalMonths)
    // {
    //     $payments = [];
    //     $monthlyAmount = $roomCategory->monthly_rental_fee + $roomCategory->management_fee;
        
    //     // Start billing from entry date
    //     $currentBillingDate = $entryDate->copy();
        
    //     for ($i = 0; $i < $rentalMonths; $i++) {
    //         $payments[] = [
    //             'rental_id' => $this->id,
    //             'billing_date' => $currentBillingDate->toDateString(),
    //             'amount' => $monthlyAmount,
    //             'category' => 'rental_fee',
    //             'payment_status' => 'unpaid',
    //             'payment_method' => null,
    //             'paid_at' => null,
    //             'created_at' => now(),
    //             'updated_at' => now()
    //         ];
            
    //         $currentBillingDate->addMonth();
    //     }

    //     return $payments;
    // }

    // Relationships
    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function room()
    {
        return $this->belongsTo(Room::class);
    }

    public function rentalPeriod()
    {
        return $this->belongsTo(RentalPeriod::class);
    }

    public function paymentType()
    {
        return $this->belongsTo(PaymentType::class);
    }

    public function bookingFee()
    {
        return $this->belongsTo(BookingFee::class);
    }

    public function rentalPayments()
    {
        return $this->hasMany(RentalPayment::class);
    }

    public function tasks()
    {
        return $this->hasMany(Task::class);
    }

    public function tenantServices()
    {
        return $this->hasMany(TenantService::class);
    }

    public function tenantServicePayments()
    {
        return $this->hasManyThrough(TenantServicePayment::class, TenantService::class, 'rental_id', 'tenant_service_id');
    }
}