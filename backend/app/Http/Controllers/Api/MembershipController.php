<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Club;
use App\Models\Membership;
use App\Models\MembershipRequest;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MembershipController extends Controller
{
    use ApiResponseTrait;

    /**
     * Memberships whose price differs from the requested target by more than
     * this ratio are considered too far and excluded from price searches.
     */
    private const PRICE_MATCH_RATIO = 0.30;

    public function show(Membership $membership): JsonResponse
    {
        return $this->successResponse($membership->load('club')->toMembershipDto());
    }

    public function searchAll(Request $request): JsonResponse
    {
        $query = Membership::with('club')->where('status', 'ACTIVE');

        if ($request->filled('title')) {
            $title = $request->input('title');
            $query->where(function ($q) use ($title) {
                $q->where('title', 'like', "%{$title}%")
                    ->orWhere('title_en', 'like', "%{$title}%");
            });
        }
        $targetPrice = $request->filled('price') ? (float) $request->input('price') : null;
        $hasPriceTarget = $targetPrice !== null && $targetPrice > 0;

        if ($hasPriceTarget) {
            $margin = $targetPrice * self::PRICE_MATCH_RATIO;

            $query
                ->whereBetween('price', [$targetPrice - $margin, $targetPrice + $margin])
                ->orderByRaw('ABS(price - ?)', [$targetPrice])
                ->orderBy('price')
                ->orderBy('id');
        }
        if ($request->filled('clubName')) {
            $name = $request->input('clubName');
            $query->whereHas('club', function ($c) use ($name) {
                $c->where('name', 'like', "%{$name}%")
                    ->orWhere('name_en', 'like', "%{$name}%");
            });
        }

        $page = (int) $request->input('page', 0);
        $size = (int) $request->input('size', 10);

        $total = $query->count();
        $memberships = $query->skip($page * $size)->take($size)->get();

        $dtos = $memberships->map(fn($m) => $m->toMembershipDto())->values()->all();

        return $this->successResponse($dtos, 'Memberships retrieved', 200, [
            'length' => count($dtos),
        ]);
    }

    public function getMyMemberships(Request $request): JsonResponse
    {
        $user = $request->user();
        $club = $user?->managedClub;

        if (! $club) {
            return $this->successResponse([], 'No club found');
        }

        $query = Membership::where('club_id', $club->id);

        if ($request->filled('title')) {
            $query->where('title', 'like', '%' . $request->input('title') . '%');
        }
        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        $page = (int) $request->input('page', 0);
        $size = (int) $request->input('size', 10);

        $memberships = $query->skip($page * $size)->take($size)->get();
        $dtos = $memberships->map(fn($m) => $m->toMembershipDto())->values()->all();

        return $this->successResponse($dtos, 'Club memberships retrieved');
    }

    public function searchPlayerClubs(Request $request): JsonResponse
    {
        $user = $request->user();

        if (! $user) {
            return $this->errorResponse('Unauthenticated', 401);
        }

        $acceptedRequests = MembershipRequest::with(['membership.club.golfCourses'])
            ->where('user_id', $user->id)
            ->where('status', 'ACCEPTED')
            ->get();

        $isEnglish = app()->getLocale() === 'en';

        $dtos = $acceptedRequests->map(function (MembershipRequest $req) use ($isEnglish) {
            $membership = $req->membership;
            $club = $membership?->club;

            if (! $membership || ! $club) {
                return null;
            }

            return [
                'clubId' => (string) $club->id,
                'clubName' => $club->localizedName(),
                'clubLogoURL' => $club->logo_url ?? '/teetime-logo.png',
                'clubCity' => $club->city ?? '',
                'clubAddress' => $club->address ?? '',
                'membershipId' => (string) $membership->id,
                'membershipTitle' => $membership->localizedTitle(),
                'membershipDescription' => $isEnglish && $membership->description_en
                    ? $membership->description_en
                    : ($membership->description ?? ''),
                'membershipStartDate' => $req->start_date?->format('Y-m-d') ?? '',
                'membershipEndDate' => $req->end_date?->format('Y-m-d') ?? '',
                'coursesCount' => $club->golfCourses->count(),
            ];
        })->filter()->values()->all();

        return $this->successResponse($dtos, 'Player clubs retrieved');
    }

    public function store(Request $request): JsonResponse
    {
        $user = $request->user();
        $club = $user?->managedClub;

        if (! $club && $user && strtoupper((string) $user->role) === 'ADMIN' && $request->filled('clubId')) {
            $club = Club::find($request->input('clubId'));
        }

        if (! $club) {
            return $this->errorResponse('No club assigned to this account', 403);
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'title_en' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'description_en' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'benefits' => 'nullable|array',
            'benefits_en' => 'nullable|array',
        ]);

        $membership = Membership::create([
            'club_id' => $club->id,
            'title' => $validated['title'],
            'title_en' => $validated['title_en'] ?? null,
            'description' => $validated['description'] ?? '',
            'description_en' => $validated['description_en'] ?? null,
            'price' => $validated['price'],
            'status' => 'ACTIVE',
            'benefits' => $validated['benefits'] ?? [],
            'benefits_en' => $validated['benefits_en'] ?? [],
        ]);

        return $this->successResponse($membership->toMembershipDto(), 'Membership plan created', 201);
    }

    public function update(Request $request): JsonResponse
    {
        $user = $request->user();
        $id = $request->input('id');
        $membership = Membership::findOrFail($id);

        if (! $user || ! $this->canManageClub($user, $membership->club_id)) {
            return $this->errorResponse('Unauthorized', 403);
        }

        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'title_en' => 'sometimes|nullable|string|max:255',
            'description' => 'nullable|string',
            'description_en' => 'sometimes|nullable|string',
            'price' => 'sometimes|required|numeric|min:0',
            'status' => 'sometimes|nullable|string',
            'benefits' => 'nullable|array',
            'benefits_en' => 'sometimes|nullable|array',
        ]);

        $membership->update($validated);

        return $this->successResponse($membership->toMembershipDto(), 'Membership plan updated');
    }

    // ─── Requests ───

    public function searchRequests(Request $request): JsonResponse
    {
        $user = $request->user();

        if (! $user) {
            return $this->errorResponse('Unauthenticated', 401);
        }

        $query = MembershipRequest::with(['user', 'membership.club'])->latest();

        if (! $this->isAdmin($user)) {
            $club = $user->managedClub;

            if (! $club) {
                return $this->successResponse([], 'No club assigned to this account');
            }

            $query->whereHas('membership', fn($m) => $m->where('club_id', $club->id));
        }

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        $page = (int) $request->input('page', 0);
        $size = (int) $request->input('size', 10);

        $requests = $query->skip($page * $size)->take($size)->get();
        $dtos = $requests->map(fn($r) => $r->toRequestDto())->values()->all();

        return $this->successResponse($dtos, 'Membership requests retrieved');
    }

    public function searchMembers(Request $request): JsonResponse
    {
        $user = $request->user();

        if (! $user) {
            return $this->errorResponse('Unauthenticated', 401);
        }

        $query = MembershipRequest::with(['user', 'membership.club'])
            ->where('status', 'ACCEPTED')
            ->latest();

        if (! $this->isAdmin($user)) {
            $club = $user->managedClub;

            if (! $club) {
                return $this->successResponse([], 'No club assigned to this account');
            }

            $query->whereHas('membership', fn($m) => $m->where('club_id', $club->id));
        }

        $page = (int) $request->input('page', 0);
        $size = (int) $request->input('size', 10);

        $requests = $query->skip($page * $size)->take($size)->get();
        $dtos = $requests->map(fn($r) => $r->toRequestDto())->values()->all();

        return $this->successResponse($dtos, 'Club members retrieved');
    }

    public function requestMembership(Request $request): JsonResponse
    {
        $user = $request->user();

        if (! $user) {
            return $this->errorResponse('Unauthenticated', 401);
        }

        $validated = $request->validate([
            'membershipId' => 'required|exists:memberships,id',
        ]);

        $membership = Membership::findOrFail($validated['membershipId']);

        $alreadyPending = MembershipRequest::where('user_id', $user->id)
            ->where('membership_id', $membership->id)
            ->where('status', 'PENDING')
            ->exists();

        if ($alreadyPending) {
            return $this->errorResponse('You already have a pending request for this membership', 422);
        }

        $req = MembershipRequest::create([
            'user_id' => $user->id,
            'membership_id' => $membership->id,
            'status' => 'PENDING',
            'payment_status' => 'PAID',
            'paid_at' => now(),
            'start_date' => now()->toDateString(),
            'end_date' => now()->addYearNoOverflow()->toDateString(),
        ]);

        return $this->successResponse($req->load('membership.club')->toRequestDto(), 'Membership request submitted and paid', 201);
    }

    public function acceptRequest(Request $request): JsonResponse
    {
        return $this->updateRequestStatus($request, 'ACCEPTED');
    }

    public function rejectRequest(Request $request): JsonResponse
    {
        return $this->updateRequestStatus($request, 'REJECTED');
    }

    private function updateRequestStatus(Request $request, string $status): JsonResponse
    {
        $user = $request->user();

        if (! $user) {
            return $this->errorResponse('Unauthenticated', 401);
        }

        $requestId = $request->input('requestId') ?? $request->query('requestId');

        if (! $requestId) {
            return $this->errorResponse('The requestId field is required', 422);
        }

        $req = MembershipRequest::with('membership.club')->find($requestId);

        if (! $req) {
            return $this->errorResponse('Membership request not found', 404);
        }

        if (! $this->canManageClub($user, $req->membership?->club_id)) {
            return $this->errorResponse('Unauthorized', 403);
        }

        $req->update(['status' => $status]);

        return $this->successResponse($req->load(['user', 'membership.club'])->toRequestDto(), "Request {$status}");
    }

    private function isAdmin($user): bool
    {
        return strtoupper((string) $user->role) === 'ADMIN';
    }

    private function canManageClub($user, ?int $clubId): bool
    {
        if ($this->isAdmin($user)) {
            return true;
        }

        $club = $user->managedClub;

        return $club !== null && $clubId !== null && (int) $club->id === (int) $clubId;
    }
}
