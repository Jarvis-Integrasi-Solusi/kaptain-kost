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
        Schema::create('rooms', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->nullable()->constrained('companies')->onDelete('set null');
            $table->foreignId('occupancy_status_id')->constrained('occupancy_statuses');
            $table->foreignId('condition_status_id')->constrained('condition_statuses');
            $table->foreignId('room_category_id')->constrained('room_categories');
            $table->string('name');
            $table->string('image')->nullable();
            $table->enum('type', ['superior', 'deluxe']);
            $table->string('description')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('rooms');
    }
};
