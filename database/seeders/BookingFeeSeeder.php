<?php

namespace Database\Seeders;

use App\Models\BookingFee;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class BookingFeeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        BookingFee::create([
            'amount' => 500000,
            'company_id' => 1,
        ]);

        BookingFee::create([
            'amount' => 1000000,
            'company_id' => 1,
        ]);
    }
}
