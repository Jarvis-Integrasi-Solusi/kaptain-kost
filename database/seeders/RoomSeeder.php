<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Room;

class RoomSeeder extends Seeder
{
    public function run()
    {
        $rooms = [
            [
                'company_id' => 1,
                'room_category_id' => 1,
                'name' => 'Deluxe Room 1',
                'description' => 'Spacious deluxe room with modern facilities.'
            ],
            [
                'company_id' => 1,
                'room_category_id' => 1,
                'name' => 'Deluxe Room 2',
                'description' => 'Comfortable deluxe room with city view.'
            ],
            [
                'company_id' => 1,
                'room_category_id' => 2,
                'name' => 'Superior Room 1',
                'description' => 'Elegant superior room for family stay.'
            ],
            [
                'company_id' => 1,
                'room_category_id' => 2,
                'name' => 'Superior Room 2',
                'description' => 'Superior room with balcony and sunlight.'
            ],
            [
                'company_id' => 1,
                'room_category_id' => 1,
                'name' => 'Standard Room 1',
                'description' => 'Cozy standard room at affordable price.'
            ],
            [
                'company_id' => 1,
                'room_category_id' => 1,
                'name' => 'Standard Room 2',
                'description' => 'Standard room with essential amenities.'
            ],
            [
                'company_id' => 1,
                'room_category_id' => 2,
                'name' => 'Standard Room 3',
                'description' => 'Small but comfortable room for solo travelers.'
            ],
            [
                'company_id' => 1,
                'room_category_id' => 2,
                'name' => 'Suite Room 1',
                'description' => 'Luxury suite room with living area.'
            ],
            [
                'company_id' => 1,
                'room_category_id' => 1,
                'name' => 'Suite Room 2',
                'description' => 'Premium suite with full amenities.'
            ],
            [
                'company_id' => 1,
                'room_category_id' => 2,
                'name' => 'Suite Room 3',
                'description' => 'Exclusive suite with private balcony.'
            ],
        ];

        foreach ($rooms as $room) {
            Room::create($room);
        }
    }
}