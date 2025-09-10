<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Room extends Model
{
    protected $table = 'rooms';
    protected $guarded = ['id', 'created_at', 'updated_at'];

    protected $appends = ['occupancy_status', 'image', 'url'];

    public function roomImages()
    {
        return $this->hasMany(RoomImage::class);
    }


    public function getImageAttribute()
    {
        return $this->roomImages()->orderBy('created_at', 'asc')->first()?->image;
    }

    public function getUrlAttribute()
    {
        return asset('storage/' . $this->image);
    }

    public function getOccupancyStatusAttribute()
    {
        $latestRental = $this->rentals()->latest('created_at')->first();

        if (!$latestRental) {
            return 'available';
        }

        if (in_array($latestRental->status, ['completed', 'terminated'])) {
            return 'available';
        }

        if ($latestRental->status === 'booked') {
            return 'booked';
        }

        if ($latestRental->status === 'occupied') {
            return 'occupied';
        }

        return 'available';
    }

    public function company()
    {
        return $this->belongsTo(Company::class);
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
