<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('membership_requests', function (Blueprint $table) {
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
        });

        DB::table('membership_requests')->orderBy('id')->chunkById(100, function ($rows) {
            foreach ($rows as $row) {
                $start = Carbon::parse($row->created_at)->startOfDay();

                DB::table('membership_requests')->where('id', $row->id)->update([
                    'start_date' => $start->toDateString(),
                    'end_date' => $start->copy()->addMonthNoOverflow()->toDateString(),
                ]);
            }
        });
    }

    public function down(): void
    {
        Schema::table('membership_requests', function (Blueprint $table) {
            $table->dropColumn(['start_date', 'end_date']);
        });
    }
};
