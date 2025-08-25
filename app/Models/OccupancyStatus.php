<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OccupancyStatus extends Model
{
    protected $table = 'occupancy_statuses';
    protected $guarded = ['id', 'created_at', 'updated_at'];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function rooms()
    {
        return $this->hasMany(Room::class);
    }
}
