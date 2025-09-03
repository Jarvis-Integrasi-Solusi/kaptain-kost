<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'address',
        'telephone',
        'username',
        'gender',
        'status',
        'guardian_name',
        'guardian_telephone',
        'image',
        'company_id',
    ];

    // Role Check Helper Function
    public function isManager(): bool
    {
        return $this->role === 'manager';
    }

    public function isOperator(): bool
    {
        return $this->role === 'operator';
    }

    public function isTenant(): bool
    {
        return $this->role === 'tenant';
    }

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function rentals()
    {
        return $this->hasMany(Rental::class);
    }

    public function assignedTasks()
    {
        return $this->hasMany(Task::class, 'assigned_to');
    }

    public function tasks()
    {
        return $this->hasMany(Task::class, 'tenant_id');
    }

    public function tenantVehicles()
    {
        return $this->hasMany(TenantVehicle::class, 'tenant_id');
    }

    public function vehicles()
    {
        return $this->belongsToMany(Vehicle::class, 'tenant_vehicles', 'tenant_id', 'vehicle_id');
    }

    public function parkingFeePayments()
    {
        return $this->hasManyThrough(ParkingFeePayment::class, TenantVehicle::class, 'tenant_id', 'tenant_vehicle_id');
    }

    public function tenantServices()
    {
        return $this->hasManyThrough(TenantService::class, Rental::class, 'user_id', 'rental_id');
    }


    
}
