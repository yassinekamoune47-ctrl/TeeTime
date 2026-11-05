<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TimeSlot extends Model
{
    protected $fillable = [
        'golf_course_id',
        'start_time',
        'end_time',
        'status',
        'max_players',
    ];

    protected function casts(): array
    {
        return [
            'start_time' => 'datetime',
            'end_time' => 'datetime',
            'max_players' => 'integer',
        ];
    }

    public function golfCourse(): BelongsTo
    {
        return $this->belongsTo(GolfCourse::class);
    }

    public function reservations(): HasMany
    {
        return $this->hasMany(Reservation::class);
    }

    public function getBookedPlayersCountAttribute(): int
    {
        return (int) $this->reservations()
            ->whereIn('status', ['PENDING', 'CONFIRMED', 'ACCEPTED'])
            ->sum('number_of_players');
    }
}
