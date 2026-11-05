<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('reservations', function (Blueprint $table) {
            $table->enum('status', ['PENDING', 'CONFIRMED', 'ACCEPTED', 'REJECTED', 'CANCELLED', 'COMPLETED'])
                ->default('PENDING')
                ->change();
        });
    }

    public function down(): void
    {
        Schema::table('reservations', function (Blueprint $table) {
            $table->enum('status', ['CONFIRMED', 'PENDING', 'CANCELLED', 'COMPLETED'])
                ->default('CONFIRMED')
                ->change();
        });
    }
};
