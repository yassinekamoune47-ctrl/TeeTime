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
        Schema::create('tournaments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('club_id')->nullable()->constrained('clubs')->nullOnDelete();
            $table->string('name');
            $table->text('description')->nullable();
            $table->dateTime('date');
            $table->string('location');
            $table->enum('status', ['PENDING', 'ACTIVE', 'COMPLETED', 'CANCELED'])->default('PENDING');
            $table->string('image_url')->nullable();
            $table->decimal('entry_fee', 10, 2)->default(0);
            $table->unsignedInteger('max_participants')->default(50);
            $table->unsignedInteger('current_participants')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tournaments');
    }
};
