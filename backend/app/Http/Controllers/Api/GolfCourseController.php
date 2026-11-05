<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Club;
use App\Models\GolfCourse;
use App\Models\User;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GolfCourseController extends Controller
{
    use ApiResponseTrait;

    public function index(): JsonResponse
    {
        return response()->json(
            GolfCourse::with('club')->where('is_active', true)->get()
        );
    }

    public function store(Request $request): JsonResponse
    {
        $user = $request->user();

        if (! $this->isAdmin($user) && ! $user?->managedClub) {
            return $this->errorResponse('Unauthorized', 403);
        }

        $validated = $request->validate([
            'club_id' => 'nullable|exists:clubs,id',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'location' => 'nullable|string|max:255',
            'price_per_player' => 'nullable|numeric|min:0',
            'greenFee' => 'nullable|numeric|min:0',
            'extra_fees' => 'sometimes|nullable|array',
            'extra_fees.*.label' => 'required|string|max:255',
            'extra_fees.*.labelEn' => 'nullable|string|max:255',
            'extra_fees.*.price' => 'nullable|numeric|min:0',
            'extra_fees.*.priceMax' => 'nullable|numeric|min:0',
            'number_of_holes' => 'nullable|integer|min:1|max:36',
            'holeCount' => 'nullable|integer|min:1|max:36',
            'image' => 'nullable|string|max:255',
            'is_active' => 'sometimes|boolean',
        ]);

        if (empty($validated['club_id'])) {
            $validated['club_id'] = $user?->managedClub?->id;

            if (empty($validated['club_id'])) {
                return $this->errorResponse('A club is required to create a course', 422);
            }
        } elseif (! $this->canManageCourseClub($user, (int) $validated['club_id'])) {
            return $this->errorResponse('Unauthorized', 403);
        }

        if (isset($validated['greenFee']) && ! isset($validated['price_per_player'])) {
            $validated['price_per_player'] = $validated['greenFee'];
        }
        if (isset($validated['holeCount']) && ! isset($validated['number_of_holes'])) {
            $validated['number_of_holes'] = $validated['holeCount'];
        }
        if (empty($validated['location'])) {
            $validated['location'] = Club::find($validated['club_id'])?->city ?? 'Morocco';
        }

        if ($request->hasFile('imagesUrls')) {
            $file = is_array($request->file('imagesUrls')) ? $request->file('imagesUrls')[0] : $request->file('imagesUrls');
            $path = $file->store('courses', 'public');
            $validated['image'] = '/storage/' . $path;
        }

        $golfCourse = GolfCourse::create($validated);

        return $this->successResponse($golfCourse->toCourseDto(), 'Course created successfully', 201);
    }

    public function show(string $id): JsonResponse
    {
        $golfCourse = GolfCourse::with('club')->findOrFail($id);

        return $this->successResponse($golfCourse->toCourseDto());
    }

    public function update(Request $request, ?string $id = null): JsonResponse
    {
        $targetId = $id ?? $request->input('id');
        $golfCourse = GolfCourse::findOrFail($targetId);

        if (! $this->canManageCourseClub($request->user(), $golfCourse->club_id)) {
            return $this->errorResponse('Unauthorized', 403);
        }

        $validated = $request->validate([
            'club_id' => 'sometimes|nullable|exists:clubs,id',
            'name' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'location' => 'sometimes|nullable|string|max:255',
            'price_per_player' => 'sometimes|nullable|numeric|min:0',
            'greenFee' => 'sometimes|nullable|numeric|min:0',
            'extra_fees' => 'sometimes|nullable|array',
            'extra_fees.*.label' => 'required|string|max:255',
            'extra_fees.*.labelEn' => 'nullable|string|max:255',
            'extra_fees.*.price' => 'nullable|numeric|min:0',
            'extra_fees.*.priceMax' => 'nullable|numeric|min:0',
            'number_of_holes' => 'sometimes|nullable|integer|min:1|max:36',
            'holeCount' => 'sometimes|nullable|integer|min:1|max:36',
            'image' => 'nullable|string|max:255',
            'status' => 'sometimes|nullable|string|in:ACTIVE,SUSPENDED,ARCHIVED',
            'is_active' => 'sometimes|boolean',
        ]);

        if (isset($validated['greenFee'])) {
            $validated['price_per_player'] = $validated['greenFee'];
        }
        if (isset($validated['holeCount'])) {
            $validated['number_of_holes'] = $validated['holeCount'];
        }

        if ($request->hasFile('imagesUrls')) {
            $file = is_array($request->file('imagesUrls')) ? $request->file('imagesUrls')[0] : $request->file('imagesUrls');
            $path = $file->store('courses', 'public');
            $validated['image'] = '/storage/' . $path;
        }

        if (isset($validated['status'])) {
            $validated['is_active'] = $validated['status'] === 'ACTIVE';
            unset($validated['status']);
        }

        $golfCourse->update($validated);

        return $this->successResponse($golfCourse->toCourseDto(), 'Course updated successfully');
    }

    public function destroy(Request $request, string $id): JsonResponse
    {
        $golfCourse = GolfCourse::findOrFail($id);

        if (! $this->canManageCourseClub($request->user(), $golfCourse->club_id)) {
            return $this->errorResponse('Unauthorized', 403);
        }

        $golfCourse->delete();

        return $this->successResponse(null, 'Golf course deleted successfully');
    }

    private function isAdmin(?User $user): bool
    {
        return $user !== null && strtoupper((string) $user->role) === 'ADMIN';
    }

    private function canManageCourseClub(?User $user, ?int $clubId): bool
    {
        if (! $user) {
            return false;
        }

        if ($this->isAdmin($user)) {
            return true;
        }

        $club = $user->managedClub;

        return $club !== null && $clubId !== null && (int) $club->id === (int) $clubId;
    }
}