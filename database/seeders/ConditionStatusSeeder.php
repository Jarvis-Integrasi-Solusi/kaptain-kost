<?php

namespace Database\Seeders;

use App\Models\ConditionStatus;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ConditionStatusSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        ConditionStatus::insert([
            ['name' => 'Good'],
            ['name' => 'In Maintenance'],
            ['name' => 'Damaged'],
            ['name' => 'Dirty']
        ]);
    }

}