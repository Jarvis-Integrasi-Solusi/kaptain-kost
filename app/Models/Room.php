<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Room extends Model
{
    protected $table = 'rooms';
    protected $guarded = ['id', 'created_at', 'updated_at'];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function occupancyStatus()
    {
        return $this->belongsTo(OccupancyStatus::class);
    }

    public function conditionStatus()
    {
        return $this->belongsTo(ConditionStatus::class);
    }

    public function roomCategory()
    {
        return $this->belongsTo(RoomCategory::class);
    }

    public function rentals()
    {
        return $this->hasMany(Rental::class);
    }

    public function currentRental()
    {
        return $this->hasOne(Rental::class)->whereNull('exit_date')->orWhere('exit_date', '>', now());
    }

    public function currentTenant()
    {
        return $this->hasOneThrough(User::class, Rental::class, 'room_id', 'id', 'id', 'user_id')
                    ->whereNull('rentals.exit_date')
                    ->orWhere('rentals.exit_date', '>', now());
    }
}
