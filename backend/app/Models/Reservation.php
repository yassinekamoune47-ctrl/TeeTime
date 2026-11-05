<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Reservation extends Model
{
    protected $fillable = [
        'user_id',
        'golf_course_id',
        'time_slot_id',
        'reservation_date',
        'number_of_players',
        'status',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'reservation_date' => 'date',
            'number_of_players' => 'integer',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function golfCourse(): BelongsTo
    {
        return $this->belongsTo(GolfCourse::class);
    }

    public function timeSlot(): BelongsTo
    {
        return $this->belongsTo(TimeSlot::class);
    }

    public function toPlayerReservationDto(): array
    {
        $course = $this->golfCourse;
        $club = $course ? $course->club : null;
        $slot = $this->timeSlot;
        $reservationDate = $this->reservation_date
            ?? $slot?->start_time
            ?? $this->created_at;

        return [
            'reservationId' => (string) $this->id,
            'status' => $this->status,
            'reservationDate' => $reservationDate ? $reservationDate->format('Y-m-d') : '',
            'numberOfPlayers' => (int) $this->number_of_players,
            'clubId' => $club ? (string) $club->id : '',
            'clubName' => $club ? $club->name : 'TeeTime Golf Club',
            'clubLogoURL' => $club ? $club->logo_url : '/teetime-logo.png',
            'courseId' => $course ? (string) $course->id : '',
            'courseName' => $course ? $course->name : '',
            'timeSlotId' => $slot ? (string) $slot->id : '',
            'startTime' => $slot ? $slot->start_time->format('Y-m-d\TH:i:s') : ($this->created_at ? $this->created_at->format('Y-m-d\TH:i:s') : ''),
            'endTime' => $slot ? $slot->end_time->format('Y-m-d\TH:i:s') : '',
            'createdAt' => $this->created_at ? $this->created_at->toISOString() : '',
        ];
    }
}
