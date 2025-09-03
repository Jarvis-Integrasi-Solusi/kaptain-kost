<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\RoomCategory;

class RoomCategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        RoomCategory::create([
            'name' => 'Superior',
            'company_id' => 1,
            'management_fee' => 100000,
            'monthly_rental_fee' => 1500000,
            'deposit_fee' => 1000000,
        ]);

        RoomCategory::create([
            'name' => 'Deluxe',
            'company_id' => 1,
            'management_fee' => 150000,
            'monthly_rental_fee' => 2000000,
            'deposit_fee' => 1000000,
        ]);
    }
}