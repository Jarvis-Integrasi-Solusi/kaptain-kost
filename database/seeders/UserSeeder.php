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
            'company_id' => 1,
            'status' => 'active',
            'username' => 'manageruser',
            'telephone' => '081234567890',
            'gender' => 'male',
            'guardian_name' => null,
            'guardian_telephone' => null,
            'address' => 'Jl. Sudirman No. 1, Jakarta',
            'bank_name' => 'Bank Central Asia',
            'bank_account_number' => '1234567890',
            'bank_account_holder' => 'Manager User',
        ]);

        // Operator
        User::create([
            'name' => 'Operator User',
            'email' => 'operator@example.com',
            'password' => Hash::make('password'),
            'role' => 'operator',
            'email_verified_at' => now(),
            'company_id' => 1,
            'status' => 'active',
            'username' => 'operatoruser',
            'telephone' => '081234567891',
            'gender' => 'female',
            'guardian_name' => null,
            'guardian_telephone' => null,
            'address' => 'Jl. Gatot Subroto No. 2, Jakarta',
            'bank_name' => 'Bank Mandiri',
            'bank_account_number' => '9876543210',
            'bank_account_holder' => 'Operator User',
        ]);

        // 10 Tenant Users
        for ($i = 1; $i <= 10; $i++) {
            User::create([
                'name' => "Tenant User {$i}",
                'email' => "tenant{$i}@example.com",
                'password' => Hash::make('password'),
                'role' => 'tenant',
                'email_verified_at' => now(),
                'company_id' => 1,
                'status' => 'active',
                'username' => "tenant{$i}",
                'telephone' => "0812345678{$i}{$i}",
                'gender' => $i % 2 === 0 ? 'male' : 'female',
                'guardian_name' => "Guardian {$i}",
                'guardian_telephone' => "0812987654{$i}{$i}",
                'address' => "Jl. Tenant No. {$i}, Jakarta",
                'bank_name' => $i % 2 === 0 ? 'Bank BRI' : 'Bank BNI',
                'bank_account_number' => "100200300{$i}{$i}",
                'bank_account_holder' => "Tenant User {$i}",
            ]);
        }
    }
}