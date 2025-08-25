<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RentalPeriod extends Model
{
    protected $table = 'rental_periods';
    protected $guarded = ['id', 'created_at', 'updated_at'];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function rentals()
    {
        return $this->hasMany(Rental::class);
    }

}
