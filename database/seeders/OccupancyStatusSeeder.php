<?php

namespace Database\Seeders;

use App\Models\OccupancyStatus;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class OccupancyStatusSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        OccupancyStatus::insert([
            ['name' => 'Available'],
            ['name' => 'Not Available'],
            ['name' => 'Reserved'],
            ['name' => 'Occupied']
        ]);
    }
}
