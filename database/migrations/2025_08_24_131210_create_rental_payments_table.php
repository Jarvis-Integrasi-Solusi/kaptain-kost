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
        Schema::create('rental_payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('rental_id')->nullable()->constrained('rentals')->onDelete('set null');
            $table->date('billing_date');
            $table->date('paid_at')->nullable();
            $table->integer('amount');
            $table->enum('category', ['rental_fee', 'deposit_fee', 'management_fee']);
            $table->enum('payment_status', ['paid', 'unpaid']);
            $table->enum('payment_method', ['cash', 'payment_gateway'])->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('rental_payments');
    }
};
