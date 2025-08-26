<?php

namespace App\Http\Controllers\Manager\Room;

use App\Http\Controllers\Controller;
use Inertia\Inertia;

class ConditionStatusController extends Controller
{
    public function index()
    {
        return Inertia::render('manager/room/condition-status/index');
    }
}
