<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Club;
use App\Models\MembershipRequest;
use App\Models\ProductOrder;
use App\Models\Reservation;
use App\Models\TimeSlot;
use App\Models\Tournament;
use App\Models\User;
use App\Traits\ApiResponseTrait;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    use ApiResponseTrait;

    private const ACTIVE_RESERVATION_STATUSES = ['PENDING', 'CONFIRMED', 'ACCEPTED'];

    public function adminDashboard(Request $request): JsonResponse
    {
        $user = $request->user();

        if (! $user || ! $this->hasRole($user, 'ADMIN')) {
            return $this->errorResponse('Forbidden', 403);
        }

        $totalUsers = User::count();
        $totalPlayers = User::where('role', 'PLAYER')->count();
        $totalManagers = User::where('role', 'MANAGER')->count();
        $totalClubs = Club::count();
        $activeClubs = Club::where('status', 'ACTIVE')->count();
        $reservationsLast30Days = Reservation::where('created_at', '>=', now()->subDays(30))->count();
        $reservationsPrevious30Days = Reservation::whereBetween('created_at', [now()->subDays(60), now()->subDays(30)])->count();
        $pendingReservations = Reservation::where('status', 'PENDING')->count();
        $pendingRequests = MembershipRequest::where('status', 'PENDING')->count();
        $activeTournaments = Tournament::whereIn('status', [
            Tournament::STATUS_INSCRIPTIONS_OUVERTES,
            Tournament::STATUS_INSCRIPTIONS_FERMEES,
            Tournament::STATUS_AVANT_TOURNOI,
            Tournament::STATUS_EN_DIRECT,
        ])->count();

        [$revenueLast30Days, $revenuePrevious30Days] = $this->revenueWindows();

        // Cumulative user growth for the last 6 months, based on real sign-ups.
        $usersGrowth = [];
        for ($i = 5; $i >= 0; $i--) {
            $endOfMonth = now()->subMonths($i)->endOfMonth();
            $usersGrowth[] = [
                'month' => $endOfMonth->format('Y-m'),
                'players' => User::where('role', 'PLAYER')->where('created_at', '<=', $endOfMonth)->count(),
                'managers' => User::where('role', 'MANAGER')->where('created_at', '<=', $endOfMonth)->count(),
                'influencers' => User::where('role', 'INFLUENCER')->where('created_at', '<=', $endOfMonth)->count(),
            ];
        }

        // Real reservation volume per day for the last 7 days.
        $reservationsTrend = [];
        for ($i = 6; $i >= 0; $i--) {
            $day = now()->subDays($i);
            $reservationsTrend[] = [
                'date' => $day->format('Y-m-d'),
                'count' => Reservation::whereDate('reservation_date', $day->toDateString())->count(),
            ];
        }

        $topClubs = Club::all()
            ->map(fn (Club $club) => [
                'name' => $club->localizedName(),
                'count' => Reservation::whereHas('golfCourse', fn ($q) => $q->where('club_id', $club->id))->count(),
            ])
            ->sortByDesc('count')
            ->take(5)
            ->values()
            ->all();

        $recentReservations = Reservation::with(['user', 'golfCourse.club', 'timeSlot'])
            ->latest()
            ->take(8)
            ->get()
            ->map(fn (Reservation $reservation) => $this->reservationSummary($reservation))
            ->values()
            ->all();

        $pendingReservationRequests = Reservation::with(['user', 'golfCourse.club', 'timeSlot'])
            ->where('status', 'PENDING')
            ->latest()
            ->take(20)
            ->get()
            ->map(fn (Reservation $reservation) => $this->reservationSummary($reservation))
            ->values()
            ->all();

        $data = [
            'kpis' => [
                'totalUsers' => $totalUsers,
                'totalPlayers' => $totalPlayers,
                'totalManagers' => $totalManagers,
                'totalInfluencers' => User::where('role', 'INFLUENCER')->count(),
                'totalClubs' => $totalClubs,
                'activeClubs' => $activeClubs,
                'reservationsLast30Days' => $reservationsLast30Days,
                'reservationsTrendPct' => $this->trendPct($reservationsLast30Days, $reservationsPrevious30Days),
                'pendingReservations' => $pendingReservations,
                'pendingMembershipRequests' => $pendingRequests,
                'activeTournaments' => $activeTournaments,
                'revenueLast30Days' => round($revenueLast30Days, 2),
                'revenueTrendPct' => $this->trendPct($revenueLast30Days, $revenuePrevious30Days),
                'newUsersThisMonth' => User::where('created_at', '>=', now()->startOfMonth())->count(),
            ],
            'usersGrowth' => $usersGrowth,
            'reservationsTrend' => $reservationsTrend,
            'activityHeatmap' => $reservationsTrend,
            'topClubs' => $topClubs,
            'recentReservations' => $recentReservations,
            'pendingReservationRequests' => $pendingReservationRequests,
        ];

        return $this->successResponse($data);
    }

    private function reservationSummary(Reservation $reservation): array
    {
        $user = $reservation->user;
        $course = $reservation->golfCourse;
        $slot = $reservation->timeSlot;

        return [
            'id' => (string) $reservation->id,
            'playerName' => $user
                ? ($user->first_name ? "{$user->first_name} {$user->last_name}" : $user->name)
                : 'Joueur',
            'clubName' => $course?->club?->name ?? '',
            'courseName' => $course?->name ?? '',
            'reservationDate' => $reservation->reservation_date?->format('Y-m-d')
                ?? $slot?->start_time?->format('Y-m-d')
                ?? '',
            'time' => $slot ? $slot->start_time->format('H:i') : '',
            'numberOfPlayers' => (int) $reservation->number_of_players,
            'status' => $reservation->status,
        ];
    }

    public function managerDashboard(Request $request): JsonResponse
    {
        $user = $request->user();

        if (! $user || ! ($this->hasRole($user, 'MANAGER') || $this->hasRole($user, 'ADMIN'))) {
            return $this->errorResponse('Forbidden', 403);
        }

        $club = $user->managedClub;
        $courseIds = $club ? $club->golfCourses()->pluck('id') : collect();

        if (! $club || $courseIds->isEmpty()) {
            return $this->successResponse([
                'kpis' => [
                    'todayReservations' => 0,
                    'pendingRequests' => 0,
                    'members' => 0,
                    'todayRevenue' => 0,
                ],
                'utilization' => [],
                'reservationsByStatus' => [],
                'revenue' => [],
            ]);
        }

        $todaySlots = TimeSlot::whereIn('golf_course_id', $courseIds)
            ->whereDate('start_time', today())
            ->pluck('id');

        $todayReservations = Reservation::whereIn('golf_course_id', $courseIds)
            ->whereDate('reservation_date', today())
            ->count();

        $pendingRequests = MembershipRequest::whereHas('membership', fn ($m) => $m->where('club_id', $club->id))
            ->where('status', 'PENDING')
            ->count();

        $members = MembershipRequest::whereHas('membership', fn ($m) => $m->where('club_id', $club->id))
            ->where('status', 'ACCEPTED')
            ->count();

        $todayRevenue = $this->revenueForSlots($todaySlots->all());

        $utilization = [];
        $revenue = [];
        for ($i = 6; $i >= 0; $i--) {
            $day = now()->subDays($i);
            $slotIds = TimeSlot::whereIn('golf_course_id', $courseIds)
                ->whereDate('start_time', $day->toDateString())
                ->pluck('id')
                ->all();

            $capacity = TimeSlot::whereIn('id', $slotIds)->sum('max_players');
            $booked = Reservation::whereIn('time_slot_id', $slotIds)
                ->whereIn('status', self::ACTIVE_RESERVATION_STATUSES)
                ->sum('number_of_players');

            $utilization[] = [
                'date' => $day->format('Y-m-d'),
                'rate' => $capacity > 0 ? (int) round(($booked / $capacity) * 100) : 0,
            ];
            $revenue[] = [
                'date' => $day->format('Y-m-d'),
                'revenue' => $this->revenueForSlots($slotIds),
            ];
        }

        $statusCounts = Reservation::whereIn('golf_course_id', $courseIds)
            ->selectRaw('status, COUNT(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status');

        $reservationsByStatus = collect(['ACCEPTED', 'PENDING', 'REJECTED'])
            ->map(fn (string $status) => [
                'status' => $status,
                'count' => (int) ($statusCounts[$status] ?? 0),
            ])
            ->values()
            ->all();

        return $this->successResponse([
            'kpis' => [
                'todayReservations' => $todayReservations,
                'pendingRequests' => $pendingRequests,
                'members' => $members,
                'todayRevenue' => round($todayRevenue, 2),
            ],
            'utilization' => $utilization,
            'reservationsByStatus' => $reservationsByStatus,
            'revenue' => $revenue,
        ]);
    }

    public function playerDashboard(Request $request): JsonResponse
    {
        $user = $request->user();

        if (! $user) {
            return $this->errorResponse('Unauthenticated', 401);
        }

        if (! $this->hasRole($user, 'PLAYER')) {
            return $this->errorResponse('Forbidden', 403);
        }

        $reservations = Reservation::with(['golfCourse.club', 'timeSlot'])
            ->where('user_id', $user->id)
            ->get();

        $now = now()->startOfDay();
        $upcoming = $reservations
            ->filter(function (Reservation $reservation) use ($now) {
                $dateTime = $this->reservationDateTime($reservation);

                return $dateTime
                    && in_array($reservation->status, self::ACTIVE_RESERVATION_STATUSES, true)
                    && $dateTime->greaterThanOrEqualTo($now);
            })
            ->sortBy(fn (Reservation $reservation) => $this->reservationDateTime($reservation)?->getTimestamp() ?? PHP_INT_MAX)
            ->values();

        $next = $upcoming->first();

        $ordered = $reservations->sortByDesc(function (Reservation $reservation) {
            return $this->reservationDateTime($reservation)?->getTimestamp()
                ?? $reservation->created_at?->getTimestamp()
                ?? 0;
        })->values();

        $nextReservationData = null;
        if ($next) {
            $course = $next->golfCourse;
            $club = $course?->club;
            $slot = $next->timeSlot;

            $nextReservationData = [
                'reservationId' => (string) $next->id,
                'clubName' => $club ? $club->localizedName() : '',
                'clubLogoURL' => $club?->logo_url ?? '/teetime-logo.png',
                'courseName' => $course?->name ?? '',
                'courseImage' => $course?->image,
                'holeCount' => (int) ($course?->number_of_holes ?? 0),
                'date' => $this->reservationDateTime($next)?->format('Y-m-d') ?? '',
                'time' => $slot ? $slot->start_time->format('H:i') : '',
                'players' => (int) $next->number_of_players,
                'status' => $next->status,
            ];
        }

        $recent = $ordered->take(5)->map(function (Reservation $reservation) {
            return [
                'id' => (string) $reservation->id,
                'clubName' => $reservation->golfCourse?->club?->localizedName() ?? '',
                'date' => $this->reservationDateTime($reservation)?->format('Y-m-d') ?? '',
                'time' => $reservation->timeSlot ? $reservation->timeSlot->start_time->format('H:i') : '',
                'status' => $reservation->status,
            ];
        })->values()->all();

        $myClubs = MembershipRequest::with(['membership.club.golfCourses'])
            ->where('user_id', $user->id)
            ->where('status', 'ACCEPTED')
            ->get()
            ->map(function (MembershipRequest $request) {
                $membership = $request->membership;
                $club = $membership?->club;

                if (! $membership || ! $club) {
                    return null;
                }

                return [
                    'clubId' => (string) $club->id,
                    'clubName' => $club->localizedName(),
                    'clubCity' => $club->city ?? '',
                    'clubLogoURL' => $club->logo_url ?? '/teetime-logo.png',
                    'membershipTitle' => $membership->localizedTitle(),
                ];
            })
            ->filter()
            ->unique('clubId')
            ->values()
            ->all();

        $data = [
            'kpis' => [
                'nextTeeTime' => $nextReservationData['time'] ?? null,
                'totalReservations' => $reservations->count(),
                'clubsCount' => count($myClubs),
                'upcomingCount' => $upcoming->count(),
            ],
            'nextReservation' => $nextReservationData,
            'recentReservations' => $recent,
            'myClubs' => $myClubs,
        ];

        return $this->successResponse($data);
    }

    /**
     * Combine the reservation date with the slot start time so "next" and
     * "recent" ordering follow the actual tee time instead of the record id.
     */
    private function reservationDateTime(Reservation $reservation): ?Carbon
    {
        $date = $reservation->reservation_date?->copy();
        $slotStart = $reservation->timeSlot?->start_time?->copy();

        if ($date && $slotStart) {
            return $date->setTime($slotStart->hour, $slotStart->minute, 0);
        }

        return $date ?? $slotStart;
    }

    /**
     * @param  array<int, int|string>  $slotIds
     */
    private function revenueForSlots(array $slotIds): float
    {
        if ($slotIds === []) {
            return 0.0;
        }

        return (float) Reservation::with(['golfCourse', 'timeSlot'])
            ->whereIn('time_slot_id', $slotIds)
            ->whereIn('status', ['ACCEPTED', 'CONFIRMED'])
            ->get()
            ->sum(fn (Reservation $reservation) => (float) ($reservation->golfCourse?->priceForDate(
                $reservation->reservation_date ?? $reservation->timeSlot?->start_time
            ) ?? 0) * (int) $reservation->number_of_players);
    }

    /**
     * Paid shop orders + paid membership subscriptions for the last 30 days
     * and the 30 days before that.
     *
     * @return array{0: float, 1: float}
     */
    private function revenueWindows(): array
    {
        $currentStart = now()->subDays(30);
        $previousStart = now()->subDays(60);

        $ordersCurrent = (float) ProductOrder::where('payment_status', 'PAID')
            ->where('paid_at', '>=', $currentStart)
            ->sum('total_price');
        $ordersPrevious = (float) ProductOrder::where('payment_status', 'PAID')
            ->whereBetween('paid_at', [$previousStart, $currentStart])
            ->sum('total_price');

        $membersCurrent = (float) MembershipRequest::where('payment_status', 'PAID')
            ->where('paid_at', '>=', $currentStart)
            ->with('membership')
            ->get()
            ->sum(fn (MembershipRequest $request) => (float) ($request->membership?->price ?? 0));
        $membersPrevious = (float) MembershipRequest::where('payment_status', 'PAID')
            ->whereBetween('paid_at', [$previousStart, $currentStart])
            ->with('membership')
            ->get()
            ->sum(fn (MembershipRequest $request) => (float) ($request->membership?->price ?? 0));

        return [
            $ordersCurrent + $membersCurrent,
            $ordersPrevious + $membersPrevious,
        ];
    }

    private function trendPct(float|int $current, float|int $previous): int
    {
        if ($previous <= 0) {
            return $current > 0 ? 100 : 0;
        }

        return (int) round((($current - $previous) / $previous) * 100);
    }

    private function hasRole(User $user, string $role): bool
    {
        return strtoupper((string) $user->role) === $role;
    }
}
