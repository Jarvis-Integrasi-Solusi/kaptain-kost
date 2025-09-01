<?php
// database/seeders/UserSeeder.php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Manager
        User::create([
            'name' => 'Manager User',
            'email' => 'manager@example.com',
            'password' => Hash::make('password'),
            'role' => 'manager',
            'email_verified_at' => now(),
            'company_id' => 1
        ]);

        // Operator
        User::create([
            'name' => 'Operator User',
            'email' => 'operator@example.com',
            'password' => Hash::make('password'),
            'role' => 'operator',
            'email_verified_at' => now(),
            'company_id' => 1
        ]);

        // 10 Tenant Users
        for ($i = 1; $i <= 10; $i++) {
            User::create([
                'name' => "Tenant User {$i}",
                'email' => "tenant{$i}@example.com",
                'password' => Hash::make('password'),
                'role' => 'tenant',
                'email_verified_at' => now(),
                'company_id' => 1
            ]);
        }
    }
}