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
        $dueDate = $entryDate->copy();
        $billingDate = $dueDate->copy()->subDay(7); // 7 days before entry date

        $payments = [];

        if ($bookingFee) {
            $payments[] = [
                'rental_id' => $this->id,
                'billing_date' => $billingDate->toDateString(),
                'due_date' => $dueDate->toDateString(),
                'amount' => $bookingFee->amount,
                'category' => 'booking_fee',
                'payment_status' => 'unpaid',
                'payment_method' => null,
                'paid_at' => null,
                'created_at' => now(),
                'updated_at' => now()
            ];
        }

        // Calculate
        $rentalMonths = $rentalPeriod->month;
        $totalRentalCost = ($roomCategory->monthly_rental_fee + $roomCategory->management_fee) * $rentalMonths;
        $bookingFeeAmount = $bookingFee ? $bookingFee->amount : 0;
        $depositFee = $roomCategory->deposit_fee;
        $netRentalCost = $totalRentalCost - $bookingFeeAmount + $depositFee;


        // 2. Payment Type Handling
        if ($paymentType->name === 'Cash') {
            $payments = array_merge($payments, $this->createCashPayments($entryDate, $netRentalCost));
        } elseif ($paymentType->name === 'Partial') {
            $payments = array_merge($payments, $this->createPartialPayments($entryDate, $netRentalCost));
        } elseif ($paymentType->name === 'Monthly') {
            $payments = array_merge($payments, $this->createMonthlyPayments($entryDate, $roomCategory, $rentalMonths, $depositFee));
        }

        // Insert
        if (!empty($payments)) {
            DB::table('rental_payments')->insert($payments);
        }
    }

    private function createCashPayments($entryDate, $netRentalCost)
    {
        $payments = [];


        if ($this->is_down_payment_paid_full) {
            
            $dueDate = $entryDate->copy();
            $billingDate = $dueDate->copy()->subDay(7); // 7 days before entry date

            $payments[] = [
                'rental_id' => $this->id,
                'billing_date' => $billingDate->toDateString(),
                'due_date' => $dueDate->toDateString(),
                'amount' => $netRentalCost,
                'category' => 'down_payment_fee',
                'payment_status' => 'unpaid',
                'payment_method' => null,
                'paid_at' => null,
                'created_at' => now(),
                'updated_at' => now()
            ];
        } else {
            $downPaymentAmount = $netRentalCost * 0.5;
            $remainingAmount = $netRentalCost * 0.5;

            $dueDate = $entryDate->copy();
            $billingDate = $dueDate->copy()->subDay(7); 

            $payments[] = [
                'rental_id' => $this->id,
                'billing_date' => $billingDate->toDateString(),
                'due_date' => $dueDate->toDateString(),
                'amount' => $downPaymentAmount,
                'category' => 'down_payment_fee',
                'payment_status' => 'unpaid',
                'payment_method' => null,
                'paid_at' => null,
                'created_at' => now(),
                'updated_at' => now()
            ];
            $payments[] = [
                'rental_id' => $this->id,
                'billing_date' => $billingDate->addMonth()->toDateString(),
                'due_date' => $dueDate->addDays(14)->toDateString(),
                'amount' => $remainingAmount,
                'category' => 'rental_fee',
                'payment_status' => 'unpaid',
                'payment_method' => null,
                'paid_at' => null,
                'created_at' => now(),
                'updated_at' => now()
            ];
        }

        return $payments;
    }

    private function createPartialPayments($entryDate, $netRentalCost)
    {
        $payments = [];

        $rentalPeriod = $this->rentalPeriod; 

        // 50% DP awal
        $downPaymentAmount = $netRentalCost * 0.5;
        $dueDate = $entryDate->copy();
        $billingDate = $dueDate->copy()->subDays(7);

        $payments[] = [
            'rental_id' => $this->id,
            'billing_date' => $billingDate->toDateString(),
            'due_date' => $dueDate->toDateString(),
            'amount' => $downPaymentAmount,
            'category' => 'down_payment_fee',
            'payment_status' => 'unpaid',
            'payment_method' => null,
            'paid_at' => null,
            'created_at' => now(),
            'updated_at' => now()
        ];
        Log::info("💳 Partial DP 50% created", ['amount' => $downPaymentAmount]);

        // sisanya: 20% + 20% + 10%
        $partialPercentages = [20.00, 20.00, 10.00];
        for ($i = 0; $i < 3; $i++) {
            $amount = $netRentalCost * ($partialPercentages[$i] / 100);

            // default jatuh tempo = addMonths
            if ($rentalPeriod->month == 1) {
                // jika 1 bulan → +7 hari tiap termin
                $dueDate = $entryDate->copy()->addDays(7 * ($i + 1));
            } elseif ($rentalPeriod->month == 3) {
                // jika 3 bulan → +20 hari tiap termin
                $dueDate = $entryDate->copy()->addDays(20 * ($i + 1));
            } else {
                // default tetap per bulan
                $dueDate = $entryDate->copy()->addMonths($i + 1);
            }

            $billingDate = $dueDate->copy()->subDays(7);

            $payments[] = [
                'rental_id' => $this->id,
                'billing_date' => $billingDate->toDateString(),
                'due_date' => $dueDate->toDateString(),
                'amount' => $amount,
                'category' => 'rental_fee',
                'payment_status' => 'unpaid',
                'payment_method' => null,
                'paid_at' => null,
                'created_at' => now(),
                'updated_at' => now()
            ];
        }

        return $payments;
    }

    private function createMonthlyPayments($entryDate, $roomCategory, $rentalMonths, $depositFee)
    {
        $payments = [];
        $bookingFeePerMonth = $this->bookingFee ? $this->bookingFee->amount / $rentalMonths : 0;
        $monthlyAmount = $roomCategory->monthly_rental_fee + $roomCategory->management_fee;

        $depositPerMonth = $depositFee > 0 && $rentalMonths > 0 ? $depositFee / $rentalMonths : 0;

        $currentDueDate = $entryDate->copy();

        for ($i = 0; $i < $rentalMonths; $i++) {
            $dueDate = $currentDueDate->copy();
            $billingDate = $dueDate->copy()->subDays(7);

            $amount = ceil($monthlyAmount + $depositPerMonth - $bookingFeePerMonth);
            
            $payments[] = [
                'rental_id' => $this->id,
                'billing_date' => $billingDate->toDateString(),
                'due_date' => $dueDate->toDateString(),
                'amount' => $amount,
                'category' => 'rental_fee',
                'payment_status' => 'unpaid',
                'payment_method' => null,
                'paid_at' => null,
                'created_at' => now(),
                'updated_at' => now()
            ];
            
            $currentDueDate->addMonth();
        }

        return $payments;
    }

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

    public function depositReturn()
    {
        return $this->hasOne(DepositReturn::class);
    }
}