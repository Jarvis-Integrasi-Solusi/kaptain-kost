<?php

namespace App\Http\Controllers\Manager\Room;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FacilityController extends Controller
{
    public function index()
    {
        return Inertia::render('manager/room/facility/index');
    }
}
