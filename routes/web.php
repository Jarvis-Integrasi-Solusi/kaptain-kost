<?php

use App\Http\Controllers\DashboardController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
})->name('home');

// Manager routes
Route::middleware(['auth', 'verified', 'role:manager'])->prefix('manager')->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'manager'])->name('manager.dashboard');

    // Route::get('/booking-chart', [BookingChartController::class, 'index'])->name('manager.booking-chart');
});

// Operator routes
Route::middleware(['auth', 'verified', 'role:operator'])->prefix('operator')->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'operator'])->name('operator.dashboard');
});

// Tenant routes
Route::middleware(['auth', 'verified', 'role:tenant'])->prefix('tenant')->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'tenant'])->name('tenant.dashboard');
});

// Default dashboard (untuk redirect berdasarkan role)
Route::middleware(['auth', 'verified'])->get('/dashboard', function () {
    $user = Auth::user();
    
    switch ($user->role) {
        case 'manager':
            return redirect()->route('manager.dashboard');
        case 'operator':
            return redirect()->route('operator.dashboard');
        case 'tenant':
            return redirect()->route('tenant.dashboard');
        default:
            // Fallback jika role tidak dikenali
            return Inertia::render('dashboard');
    }
})->name('dashboard');

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';