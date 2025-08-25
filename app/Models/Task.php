<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Task extends Model
{
    protected $table = 'tasks';
    protected $guarded = ['id', 'created_at', 'updated_at'];

    public function rental()
    {
        return $this->belongsTo(Rental::class);
    }

    public function assignedTo()
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function tenant()
    {
        return $this->belongsTo(User::class, 'tenant_id');
    }

    
}
