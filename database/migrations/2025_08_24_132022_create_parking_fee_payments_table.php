<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('parking_fee_payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_vehicle_id')->nullable()->constrained('tenant_vehicles')->onDelete('set null');
            $table->date('billing_date');
            $table->date('paid_at')->nullable();
            $table->integer('amount');
            $table->enum('payment_status', ['paid', 'in_progress', 'unpaid']);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('parking_fee_payments');
    }
};
