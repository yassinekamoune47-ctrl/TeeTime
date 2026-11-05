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
        Schema::table('golf_courses', function (Blueprint $table) {
                $table->foreignId('club_id')
                    ->nullable()
                    ->constrained('clubs')
                    ->nullOnDelete();

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('golf_courses', function (Blueprint $table) {
             $table->dropConstrainedForeignId('club_id');

        });
    }
};
