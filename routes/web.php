<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\Manager\Rental\PaymentController as ManagerRentalPaymentController;
use App\Http\Controllers\Tenant\Rental\PaymentController as TenantRentalPaymentController;
use App\Http\Controllers\Tenant\Rental\RecordController as TenantRentalRecordController;
use App\Http\Controllers\Manager\Rental\PaymentTypeController;
use App\Http\Controllers\Manager\Rental\PeriodController;
use App\Http\Controllers\Manager\Rental\RecordController;
use App\Http\Controllers\Manager\Room\CategoryController;
use App\Http\Controllers\Manager\Room\ConditionStatusController;
use App\Http\Controllers\Manager\Room\OccupancyStatusController;
use App\Http\Controllers\Manager\Room\RoomController;
use App\Http\Controllers\Manager\User\ManagerController;
use App\Http\Controllers\Manager\User\TenantController;
use App\Http\Controllers\Manager\User\UserController;
use App\Http\Controllers\Tenant\ProfileController;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

Route::get('/', function () {
    if (!Auth::check()) {
        return redirect()->route('login');
    }

    return redirect()->route('dashboard');
});

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
        Route::get('/occupancy-status/{id}', [OccupancyStatusController::class, 'show'])->name('manager.room.occupancy-status.show');

        Route::get('/condition-status', [ConditionStatusController::class, 'index'])->name('manager.room.condition-status.index');
        Route::get('/condition-status/{id}', [ConditionStatusController::class, 'show'])->name('manager.room.condition-status.show');

        Route::get('/', [RoomController::class, 'index'])->name('manager.room.index');
        Route::get('/create', [RoomController::class, 'create'])->name('manager.room.create');
        Route::get('/{id}', [RoomController::class, 'show'])->name('manager.room.show');
        Route::post('/', [RoomController::class, 'store'])->name('manager.room.store');
        Route::get('/{id}/edit', [RoomController::class, 'edit'])->name('manager.room.edit');
        Route::put('/{id}', [RoomController::class, 'update'])->name('manager.room.update');
        Route::delete('/{id}', [RoomController::class, 'destroy'])->name('manager.room.destroy');
    });

    // Rental Management
    Route::prefix('rental')->group(function () {

        Route::get('/period', [PeriodController::class, 'index'])->name('manager.rental.period.index');

        Route::get('/payment-type', [PaymentTypeController::class, 'index'])->name('manager.rental.payment-type.index');

        Route::get('/', [RecordController::class, 'index'])->name('manager.rental.record.index');
        Route::get('/create', [RecordController::class, 'create'])->name('manager.rental.record.create');
        Route::post('/', [RecordController::class, 'store'])->name('manager.rental.record.store');
        Route::get('/{id}', [RecordController::class, 'show'])->name('manager.rental.record.show');
        Route::get('/{id}/edit', [RecordController::class, 'edit'])->name('manager.rental.record.edit');
        Route::put('/{id}', [RecordController::class, 'update'])->name('manager.rental.record.update');
        Route::delete('/{id}', [RecordController::class, 'destroy'])->name('manager.rental.record.destroy');
        Route::post('/{id}/terminate', [RecordController::class, 'terminate'])->name('manager.rental.record.terminate');
        Route::post('/{id}/return-deposit', [RecordController::class, 'returnDeposit'])->name('manager.rental.record.return-deposit');

        // payment
        Route::post('/payment/{id}/mark-as-paid', [ManagerRentalPaymentController::class, 'markAsPaid'])->name('manager.rental.payment.mark-as-paid');
    });

    // User Management
    Route::prefix('user')->group(function () {
        Route::post('/{id}/deactivate', [UserController::class, 'deactivate'])->name('manager.user.deactivate');

        Route::get('/manager', [ManagerController::class, 'index'])->name('manager.user.manager.index');
        Route::get('/manager/create', [ManagerController::class, 'create'])->name('manager.user.manager.create');
        Route::post('/manager', [ManagerController::class, 'store'])->name('manager.user.manager.store');
        Route::get('/manager/{id}', [ManagerController::class, 'show'])->name('manager.user.manager.show');
        Route::get('/manager/{id}/edit', [ManagerController::class, 'edit'])->name('manager.user.manager.edit');
        Route::put('/manager/{id}', [ManagerController::class, 'update'])->name('manager.user.manager.update');
        Route::delete('/manager/{id}', [ManagerController::class, 'destroy'])->name('manager.user.manager.destroy');

        // Route::get('/operator', [OperatorController::class, 'index'])->name('manager.user.operator.index');
        // Route::get('/operator/create', [OperatorController::class, 'create'])->name('manager.user.operator.create');
        // Route::post('/operator', [OperatorController::class, 'store'])->name('manager.user.operator.store');
        // Route::get('/operator/{id}', [OperatorController::class, 'show'])->name('manager.user.operator.show');
        // Route::get('/operator/{id}/edit', [OperatorController::class, 'edit'])->name('manager.user.operator.edit');
        // Route::put('/operator/{id}', [OperatorController::class, 'update'])->name('manager.user.operator.update');
        // Route::delete('/operator/{id}', [OperatorController::class, 'destroy'])->name('manager.user.operator.destroy');

        Route::get('/tenant', [TenantController::class, 'index'])->name('manager.user.tenant.index');
        Route::get('/tenant/create', [TenantController::class, 'create'])->name('manager.user.tenant.create');
        Route::post('/tenant', [TenantController::class, 'store'])->name('manager.user.tenant.store');
        Route::get('/tenant/{id}', [TenantController::class, 'show'])->name('manager.user.tenant.show');
        Route::get('/tenant/{id}/edit', [TenantController::class, 'edit'])->name('manager.user.tenant.edit');
        Route::put('/tenant/{id}', [TenantController::class, 'update'])->name('manager.user.tenant.update');
        Route::delete('/tenant/{id}', [TenantController::class, 'destroy'])->name('manager.user.tenant.destroy');
    });

});

// Tenant routes
Route::middleware(['auth', 'verified', 'role:tenant'])->prefix('tenant')->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'tenant'])->name('tenant.dashboard');

    // profile 
    Route::get('/profile', [ProfileController::class, 'edit'])->name('tenant.profile.edit');
    Route::put('/profile', [ProfileController::class, 'update'])->name('tenant.profile.update');

    // rental and rental payment
    Route::get('/rental', [TenantRentalRecordController::class, 'index'])->name('tenant.rental.index');
    Route::get('/rental/{id}', [TenantRentalRecordController::class, 'show'])->name('tenant.rental.show');
    Route::get('/rental/payment/{paymentId}', [TenantRentalPaymentController::class, 'show'])->name('tenant.rental.payment.show');
    Route::post('/rental/payment/{paymentId}/cash', [TenantRentalPaymentController::class, 'cashPayment'])->name('tenant.rental.payment.cash');



});

// Operator routes
Route::middleware(['auth', 'verified', 'role:operator'])->prefix('operator')->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'operator'])->name('operator.dashboard');
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