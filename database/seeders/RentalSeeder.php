<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Rental;
use App\Models\User;
use App\Models\Room;
use App\Models\RentalPeriod;
use App\Models\PaymentType;
use Carbon\Carbon;

class RentalSeeder extends Seeder
{
    public function run(): void
    {
        $tenants = User::where('role', 'tenant')->get();

        $rentalPeriods = RentalPeriod::all()->keyBy('month');

        $paymentType = PaymentType::where('name', 'Monthly')->first();

        $baseDate = Carbon::create(2025, 1, 1);

        foreach ($tenants as $index => $tenant) {
            $roomId = $index + 1; 
            $room = Room::with('roomCategory')->find($roomId);

            if (!$room || !$room->roomCategory) {
                continue; 
            }

            switch (($index % 4)) {
                case 0:
                    $months = 1;
                    break;
                case 1:
                    $months = 3;
                    break;
                case 2:
                    $months = 6;
                    break;
                case 3:
                    $months = 12;
                    break;
            }

            $rentalPeriod = $rentalPeriods[$months] ?? null;

            if (!$rentalPeriod) {
                continue;
            }

            $entryDate = $baseDate->copy()->addMonths($index);
            $exitDate = $entryDate->copy()->addMonths($months);

            $totalPrice = ($room->roomCategory->monthly_rental_fee * $months)
                + $room->roomCategory->management_fee
                + $room->roomCategory->deposit_fee;

            Rental::create([
                'company_id'       => $room->company_id,
                'user_id'          => $tenant->id,
                'room_id'          => $room->id,
                'rental_period_id' => $rentalPeriod->id,
                'payment_type_id'  => $paymentType->id,
                'entry_date'       => $entryDate,
                'exit_date'        => $exitDate,
                'total_price'      => $totalPrice,
            ]);
        }
    }
}