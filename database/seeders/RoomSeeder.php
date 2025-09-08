<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Room;
use App\Models\RoomImage;

class RoomSeeder extends Seeder
{
    public function run()
    {
        $rooms = [
            [
                'company_id' => 1,
                'room_category_id' => 1,
                'name' => 'Deluxe Room 1',
                'description' => 'Spacious deluxe room with modern facilities.',
                'images' => ['images/room/room-1.jpg']
            ],
            [
                'company_id' => 1,
                'room_category_id' => 1,
                'name' => 'Deluxe Room 2',
                'description' => 'Comfortable deluxe room with city view.',
                'images' => ['images/room/room-2.jpeg']
            ],
            [
                'company_id' => 1,
                'room_category_id' => 2,
                'name' => 'Superior Room 1',
                'description' => 'Elegant superior room for family stay.',
                'images' => ['images/room/room-3.jpg']
            ],
            [
                'company_id' => 1,
                'room_category_id' => 2,
                'name' => 'Superior Room 2',
                'description' => 'Superior room with balcony and sunlight.',
                'images' => ['images/room/room-1.jpg']
            ],
            [
                'company_id' => 1,
                'room_category_id' => 1,
                'name' => 'Standard Room 1',
                'description' => 'Cozy standard room at affordable price.',
                'images' => ['images/room/room-2.jpeg']
            ],
            [
                'company_id' => 1,
                'room_category_id' => 1,
                'name' => 'Standard Room 2',
                'description' => 'Standard room with essential amenities.',
                'images' => ['images/room/room-3.jpg']
            ],
            [
                'company_id' => 1,
                'room_category_id' => 2,
                'name' => 'Standard Room 3',
                'description' => 'Small but comfortable room for solo travelers.',
                'images' => ['images/room/room-1.jpg']
            ],
            [
                'company_id' => 1,
                'room_category_id' => 2,
                'name' => 'Suite Room 1',
                'description' => 'Luxury suite room with living area.',
                'images' => ['images/room/room-2.jpeg']
            ],
            [
                'company_id' => 1,
                'room_category_id' => 1,
                'name' => 'Suite Room 2',
                'description' => 'Premium suite with full amenities.',
                'images' => ['images/room/room-3.jpg']
            ],
            [
                'company_id' => 1,
                'room_category_id' => 2,
                'name' => 'Suite Room 3',
                'description' => 'Exclusive suite with private balcony.',
                'images' => ['images/room/room-1.jpg']
            ],
        ];

        foreach ($rooms as $roomData) {
            // Buat room
            $room = Room::create([
                'company_id' => $roomData['company_id'],
                'room_category_id' => $roomData['room_category_id'],
                'name' => $roomData['name'],
                'description' => $roomData['description'],
            ]);

            // Tambahkan gambar (kalau ada)
            if (!empty($roomData['images'])) {
                foreach ($roomData['images'] as $imagePath) {
                    RoomImage::create([
                        'room_id' => $room->id,
                        'image'   => $imagePath,
                    ]);
                }
            }
        }
    }
}