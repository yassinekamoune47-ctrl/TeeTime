<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * A course publishes tee times only on the days it is open, so the weekly
     * maintenance days have to live in the database instead of being invented
     * per request. Values follow Carbon's dayOfWeekIso (1 = Monday … 7 = Sunday);
     * null or an empty list means the course is open every day.
     */
    public function up(): void
    {
        Schema::table('golf_courses', function (Blueprint $table) {
            $table->json('closed_weekdays')->nullable()->after('is_active');
        });
    }

    public function down(): void
    {
        Schema::table('golf_courses', function (Blueprint $table) {
            $table->dropColumn('closed_weekdays');
        });
    }
};
