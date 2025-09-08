<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DepositReturn extends Model
{

    protected $table = 'deposit_returns';
    protected $guarded = ['id', 'created_at', 'updated_at'];

    public function rental()
    {
        return $this->belongsTo(Rental::class);
    }
}
