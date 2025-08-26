<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\Manager\Room\CategoryController;
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
    Route::get('/room-category', [CategoryController::class, 'index'])->name('manager.room-category.index');
    Route::get('/room-category/create', [CategoryController::class, 'create'])->name('manager.room-category.create');      
    Route::post('/room-category', [CategoryController::class, 'store'])->name('manager.room-category.store');
    Route::get('/room-category/{id}', [CategoryController::class, 'show'])->name('manager.room-category.show');
    Route::get('/room-category/{id}/edit', [CategoryController::class, 'edit'])->name('manager.room-category.edit');
    Route::put('/room-category/{id}', [CategoryController::class, 'update'])->name('manager.room-category.update');
    Route::delete('/room-category/{id}', [CategoryController::class, 'destroy'])->name('manager.room-category.destroy');
    

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