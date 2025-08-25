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
        Schema::create('rentals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->nullable()->constrained('companies')->onDelete('set null');
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('room_id')->nullable()->constrained('rooms')->onDelete('set null');
            $table->foreignId('rental_period_id')->nullable()->constrained('rental_periods');
            $table->foreignId('payment_type_id')->nullable()->constrained('payment_types');
            $table->date('entry_date');
            $table->date('exit_date')->nullable();
            $table->integer('total_price');
            $table->enum('payment_status', ['paid', 'in_progress', 'unpaid']);
            $table->enum('payment_type', ['cash', 'monthly']);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('rentals');
    }
};
