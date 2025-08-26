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
            'name' => 'Room E',
            'company_id' => 1,
            'management_fee' => 500000,
            'electricity_bill_fee' => 200000,
            'water_bill_fee' => 100000,
            'monthly_rental_fee' => 3000000,
            'deposit_fee' => 1000000,
        ]);

        RoomCategory::create([
            'name' => 'Room F',
            'company_id' => 1,
            'management_fee' => 600000,
            'electricity_bill_fee' => 250000,
            'water_bill_fee' => 120000,
            'monthly_rental_fee' => 4000000,
            'deposit_fee' => 1500000,
        ]);

        RoomCategory::create([
            'name' => 'Room G',
            'company_id' => 1,
            'management_fee' => 800000,
            'electricity_bill_fee' => 300000,
            'water_bill_fee' => 150000,
            'monthly_rental_fee' => 6000000,
            'deposit_fee' => 2000000,
        ]);

        RoomCategory::create([
            'name' => 'Room H',
            'company_id' => 1,
            'management_fee' => 1000000,
            'electricity_bill_fee' => 350000,
            'water_bill_fee' => 200000,
            'monthly_rental_fee' => 8000000,
            'deposit_fee' => 2500000,
        ]);
    }
}