<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Club;
use App\Models\GolfCourse;
use App\Models\Notification;
use App\Models\Reservation;
use App\Models\TimeSlot;
use App\Traits\ApiResponseTrait;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReservationController extends Controller
{
    use ApiResponseTrait;

    public function searchPlayerReservations(Request $request): JsonResponse
    {
        $user = $request->user();

        if (! $user) {
            return $this->errorResponse('Unauthenticated', 401);
        }

        $query = Reservation::with(['golfCourse.club', 'timeSlot'])
            ->where('user_id', $user->id)
            ->latest();

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->filled('search')) {
            $term = $request->input('search');
            $query->where(function ($q) use ($term) {
                $q->whereHas('golfCourse.club', fn($c) => $c->where('name', 'like', "%{$term}%"))
                  ->orWhereHas('golfCourse', fn($g) => $g->where('name', 'like', "%{$term}%"));
            });
        }

        $page = (int) $request->input('page', 0);
        $size = (int) $request->input('size', 10);

        $reservations = $query->skip($page * $size)->take($size)->get();

        $dtos = $reservations->map(fn($r) => $r->toPlayerReservationDto())->values()->all();

        return $this->successResponse($dtos, 'Reservations retrieved successfully', 200, [
            'length' => count($dtos),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $user = $request->user();

        if (! $user) {
            return $this->errorResponse('Unauthenticated', 401);
        }

        $validated = $request->validate([
            'courseId' => 'nullable|exists:golf_courses,id',
            'timeSlotId' => 'nullable|exists:time_slots,id',
            'numberOfPlayers' => 'nullable|integer|min:1|max:4',
            'players' => 'nullable|integer|min:1|max:4',
            'reservationDate' => 'nullable|date_format:Y-m-d',
            'startTime' => 'nullable|date',
            'notes' => 'nullable|string',
        ]);

        $course = $this->resolveCourse($validated);

        if (! $course) {
            return $this->errorResponse('courseId or timeSlotId is required', 422);
        }

        $start = $request->filled('startTime')
            ? Carbon::parse($validated['startTime'])
            : null;
        $requestedDate = isset($validated['reservationDate'])
            ? Carbon::createFromFormat('Y-m-d', $validated['reservationDate'])->startOfDay()
            : null;

        if ($start && $requestedDate) {
            $start->setDate($requestedDate->year, $requestedDate->month, $requestedDate->day);
        }

        $slot = $this->resolveSlot($validated, $course, $start);

        if (! $slot) {
            return $this->errorResponse(
                'No tee time is published for this course on the selected date',
                422,
            );
        }

        $slotDate = $slot->start_time->copy()->startOfDay();

        if (! $course->isInBookingWindow($slotDate)) {
            return $this->errorResponse(
                'Bookings open from '.GolfCourse::bookingWindowStart()->toDateString()
                    .' to '.GolfCourse::bookingWindowEnd()->toDateString(),
                422,
            );
        }

        if ($course->isClosedOn($slotDate)) {
            return $this->errorResponse('This course is closed on the selected date', 422);
        }

        if ($slot->status === 'CLOSED') {
            return $this->errorResponse('This tee time is closed', 422);
        }

        $players = $validated['numberOfPlayers'] ?? $validated['players'] ?? 1;

        if ($slot->booked_players_count + $players > $slot->max_players) {
            $remaining = max(0, $slot->max_players - $slot->booked_players_count);

            return $this->errorResponse(
                $remaining === 0
                    ? 'This tee time is fully booked'
                    : "Only {$remaining} place(s) left on this tee time",
                422,
            );
        }

        $reservation = Reservation::create([
            'user_id' => $user->id,
            'golf_course_id' => $course->id,
            'time_slot_id' => $slot->id,
            'reservation_date' => $slotDate->toDateString(),
            'number_of_players' => $players,
            'status' => 'PENDING',
            'notes' => $validated['notes'] ?? null,
        ]);

        return $this->successResponse($reservation->toPlayerReservationDto(), 'Reservation created successfully', 201);
    }

    /**
     * The course a booking targets, taken from the submitted course or from the
     * tee time when only a slot was given.
     */
    private function resolveCourse(array $validated): ?GolfCourse
    {
        if (! empty($validated['courseId'])) {
            return GolfCourse::find($validated['courseId']);
        }

        if (! empty($validated['timeSlotId'])) {
            return TimeSlot::find($validated['timeSlotId'])?->golfCourse;
        }

        return null;
    }

    /**
     * A reservation always points at a tee time the club actually published: the
     * requested slot, or the stored slot for the course at the requested time.
     * Nothing is created here, so the calendar and the database cannot drift.
     */
    private function resolveSlot(array $validated, GolfCourse $course, ?Carbon $start): ?TimeSlot
    {
        if (! empty($validated['timeSlotId'])) {
            $slot = TimeSlot::find($validated['timeSlotId']);

            return $slot && $slot->golf_course_id === $course->id ? $slot : null;
        }

        if (! $start) {
            return null;
        }

        return $course->timeSlots()
            ->where('start_time', $start->copy()->setSeconds(0))
            ->first();
    }

    public function searchClubReservations(Request $request): JsonResponse
    {
        $club = $this->managerClub($request);
        $page = (int) $request->input('page', 0);
        $size = (int) $request->input('size', 10);

        if (! $club) {
            return $this->successResponse(['content' => [], 'last' => true], 'Reservations retrieved successfully');
        }

        $query = Reservation::with(['user', 'golfCourse', 'timeSlot'])
            ->whereHas('golfCourse', fn($q) => $q->where('club_id', $club->id))
            ->latest();

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->filled('courseId')) {
            $query->where('golf_course_id', $request->input('courseId'));
        }

        if ($request->filled('date')) {
            $query->whereDate('reservation_date', $request->input('date'));
        }

        if ($request->filled('name')) {
            $term = $request->input('name');
            $query->whereHas('user', function ($q) use ($term) {
                $q->where('name', 'like', "%{$term}%")
                    ->orWhere('first_name', 'like', "%{$term}%")
                    ->orWhere('last_name', 'like', "%{$term}%");
            });
        }

        $total = $query->count();
        $items = $query->skip($page * $size)->take($size)->get();

        $content = $items->map(function (Reservation $reservation) {
            $user = $reservation->user;
            $course = $reservation->golfCourse;
            $slot = $reservation->timeSlot;

            return [
                'id' => (string) $reservation->id,
                'status' => match ($reservation->status) {
                    'ACCEPTED', 'CONFIRMED' => 'ACCEPTED',
                    'REJECTED' => 'REJECTED',
                    default => 'PENDING',
                },
                'playerName' => $user ? ($user->first_name ? "{$user->first_name} {$user->last_name}" : $user->name) : 'Joueur',
                'playerPhone' => $user?->phone_number ?? '',
                'courseId' => (string) $reservation->golf_course_id,
                'courseName' => $course?->name ?? '',
                'reservationDate' => $reservation->reservation_date?->format('Y-m-d')
                    ?? $slot?->start_time?->format('Y-m-d')
                    ?? '',
                'startTime' => $slot ? $slot->start_time->format('Y-m-d\TH:i:s') : ($reservation->created_at?->format('Y-m-d\TH:i:s') ?? ''),
                'numberOfPlayers' => (int) $reservation->number_of_players,
                'greenFee' => $course?->priceForDate(
                    $reservation->reservation_date ?? $slot?->start_time
                ),
                'priceOnRequest' => $course?->isPriceOnRequest() ?? true,
                'requestedAt' => $reservation->created_at?->toISOString() ?? '',
            ];
        })->values()->all();

        return $this->successResponse([
            'content' => $content,
            'last' => (($page + 1) * $size) >= $total,
        ], 'Reservations retrieved successfully');
    }

    public function updateStatus(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'id' => 'required|exists:reservations,id',
            'status' => 'required|in:ACCEPTED,REJECTED',
            'reason' => 'nullable|string|max:300',
        ]);

        $reservation = Reservation::with(['golfCourse.club', 'timeSlot'])->findOrFail($validated['id']);
        $user = $request->user();

        if (! $user || strtoupper((string) $user->role) !== 'ADMIN') {
            return $this->errorResponse('Unauthorized', 403);
        }

        $statusChanged = $reservation->status !== $validated['status'];

        $reservation->update(['status' => $validated['status']]);

        if ($statusChanged) {
            $this->notifyStatusChange($reservation, $validated['status'], $validated['reason'] ?? null);
        }

        $autoRejected = 0;

        if ($validated['status'] === 'ACCEPTED' && $reservation->time_slot_id) {
            $slot = TimeSlot::with('reservations')->find($reservation->time_slot_id);
            if ($slot) {
                $accepted = $slot->reservations
                    ->whereIn('status', ['ACCEPTED', 'CONFIRMED'])
                    ->sum('number_of_players');

                if ($accepted > $slot->max_players) {
                    $pending = $slot->reservations
                        ->where('status', 'PENDING')
                        ->where('id', '!=', $reservation->id)
                        ->sortByDesc('id');

                    foreach ($pending as $displaced) {
                        if ($accepted <= $slot->max_players) {
                            break;
                        }
                        $displaced->update(['status' => 'REJECTED']);
                        $accepted -= $displaced->number_of_players;
                        $autoRejected++;
                        $this->notifyStatusChange($displaced, 'REJECTED', 'Les places sur ce départ sont complètes.');
                    }
                }
            }
        }

        return $this->successResponse(['autoRejected' => $autoRejected], 'Reservation status updated successfully');
    }

    /**
     * One notification per real status change, linked to the player and the
     * reservation, so the notification center can show the details without a
     * second lookup.
     */
    private function notifyStatusChange(Reservation $reservation, string $status, ?string $reason = null): void
    {
        $reservation->loadMissing(['golfCourse.club', 'timeSlot']);
        $course = $reservation->golfCourse;
        $slot = $reservation->timeSlot;
        $date = $reservation->reservation_date ?? $slot?->start_time;
        $isApproved = $status === 'ACCEPTED';

        Notification::create([
            'user_id' => $reservation->user_id,
            'title' => $isApproved ? 'Réservation acceptée' : 'Réservation refusée',
            'message' => $isApproved
                ? 'Votre réservation a été approuvée !'
                : 'Malheureusement, votre demande de réservation a été refusée.',
            'type' => $isApproved ? 'RESERVATION_CONFIRMED' : 'RESERVATION_REJECTED',
            'data' => [
                'reservationId' => (string) $reservation->id,
                'clubName' => $course?->club?->name,
                'courseName' => $course?->name,
                'reservationDate' => $date?->format('Y-m-d'),
                'startTime' => $slot?->start_time?->format('H:i') ?? $date?->format('H:i'),
                'numberOfPlayers' => (int) $reservation->number_of_players,
                'reason' => ($reason ?? '') !== '' ? $reason : null,
            ],
        ]);
    }

    private function managerClub(Request $request): ?Club
    {
        $user = $request->user();

        return $user ? Club::where('owner_id', $user->id)->first() : null;
    }

    public function cancel(Request $request, string $id): JsonResponse
    {
        $user = $request->user();

        if (! $user) {
            return $this->errorResponse('Unauthenticated', 401);
        }

        $reservation = Reservation::with(['golfCourse.club', 'timeSlot'])->find($id);

        if (! $reservation) {
            return $this->errorResponse('Reservation not found', 404);
        }

        $isAdmin = strtoupper((string) $user->role) === 'ADMIN';

        if (! $isAdmin && (int) $reservation->user_id !== (int) $user->id) {
            return $this->errorResponse('Unauthorized', 403);
        }

        if ($reservation->status !== 'CANCELLED') {
            $reservation->update(['status' => 'CANCELLED']);
        }

        return $this->successResponse($reservation->toPlayerReservationDto(), 'Reservation cancelled');
    }
}
