<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Company extends Model
{
    protected $table = 'companies';
    protected $guarded = ['id', 'created_at', 'updated_at'];

    public function users()
    {
        return $this->hasMany(User::class);
    }

    public function rooms()
    {
        return $this->hasMany(Room::class);
    }
    
    public function paymentTypes()
    {
        return $this->hasMany(PaymentType::class);
    }

    public function rentalPeriods()
    {
        return $this->hasMany(RentalPeriod::class);
    }

    public function rentals()
    {
        return $this->hasMany(Rental::class);
    }

    public function roomCategories()
    {
        return $this->hasMany(RoomCategory::class);
    }
}
