<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TenantServicePayment extends Model
{
    protected $table = 'tenant_service_payments';
    protected $guarded = ['id', 'created_at', 'updated_at'];

    public function tenantService()
    {
        return $this->belongsTo(TenantService::class);
    }

    // Service Accessor
    public function service()
    {
        return $this->hasOneThrough(Service::class, TenantService::class, 'id', 'id', 'tenant_service_id', 'service_id');
    }

    // Rental Accessor
    public function rental()
    {
        return $this->hasOneThrough(Rental::class, TenantService::class, 'id', 'id', 'tenant_service_id', 'rental_id');
    }

    // Tenant Accessor
    public function tenant()
    {
        return $this->hasOneThroughMany(User::class, [TenantService::class, Rental::class], 'tenant_service_id', 'user_id');
    }

}
