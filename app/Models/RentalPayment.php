<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RentalPayment extends Model
{
    protected $table = 'rental_payments';
    protected $guarded = ['id', 'created_at', 'updated_at'];

    public function rental()
    {
        return $this->belongsTo(Rental::class);
    }

}