<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function manager(): Response
    {
        return Inertia::render('dashboards/manager-dashboard');
    }

    public function operator(): Response
    {
        return Inertia::render('dashboards/operator-dashboard');
    }

    public function tenant(): Response
    {
        return Inertia::render('dashboards/tenant-dashboard');
    }
}