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
                'image' => 'images/room/dummy-room.jpg',
                'description' => 'Spacious deluxe room with modern facilities.'
            ],
            [
                'company_id' => 1,
                'room_category_id' => 1,
                'name' => 'Deluxe Room 2',
                'image' => 'images/room/dummy-room.jpg',
                'description' => 'Comfortable deluxe room with city view.'
            ],
            [
                'company_id' => 1,
                'room_category_id' => 2,
                'name' => 'Superior Room 1',
                'image' => 'images/room/dummy-room.jpg',
                'description' => 'Elegant superior room for family stay.'
            ],
            [
                'company_id' => 1,
                'room_category_id' => 2,
                'name' => 'Superior Room 2',
                'image' => 'images/room/dummy-room.jpg',
                'description' => 'Superior room with balcony and sunlight.'
            ],
            [
                'company_id' => 1,
                'room_category_id' => 3,
                'name' => 'Standard Room 1',
                'image' => 'images/room/dummy-room.jpg',
                'description' => 'Cozy standard room at affordable price.'
            ],
            [
                'company_id' => 1,
                'room_category_id' => 3,
                'name' => 'Standard Room 2',
                'image' => 'images/room/dummy-room.jpg',
                'description' => 'Standard room with essential amenities.'
            ],
            [
                'company_id' => 1,
                'room_category_id' => 3,
                'name' => 'Standard Room 3',
                'image' => 'images/room/dummy-room.jpg',
                'description' => 'Small but comfortable room for solo travelers.'
            ],
            [
                'company_id' => 1,
                'room_category_id' => 4,
                'name' => 'Suite Room 1',
                'image' => 'images/room/dummy-room.jpg',
                'description' => 'Luxury suite room with living area.'
            ],
            [
                'company_id' => 1,
                'room_category_id' => 4,
                'name' => 'Suite Room 2',
                'image' => 'images/room/dummy-room.jpg',
                'description' => 'Premium suite with full amenities.'
            ],
            [
                'company_id' => 1,
                'room_category_id' => 4,
                'name' => 'Suite Room 3',
                'image' => 'images/room/dummy-room.jpg',
                'description' => 'Exclusive suite with private balcony.'
            ],
        ];

        foreach ($rooms as $room) {
            Room::create($room);
        }
    }
}