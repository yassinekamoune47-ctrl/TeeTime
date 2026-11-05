<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Legacy test course ("Golf de Casablanca") has no club and no published
     * tariff, so it must not appear in any course listing.
     */
    public function up(): void
    {
        DB::table('golf_courses')
            ->whereNull('club_id')
            ->where('is_active', true)
            ->update(['is_active' => false, 'updated_at' => now()]);
    }

    public function down(): void
    {
        DB::table('golf_courses')
            ->whereNull('club_id')
            ->where('name', 'Golf de Casablanca')
            ->update(['is_active' => true, 'updated_at' => now()]);
    }
};
