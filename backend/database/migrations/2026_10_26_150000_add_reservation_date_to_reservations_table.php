<?php

use Carbon\Carbon;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('reservations', function (Blueprint $table) {
            $table->date('reservation_date')->nullable()->after('time_slot_id');
        });

        // Backfill existing reservations from their tee time, falling back to the creation date.
        $reservations = DB::table('reservations')->select('id', 'time_slot_id', 'created_at')->orderBy('id')->get();

        foreach ($reservations as $reservation) {
            $slotStart = $reservation->time_slot_id
                ? DB::table('time_slots')->where('id', $reservation->time_slot_id)->value('start_time')
                : null;

            $reservationDate = $slotStart
                ? Carbon::parse($slotStart)->toDateString()
                : Carbon::parse($reservation->created_at)->toDateString();

            DB::table('reservations')
                ->where('id', $reservation->id)
                ->update(['reservation_date' => $reservationDate]);
        }
    }

    public function down(): void
    {
        Schema::table('reservations', function (Blueprint $table) {
            $table->dropColumn('reservation_date');
        });
    }
};
