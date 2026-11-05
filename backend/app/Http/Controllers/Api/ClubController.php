<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Club;
use App\Models\User;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ClubController extends Controller
{
    use ApiResponseTrait;

    public function index(Request $request): JsonResponse
    {
        $clubs = Club::with(['golfCourses', 'owner'])->latest()->get();

        // If called by REST client expecting plain array (e.g. SearchPage.tsx)
        return response()->json($clubs);
    }

    public function searchClubs(Request $request): JsonResponse
    {
        $query = Club::with(['golfCourses', 'owner']);

        if ($request->filled('name')) {
            $query->where('name', 'like', '%' . $request->input('name') . '%');
        }
        if ($request->filled('city')) {
            $query->where('city', 'like', '%' . $request->input('city') . '%');
        }
        if ($request->filled('phone')) {
            $query->where('phone', 'like', '%' . $request->input('phone') . '%');
        }
        if ($request->filled('email')) {
            $query->where('email', 'like', '%' . $request->input('email') . '%');
        }
        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }
        if ($request->filled('ownerFirstName') || $request->filled('ownerLastName')) {
            $query->whereHas('owner', function ($q) use ($request) {
                if ($request->filled('ownerFirstName')) {
                    $q->where('first_name', 'like', '%' . $request->input('ownerFirstName') . '%')
                      ->orWhere('name', 'like', '%' . $request->input('ownerFirstName') . '%');
                }
                if ($request->filled('ownerLastName')) {
                    $q->where('last_name', 'like', '%' . $request->input('ownerLastName') . '%');
                }
            });
        }

        $page = (int) $request->input('page', 0);
        $size = (int) $request->input('size', 10);

        $total = $query->count();
        $clubs = $query->skip($page * $size)->take($size)->get();

        $dtos = $clubs->map(fn($c) => $c->toClubDto())->values()->all();

        return $this->successResponse($dtos, 'Clubs retrieved successfully', 200, [
            'length' => count($dtos),
        ]);
    }

    public function getMyClub(Request $request): JsonResponse
    {
        $user = $request->user();

        if (! $user) {
            return $this->errorResponse('Unauthenticated', 401);
        }

        $club = Club::with(['golfCourses', 'owner'])
            ->where('owner_id', $user->id)
            ->first();

        if (! $club) {
            return $this->errorResponse('No club found', 404);
        }

        return $this->successResponse($club->toClubDto());
    }

    public function store(Request $request): JsonResponse
    {
        if (! $this->isAdmin($request->user())) {
            return $this->errorResponse('Unauthorized', 403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'city' => 'required|string|max:255',
            'address' => 'required|string|max:255',
            'description' => 'nullable|string',
            'phone' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:255',
            'logo_url' => 'nullable|string|max:2048',
            'cover_url' => 'nullable|string|max:2048',
            'owner_id' => 'nullable|exists:users,id',
            'ownerId' => 'nullable|exists:users,id',
            'status' => ['sometimes', Rule::in(['ACTIVE', 'SUSPENDED', 'ARCHIVED'])],
        ]);

        if (isset($validated['ownerId']) && ! isset($validated['owner_id'])) {
            $validated['owner_id'] = $validated['ownerId'];
        }

        $club = Club::create($validated);

        return $this->successResponse($club->toClubDto(), 'Club created successfully', 201);
    }

    public function show(string $id): JsonResponse
    {
        $club = Club::with(['golfCourses', 'owner'])->findOrFail($id);

        return $this->successResponse($club->toClubDto());
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $club = Club::findOrFail($id);

        if (! $this->canManageClub($request->user(), $club)) {
            return $this->errorResponse('Unauthorized', 403);
        }

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'city' => 'sometimes|required|string|max:255',
            'address' => 'sometimes|required|string|max:255',
            'description' => 'sometimes|nullable|string',
            'phone' => 'sometimes|nullable|string|max:50',
            'email' => 'sometimes|nullable|email|max:255',
            'logo_url' => 'sometimes|nullable|string|max:2048',
            'cover_url' => 'sometimes|nullable|string|max:2048',
            'owner_id' => 'sometimes|nullable|exists:users,id',
            'ownerId' => 'sometimes|nullable|exists:users,id',
            'status' => ['sometimes', Rule::in(['ACTIVE', 'SUSPENDED', 'ARCHIVED'])],
        ]);

        if (isset($validated['ownerId']) && ! isset($validated['owner_id'])) {
            $validated['owner_id'] = $validated['ownerId'];
        }

        $club->update($validated);

        return $this->successResponse($club->load('golfCourses')->toClubDto(), 'Club updated successfully');
    }

    public function updateFromFormData(Request $request): JsonResponse
    {
        $id = $request->input('id');
        $club = $id ? Club::find($id) : $request->user()?->managedClub;

        if (! $club) {
            return $this->errorResponse('Club not found', 404);
        }

        if (! $this->canManageClub($request->user(), $club)) {
            return $this->errorResponse('Unauthorized', 403);
        }

        $data = [];
        if ($request->filled('name')) $data['name'] = $request->input('name');
        if ($request->filled('city')) $data['city'] = $request->input('city');
        if ($request->filled('address')) $data['address'] = $request->input('address');
        if ($request->filled('phone')) $data['phone'] = $request->input('phone');
        if ($request->filled('email')) $data['email'] = $request->input('email');
        if ($request->filled('description')) $data['description'] = $request->input('description');

        if ($request->hasFile('logoURL')) {
            $path = $request->file('logoURL')->store('clubs/logos', 'public');
            $data['logo_url'] = '/storage/' . $path;
        }
        if ($request->hasFile('coverURL')) {
            $path = $request->file('coverURL')->store('clubs/covers', 'public');
            $data['cover_url'] = '/storage/' . $path;
        }

        $club->update($data);

        return $this->successResponse($club->toClubDto(), 'Club updated successfully');
    }

    public function changeStatus(Request $request): JsonResponse
    {
        if (! $this->isAdmin($request->user())) {
            return $this->errorResponse('Unauthorized', 403);
        }

        $clubId = $request->input('clubId');
        $status = $request->input('status');

        $club = Club::findOrFail($clubId);
        $club->update(['status' => $status]);

        return $this->successResponse($club->toClubDto(), 'Status changed successfully');
    }

    public function reassign(Request $request): JsonResponse
    {
        if (! $this->isAdmin($request->user())) {
            return $this->errorResponse('Unauthorized', 403);
        }

        $clubId = $request->input('clubId');
        $managerId = $request->input('managerId');

        $club = Club::findOrFail($clubId);
        $club->update(['owner_id' => $managerId]);

        return $this->successResponse($club->load('owner')->toClubDto(), 'Manager reassigned successfully');
    }

    public function destroy(Request $request, string $id): JsonResponse
    {
        if (! $this->isAdmin($request->user())) {
            return $this->errorResponse('Unauthorized', 403);
        }

        $club = Club::findOrFail($id);
        $club->delete();

        return $this->successResponse(null, 'Club deleted successfully');
    }

    private function isAdmin(?User $user): bool
    {
        return $user !== null && strtoupper((string) $user->role) === 'ADMIN';
    }

    private function canManageClub(?User $user, Club $club): bool
    {
        if (! $user) {
            return false;
        }

        return $this->isAdmin($user) || (int) $club->owner_id === (int) $user->id;
    }
}
