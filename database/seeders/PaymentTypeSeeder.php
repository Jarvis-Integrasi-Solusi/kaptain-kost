<?php

namespace Database\Seeders;

use App\Models\PaymentType;
use Illuminate\Database\Seeder;

class PaymentTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        PaymentType::create([
            'name' => 'Cash'
        ]);

        PaymentType::create([
            'name' => 'Partial'
        ]);

        PaymentType::create([
            'name' => 'Monthly'
        ]);
    }

}