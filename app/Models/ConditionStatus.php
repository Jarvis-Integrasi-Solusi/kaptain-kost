<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ConditionStatus extends Model
{
    protected $table = 'condition_statuses';
    protected $guarded = ['id', 'created_at', 'updated_at'];


    public function rooms()
    {
        return $this->hasMany(Room::class);
    }

    public function company()
    {
        return $this->belongsTo(Company::class);
    }
}
