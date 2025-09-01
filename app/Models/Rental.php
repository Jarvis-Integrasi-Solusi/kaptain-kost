<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

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
        // Load necessary relationships
        $this->load(['room.roomCategory', 'rentalPeriod', 'paymentType']);
        
        $roomCategory = $this->room->roomCategory;
        $rentalPeriod = $this->rentalPeriod;
        $paymentType = $this->paymentType;
        
        $entryDate = Carbon::parse($this->entry_date);
        $billingStartDate = $entryDate->day > 15 ? $entryDate->copy()->addMonth()->startOfMonth() : $entryDate->copy();
        
        $payments = [];

        // 1. Create Deposit Fee Payment (always single payment)
        $payments[] = [
            'rental_id' => $this->id,
            'billing_date' => $entryDate->toDateString(),
            'amount' => $roomCategory->deposit_fee,
            'category' => 'deposit_fee',
            'payment_status' => 'unpaid', // Always start as unpaid
            'payment_method' => null, // Will be set when payment is made
            'paid_at' => null,
            'created_at' => now(),
            'updated_at' => now()
        ];

        // 2. Create Management Fee Payment (always single payment)
        $payments[] = [
            'rental_id' => $this->id,
            'billing_date' => $entryDate->toDateString(),
            'amount' => $roomCategory->management_fee,
            'category' => 'management_fee',
            'payment_status' => 'unpaid', // Always start as unpaid
            'payment_method' => null, // Will be set when payment is made
            'paid_at' => null,
            'created_at' => now(),
            'updated_at' => now()
        ];

        // 3. Create Rental Fee Payments based on Payment Type
        $rentalMonths = $rentalPeriod->month ?? $rentalPeriod->duration_months;
        
        if ($paymentType->name === 'Cash') {
            // Cash payment: single payment for all rental months
            $totalRentalFee = $roomCategory->monthly_rental_fee * $rentalMonths;
            
            $payments[] = [
                'rental_id' => $this->id,
                'billing_date' => $entryDate->toDateString(),
                'amount' => $totalRentalFee,
                'category' => 'rental_fee',
                'payment_status' => 'unpaid', // Always start as unpaid
                'payment_method' => null, // Will be set when payment is made
                'paid_at' => null,
                'created_at' => now(),
                'updated_at' => now()
            ];

        } elseif ($paymentType->name === 'Monthly') {
            // Monthly payment: create payment for each month
            $currentBillingDate = $billingStartDate->copy();
            
            for ($i = 0; $i < $rentalMonths; $i++) {
                $payments[] = [
                    'rental_id' => $this->id,
                    'billing_date' => $currentBillingDate->toDateString(),
                    'amount' => $roomCategory->monthly_rental_fee,
                    'category' => 'rental_fee',
                    'payment_status' => 'unpaid', // Monthly payments start as unpaid
                    'payment_method' => null, // Will be set when payment is made
                    'paid_at' => null,
                    'created_at' => now(),
                    'updated_at' => now()
                ];
                
                $currentBillingDate->addMonth();
            }
        }
        
        // Note: For 'partial' payment type, we don't create rental_fee payments
        // as they will be created manually by the manager

        // Insert all payments at once
        if (!empty($payments)) {
            DB::table('rental_payments')->insert($payments);
        }
    }

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
