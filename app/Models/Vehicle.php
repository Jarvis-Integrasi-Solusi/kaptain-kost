<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Vehicle extends Model
{
    protected $table = 'vehicles';
    protected $guarded = ['id', 'created_at', 'updated_at'];

    public function tenantVehicles()
    {
        return $this->hasMany(TenantVehicle::class);
    }

    public function tenants()
    {
        return $this->belongsToMany(User::class, 'tenant_vehicles', 'vehicle_id', 'tenant_id');
    }

    public function company()
    {
        return $this->belongsTo(Company::class);
    }
}
