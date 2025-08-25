<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Rental extends Model
{
    protected $table = 'rentals';
    protected $guarded = ['id', 'created_at', 'updated_at'];

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
