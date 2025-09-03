<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BookingFee extends Model
{
    protected $table = 'booking_fees';

    protected $fillable = ['amount', 'company_id'];
}
