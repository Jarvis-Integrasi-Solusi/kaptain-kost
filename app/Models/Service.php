<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Service extends Model
{
    protected $table = 'services';
    protected $guarded = ['id', 'created_at', 'updated_at'];

    public function tenantServices()
    {
        return $this->hasMany(TenantService::class);
    }

    public function rentals()
    {
        return $this->belongsToMany(Rental::class, 'tenant_services', 'service_id', 'rental_id')
                    ->withPivot('quantity', 'notes', 'status')
                    ->withTimestamps();
    }

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

}