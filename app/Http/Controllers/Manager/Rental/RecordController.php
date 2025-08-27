<?php

namespace App\Http\Controllers\Manager\Rental;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RecordController extends Controller
{
    public function index()
    {
        return Inertia::render('manager/rental/index');
    }
}
