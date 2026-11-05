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
        
    Schema::create('clubs', function (Blueprint $table) {
        $table->id();
        $table->string('name');
        $table->string('city');
        $table->string('address');
        $table->text('description')->nullable();
        $table->string('phone')->nullable();
        $table->string('email')->nullable();
        $table->string('logo_url')->nullable();
        $table->string('cover_url')->nullable();

        $table->foreignId('owner_id')
            ->nullable()
            ->constrained('users')
            ->nullOnDelete();

        $table->enum('status', ['ACTIVE', 'SUSPENDED', 'ARCHIVED'])
            ->default('ACTIVE');

        $table->timestamps();
    });

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('clubs');
    }
};
