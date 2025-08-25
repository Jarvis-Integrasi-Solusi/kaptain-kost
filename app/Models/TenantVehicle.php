<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TenantVehicle extends Model
{
    protected $table = 'tenant_vehicles';
    protected $guarded = ['id', 'created_at', 'updated_at'];


    public function tenant()
    {
        return $this->belongsTo(User::class, 'tenant_id');
    }

    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class);
    }

    public function parkingFeePayments()
    {
        return $this->hasMany(ParkingFeePayment::class);
    }
}
