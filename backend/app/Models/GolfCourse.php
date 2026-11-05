<?php

namespace App\Models;

use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

class GolfCourse extends Model
{
    /**
     * How far ahead a club publishes tee times, mirroring real Moroccan clubs
     * that open a rolling two-week booking sheet rather than an open calendar.
     */
    public const BOOKING_WINDOW_DAYS = 14;

    protected $fillable = [
        'club_id',
        'name',
        'description',
        'location',
        'price_per_player',
        'price_weekend',
        'green_fees',
        'extra_fees',
        'number_of_holes',
        'image',
        'is_active',
        'closed_weekdays',
    ];

    protected function casts(): array
    {
        return [
            'price_per_player' => 'decimal:2',
            'price_weekend' => 'decimal:2',
            'green_fees' => 'array',
            'extra_fees' => 'array',
            'number_of_holes' => 'integer',
            'is_active' => 'boolean',
            'closed_weekdays' => 'array',
        ];
    }

    public function club(): BelongsTo
    {
        return $this->belongsTo(Club::class);
    }

    public function timeSlots(): HasMany
    {
        return $this->hasMany(TimeSlot::class);
    }

    public function reservations(): HasMany
    {
        return $this->hasMany(Reservation::class);
    }

    /**
     * Weekday public green fee unless the date falls on Sat/Sun and a
     * weekend tariff is published (Royal Golf Anfa Mohammedia only).
     */
    public function priceForDate(CarbonInterface|string|null $date = null): ?float
    {
        if ($this->price_per_player === null) {
            return null;
        }

        $day = $date === null
            ? Carbon::today()
            : ($date instanceof CarbonInterface ? $date : Carbon::parse($date));

        if ($this->price_weekend !== null && $day->isWeekend()) {
            return (float) $this->price_weekend;
        }

        return (float) $this->price_per_player;
    }

    public function isPriceOnRequest(): bool
    {
        return $this->price_per_player === null;
    }

    public function closedWeekdays(): array
    {
        return array_values(array_unique(array_map('intval', $this->closed_weekdays ?? [])));
    }

    /**
     * @param  CarbonInterface|string  $date  a calendar day, compared on dayOfWeekIso (1 = Monday … 7 = Sunday)
     */
    public function isClosedOn(CarbonInterface|string $date): bool
    {
        $day = $date instanceof CarbonInterface ? $date : Carbon::parse($date);

        return in_array($day->dayOfWeekIso, $this->closedWeekdays(), true);
    }

    public static function bookingWindowStart(): Carbon
    {
        return Carbon::tomorrow()->startOfDay();
    }

    public static function bookingWindowEnd(): Carbon
    {
        return static::bookingWindowStart()
            ->copy()
            ->addDays(self::BOOKING_WINDOW_DAYS - 1)
            ->endOfDay();
    }

    public function isInBookingWindow(CarbonInterface|string $date): bool
    {
        $day = $date instanceof CarbonInterface ? $date : Carbon::parse($date);

        return $day->betweenIncluded(static::bookingWindowStart(), static::bookingWindowEnd());
    }

    /**
     * @return list<string>  YYYY-MM-DD
     */
    public function openDatesInWindow(): array
    {
        $dates = [];
        $cursor = static::bookingWindowStart();
        $end = static::bookingWindowEnd();

        while ($cursor->lte($end)) {
            if (! $this->isClosedOn($cursor)) {
                $dates[] = $cursor->toDateString();
            }

            $cursor->addDay();
        }

        return $dates;
    }

    /**
     * The subset of openDatesInWindow() a club has actually published tee times
     * for — this is what the booking calendar may offer.
     *
     * @return list<string>  YYYY-MM-DD
     */
    public function publishedDates(): array
    {
        return $this->timeSlots()
            ->where('status', '!=', 'CLOSED')
            ->whereBetween('start_time', [static::bookingWindowStart(), static::bookingWindowEnd()])
            ->orderBy('start_time')
            ->get(['start_time'])
            ->map(fn (TimeSlot $slot) => $slot->start_time->toDateString())
            ->unique()
            ->values()
            ->all();
    }

    public function toCourseDto(): array
    {
        return [
            'id' => (string) $this->id,
            'name' => $this->name,
            'description' => $this->description ?? '',
            'holeCount' => (int) $this->number_of_holes,
            'greenFee' => $this->price_per_player !== null ? (float) $this->price_per_player : null,
            'greenFeeWeekend' => $this->price_weekend !== null ? (float) $this->price_weekend : null,
            'greenFees' => $this->green_fees ?? [],
            'extraFees' => $this->extra_fees ?? [],
            'priceOnRequest' => $this->isPriceOnRequest(),
            'closedWeekdays' => $this->closedWeekdays(),
            'status' => $this->is_active ? 'ACTIVE' : 'SUSPENDED',
            'createdAt' => $this->created_at ? $this->created_at->toISOString() : '',
            'imagesUrls' => $this->image ? [$this->image] : [],
        ];
    }
}
