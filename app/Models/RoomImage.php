<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RoomImage extends Model
{
    protected $guarded = ['id'];

    public function room()
    {
        return $this->belongsTo(Room::class);
    }

    protected $appends = ['url'];

    public function getUrlAttribute()
    {
        return asset('storage/' . $this->image);
    }
}
