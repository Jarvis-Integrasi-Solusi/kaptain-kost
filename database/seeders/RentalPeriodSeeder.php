<?php

namespace Database\Seeders;

use App\Models\RentalPeriod;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class RentalPeriodSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
       RentalPeriod::create([
            'name' => '1 Month',
            'month' => 1
        ]);

        RentalPeriod::create([
            'name' => '3 Months',
            'month' => 3
        ]);

        RentalPeriod::create([
            'name' => '6 Months',
            'month' => 6
        ]);

        RentalPeriod::create([
            'name' => '1 Year',
            'month' => 12
        ]);
    }
}
