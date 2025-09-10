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
        Schema::create('tenant_service_payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_service_id')->nullable()->constrained('tenant_services')->onDelete('cascade');
            $table->integer('amount');
            $table->date('billing_date');
            $table->date('due_date');
            $table->date('paid_at')->nullable();
            $table->enum('payment_status', ['paid', 'pending', 'unpaid']);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tenant_service_payments');
    }
};
