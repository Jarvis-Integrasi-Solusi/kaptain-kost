<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TenantService extends Model
{
    protected $table = 'tenant_services';
    protected $guarded = ['id', 'created_at', 'updated_at'];

    public function rental()
    {
        return $this->belongsTo(Rental::class);
    }

    public function service()
    {
        return $this->belongsTo(Service::class);
    }

    public function tenantServicePayments()
    {
        return $this->hasMany(TenantServicePayment::class);
    }

    // Tenant Accessor
    public function tenant()
    {
        return $this->hasOneThrough(User::class, Rental::class, 'id', 'id', 'rental_id', 'user_id');
    }

    // Calculate total amount
    public function getTotalAmountAttribute()
    {
        return $this->quantity * $this->service->price;
    }
}