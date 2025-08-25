<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PaymentType extends Model
{
    protected $table = 'payment_types';
    protected $guarded = ['id', 'created_at', 'updated_at'];

    public function rentals()
    {
        return $this->hasMany(Rental::class);
    }

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

}
