<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            CompanySeeder::class,
            UserSeeder::class,
            RoomCategorySeeder::class,
            // ConditionStatusSeeder::class,
            // OccupancyStatusSeeder::class,
            RoomSeeder::class,
            RentalPeriodSeeder::class,
            PaymentTypeSeeder::class,
            BookingFeeSeeder::class
            // RentalSeeder::class,
        ]);
    }
}
