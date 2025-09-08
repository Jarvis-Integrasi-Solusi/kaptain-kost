<?php

namespace App\Http\Controllers\Manager\Rental;

use App\Http\Controllers\Controller;
use App\Models\RentalPeriod;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PeriodController extends Controller
{
    public function index() {

        $allRentalPeriods = RentalPeriod::all();

        return Inertia::render('manager/rental/period/index', [
            'rental_periods' => $allRentalPeriods,
        ]);
    }


}
