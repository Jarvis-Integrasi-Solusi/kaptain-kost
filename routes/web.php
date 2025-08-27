<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\Manager\Room\CategoryController;
use App\Http\Controllers\Manager\Room\ConditionStatusController;
use App\Http\Controllers\Manager\Room\FacilityController;
use App\Http\Controllers\Manager\Room\OccupancyStatusController;
use App\Http\Controllers\Manager\Room\RoomController;
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

    // Room management
    Route::prefix('room')->group(function () {
        Route::get('/category', [CategoryController::class, 'index'])->name('manager.room.category.index');
        Route::get('/category/create', [CategoryController::class, 'create'])->name('manager.room.category.create');
        Route::post('/category', [CategoryController::class, 'store'])->name('manager.room.category.store');
        Route::get('/category/{id}', [CategoryController::class, 'show'])->name('manager.room.category.show');
        Route::get('/category/{id}/edit', [CategoryController::class, 'edit'])->name('manager.room.category.edit');
        Route::put('/category/{id}', [CategoryController::class, 'update'])->name('manager.room.category.update');
        Route::delete('/category/{id}', [CategoryController::class, 'destroy'])->name('manager.room.category.destroy');

        Route::get('/occupancy-status', [OccupancyStatusController::class, 'index'])->name('manager.room.occupancy-status.index');
            Route::post('/occupancy-status', [OccupancyStatusController::class, 'store'])->name('manager.room.occupancy-status.store');
            Route::put('/occupancy-status/{id}', [OccupancyStatusController::class, 'update'])->name('manager.room.occupancy-status.update');
            Route::delete('/occupancy-status/{id}', [OccupancyStatusController::class, 'destroy'])->name('manager.room.occupancy-status.destroy');

        Route::get('/condition-status', [ConditionStatusController::class, 'index'])->name('manager.room.condition-status.index');

        Route::get('/facility', [FacilityController::class, 'index'])->name('manager.room.facility.index');

        Route::get('/', [RoomController::class, 'index'])->name('manager.room.index');
    });



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