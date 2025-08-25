<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ParkingFeePayment extends Model
{
    protected $table = 'parking_fee_payments';
    protected $guarded = ['id', 'created_at', 'updated_at'];

    public function tenantVehicle()
    {
        return $this->belongsTo(TenantVehicle::class);
    }

    // Tenant Accessor
    public function tenant()
    {
        return $this->hasOneThrough(User::class, TenantVehicle::class, 'id', 'id', 'tenant_vehicle_id', 'tenant_id');
    }

    // Vehicle Accessor
    public function vehicle()
    {
        return $this->hasOneThrough(Vehicle::class, TenantVehicle::class, 'id', 'id', 'tenant_vehicle_id', 'vehicle_id');
    }


}
