<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Club;
use App\Models\GolfCourse;
use App\Models\TimeSlot;
use App\Models\User;
use App\Traits\ApiResponseTrait;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TimeSlotController extends Controller
{
    use ApiResponseTrait;

    public function searchTimeSlots(Request $request): JsonResponse
    {
        $clubName = $request->input('clubName');
        $city = $request->input('city');
        $address = $request->input('address');
        $dateStr = $this->normaliseDate($request->input('date'));
        $page = (int) $request->input('page', 0);
        $size = (int) $request->input('size', 5);

        $query = Club::with(['golfCourses.timeSlots' => function ($q) use ($dateStr) {
            $q->whereDate('start_time', $dateStr)->orderBy('start_time');
        }]);

        if ($clubName) {
            $query->where('name', 'like', "%{$clubName}%");
        }
        if ($city) {
            $query->where('city', 'like', "%{$city}%");
        }
        if ($address) {
            $query->where('address', 'like', "%{$address}%");
        }

        $total = $query->count();
        $clubs = $query->skip($page * $size)->take($size)->get();

        $courseIds = $clubs->pluck('golfCourses')->flatten()->pluck('id')->filter()->values();
        $publishedDates = $this->publishedDatesByCourse($courseIds);

        $content = $clubs->map(function ($club) use ($dateStr, $publishedDates) {
            $courses = $club->golfCourses->map(function ($course) use ($dateStr, $publishedDates) {
                // Only tee times stored for this date are offered; nothing is invented here.
                $slots = $course->timeSlots;

                return [
                    'id' => (string) $course->id,
                    'name' => $course->name,
                    'holeCount' => (int) $course->number_of_holes,
                    'greenFee' => $course->priceForDate($dateStr),
                    'greenFeeWeekday' => $course->price_per_player !== null ? (float) $course->price_per_player : null,
                    'greenFeeWeekend' => $course->price_weekend !== null ? (float) $course->price_weekend : null,
                    'priceOnRequest' => $course->isPriceOnRequest(),
                    'description' => $course->description ?? '',
                    'imagesUrl' => $course->image ? [$course->image] : [],
                    'closedWeekdays' => $course->closedWeekdays(),
                    'availableDates' => $publishedDates[(string) $course->id] ?? [],
                    'timeSlots' => $this->slotPayload($slots),
                ];
            });

            return [
                'id' => (string) $club->id,
                'name' => $club->name,
                'city' => $club->city,
                'address' => $club->address,
                'description' => $club->description ?? '',
                'logoUrl' => $club->logo_url ?? '/teetime-logo.png',
                'coverUrl' => $club->cover_url ?? '/club 1.png',
                'openTime' => '07:00:00',
                'closeTime' => '20:00:00',
                'blockedForPlayer' => false,
                'bookingWindow' => $this->bookingWindow(),
                'courses' => $courses->values()->all(),
            ];
        })->values()->all();

        $hasMore = (($page + 1) * $size) < $total;

        return response()->json([
            'success' => true,
            'message' => 'Time slots retrieved successfully',
            'data' => [
                'content' => $content,
                'last' => !$hasMore,
                'bookingWindow' => $this->bookingWindow(),
            ],
        ]);
    }

    public function searchCourseTimeSlots(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'courseId' => 'required|exists:golf_courses,id',
            'date' => 'required|date_format:Y-m-d',
        ]);

        $course = GolfCourse::findOrFail($validated['courseId']);
        $slots = $course->timeSlots()
            ->whereDate('start_time', $validated['date'])
            ->orderBy('start_time')
            ->get();

        return $this->successResponse($this->slotPayload($slots), 'Time slots retrieved successfully');
    }

    public function availableDates(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'courseId' => 'required|exists:golf_courses,id',
        ]);

        $course = GolfCourse::findOrFail($validated['courseId']);

        return $this->successResponse([
            'bookingWindow' => $this->bookingWindow(),
            'closedWeekdays' => $course->closedWeekdays(),
            'availableDates' => $course->publishedDates(),
        ], 'Available dates retrieved successfully');
    }

    public function searchManagerTimeSlots(Request $request): JsonResponse
    {        $user = $request->user();
        $club = $user ? Club::where('owner_id', $user->id)->first() : null;
        $page = (int) $request->input('page', 0);
        $size = (int) $request->input('size', 50);

        if (! $club) {
            return $this->successResponse(['content' => [], 'last' => true], 'Time slots retrieved successfully');
        }

        $query = TimeSlot::with(['golfCourse', 'reservations.user'])
            ->whereHas('golfCourse', fn($q) => $q->where('club_id', $club->id));

        if ($request->filled('courseId')) {
            $query->where('golf_course_id', $request->input('courseId'));
        }

        if ($request->filled('dateFrom')) {
            $query->whereDate('start_time', '>=', $request->input('dateFrom'));
        }

        if ($request->filled('dateTo')) {
            $query->whereDate('start_time', '<=', $request->input('dateTo'));
        }

        if ($request->filled('q')) {
            $term = $request->input('q');
            $query->where(function ($q) use ($term) {
                $q->whereHas('golfCourse', fn($course) => $course->where('name', 'like', "%{$term}%"))
                    ->orWhereHas('reservations.user', function ($player) use ($term) {
                        $player->where('name', 'like', "%{$term}%")
                            ->orWhere('first_name', 'like', "%{$term}%")
                            ->orWhere('last_name', 'like', "%{$term}%");
                    });
            });
        }

        $total = $query->count();
        $slots = $query->orderBy('start_time')->skip($page * $size)->take($size)->get();

        $content = $slots->map(function (TimeSlot $slot) {
            $course = $slot->golfCourse;
            $reservations = $slot->reservations
                ->whereIn('status', ['PENDING', 'CONFIRMED', 'ACCEPTED'])
                ->values();

            return [
                'id' => (string) $slot->id,
                'startTime' => $slot->start_time->format('Y-m-d\TH:i:s'),
                'endTime' => $slot->end_time->format('Y-m-d\TH:i:s'),
                'status' => $slot->status,
                'bookedPlayers' => (int) $reservations->sum('number_of_players'),
                'courseId' => (string) $slot->golf_course_id,
                'courseName' => $course?->name ?? '',
                'greenFee' => $course?->priceForDate($slot->start_time),
                'priceOnRequest' => $course?->isPriceOnRequest() ?? true,
                'players' => $reservations->map(fn($reservation) => [
                    'reservationId' => (string) $reservation->id,
                    'playerName' => $reservation->user
                        ? ($reservation->user->first_name
                            ? "{$reservation->user->first_name} {$reservation->user->last_name}"
                            : $reservation->user->name)
                        : 'Joueur',
                    'phone' => $reservation->user?->phone_number ?? '',
                    'players' => (int) $reservation->number_of_players,
                ])->all(),
            ];
        })->values()->all();

        return $this->successResponse([
            'content' => $content,
            'last' => (($page + 1) * $size) >= $total,
        ], 'Time slots retrieved successfully');
    }

    public function createTimeSlot(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'startTime' => 'required',
            'endTime' => 'required',
            'status' => 'nullable|string|in:OPEN,CLOSED,RESERVED',
            'courseId' => 'required|exists:golf_courses,id',
        ]);

        if (! $this->canManageCourse($request->user(), (int) $validated['courseId'])) {
            return $this->errorResponse('Unauthorized', 403);
        }

        $course = GolfCourse::findOrFail($validated['courseId']);
        $start = Carbon::parse($validated['startTime']);

        // Managers publish on the same calendar players book from, so a tee time
        // outside the window or on a closed weekday is refused here too.
        if (! $course->isInBookingWindow($start)) {
            return $this->errorResponse(
                'Tee times can only be published between '
                    .GolfCourse::bookingWindowStart()->toDateString()
                    .' and '.GolfCourse::bookingWindowEnd()->toDateString(),
                422,
            );
        }

        if ($course->isClosedOn($start)) {
            return $this->errorResponse('This course is closed on that weekday', 422);
        }

        if ($course->timeSlots()->where('start_time', $start->copy()->setSeconds(0))->exists()) {
            return $this->errorResponse('A tee time already exists at that time', 422);
        }

        $slot = TimeSlot::create([
            'golf_course_id' => $validated['courseId'],
            'start_time' => $start,
            'end_time' => Carbon::parse($validated['endTime']),
            'status' => $validated['status'] ?? 'OPEN',
            'max_players' => 4,
        ]);

        return $this->successResponse([
            'id' => (string) $slot->id,
            'startTime' => $slot->start_time->toISOString(),
            'endTime' => $slot->end_time->toISOString(),
            'status' => $slot->status,
        ], 'Time slot created successfully', 201);
    }

    public function updateTimeSlotStatus(Request $request): JsonResponse
    {
        $id = $request->input('id');
        $status = $request->input('status');

        $slot = TimeSlot::findOrFail($id);

        if (! $this->canManageCourse($request->user(), (int) $slot->golf_course_id)) {
            return $this->errorResponse('Unauthorized', 403);
        }

        $slot->update(['status' => $status]);

        return $this->successResponse($slot, 'Time slot status updated');
    }

    private function canManageCourse(?User $user, int $courseId): bool
    {
        if (! $user) {
            return false;
        }

        if (strtoupper((string) $user->role) === 'ADMIN') {
            return true;
        }

        $club = $user->managedClub;

        if (! $club) {
            return false;
        }

        return GolfCourse::where('id', $courseId)->where('club_id', $club->id)->exists();
    }

    /**
     * @param  iterable<TimeSlot>  $slots
     * @return list<array<string, mixed>>
     */
    private function slotPayload(iterable $slots): array
    {
        $payload = [];

        foreach ($slots as $slot) {
            $payload[] = [
                'id' => (string) $slot->id,
                'startTime' => $slot->start_time->format('Y-m-d\TH:i:s'),
                'endTime' => $slot->end_time->format('Y-m-d\TH:i:s'),
                'bookedPlayers' => $slot->booked_players_count ?? 0,
                'status' => $slot->status ?? 'OPEN',
            ];
        }

        return $payload;
    }

    /**
     * Dates inside the booking window for which a course actually has a tee time
     * that is not closed. Read in one query and grouped in PHP so the same code
     * works on the MySQL and the SQLite test database.
     *
     * @param  \Illuminate\Support\Collection<int, int|string>  $courseIds
     * @return array<string, list<string>>
     */
    private function publishedDatesByCourse($courseIds): array
    {
        if ($courseIds->isEmpty()) {
            return [];
        }

        $rows = TimeSlot::query()
            ->whereIn('golf_course_id', $courseIds)
            ->where('status', '!=', 'CLOSED')
            ->whereBetween('start_time', [
                GolfCourse::bookingWindowStart(),
                GolfCourse::bookingWindowEnd(),
            ])
            ->orderBy('start_time')
            ->get(['golf_course_id', 'start_time']);

        $dates = [];

        foreach ($rows as $row) {
            $key = (string) $row->golf_course_id;
            $date = $row->start_time->toDateString();

            if (! isset($dates[$key])) {
                $dates[$key] = [];
            }

            if (! in_array($date, $dates[$key], true)) {
                $dates[$key][] = $date;
            }
        }

        return $dates;
    }

    /**
     * A requested date outside the published window (or a past day) is replaced by
     * the first bookable day, so no caller can ask for a date no club could honour.
     */
    private function normaliseDate(?string $dateStr): string
    {
        if (! $dateStr) {
            return GolfCourse::bookingWindowStart()->toDateString();
        }

        try {
            $date = Carbon::parse($dateStr)->startOfDay();
        } catch (\Throwable) {
            return GolfCourse::bookingWindowStart()->toDateString();
        }

        $start = GolfCourse::bookingWindowStart();
        $end = GolfCourse::bookingWindowEnd();

        if ($date->lt($start)) {
            return $start->toDateString();
        }

        if ($date->gt($end)) {
            return $end->toDateString();
        }

        return $date->toDateString();
    }

    /**
     * @return array<string, string>
     */
    private function bookingWindow(): array
    {
        return [
            'start' => GolfCourse::bookingWindowStart()->toDateString(),
            'end' => GolfCourse::bookingWindowEnd()->toDateString(),
            'days' => GolfCourse::BOOKING_WINDOW_DAYS,
        ];
    }
}
