<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Tournament;
use App\Models\User;
use App\Traits\ApiResponseTrait;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TournamentController extends Controller
{
    use ApiResponseTrait;

    public function search(Request $request): JsonResponse
    {
        if (! $this->isApexAdmin($request->user())) {
            return $this->errorResponse('Only an APEX administrator can list every tournament', 403);
        }

        return $this->successResponse(
            $this->paginate($request, $this->filteredQuery($request)),
            'Tournaments retrieved'
        );
    }

    public function publicSearch(Request $request): JsonResponse
    {
        $builder = $this->filteredQuery($request)->whereNotIn('status', Tournament::PRIVATE_STATUSES);

        return $this->successResponse(
            $this->paginate($request, $builder),
            'Tournaments retrieved'
        );
    }

    public function store(Request $request): JsonResponse
    {
        if (! $this->isApexAdmin($request->user())) {
            return $this->errorResponse('Only an APEX administrator can create a tournament', 403);
        }

        $validated = $request->validate($this->creationRules());

        $date = $this->parseDate($validated['date']);

        if ($date === null) {
            return $this->invalidDateResponse();
        }

        $imageUrl = $validated['imageUrl'] ?? null;
        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('tournaments', 'public');
            $imageUrl = '/storage/' . $path;
        }

        $tournament = Tournament::create([
            'club_id' => $request->user()->managedClub?->id,
            'name' => $validated['name'],
            'description' => $validated['description'] ?? '',
            'date' => $date,
            'location' => $validated['location'],
            // A brand new tournament is always a draft; registrations never open on their own.
            'status' => Tournament::STATUS_BROUILLON,
            'image_url' => $imageUrl ?? '/section3.png',
            'entry_fee' => $validated['entryFee'],
            'max_participants' => $validated['maxParticipants'],
            'current_participants' => 0,
        ]);

        return $this->successResponse($tournament->toTournamentDto(), 'Tournament created', 201);
    }

    public function update(Request $request): JsonResponse
    {
        $tournament = Tournament::findOrFail($request->input('id'));

        if (! $this->isApexAdmin($request->user())) {
            return $this->errorResponse('Only an APEX administrator can modify a tournament', 403);
        }

        $validated = $request->validate($this->updateRules());

        if (isset($validated['date'])) {
            $date = $this->parseDate($validated['date']);

            if ($date === null) {
                return $this->invalidDateResponse();
            }

            $validated['date'] = $date;
        }

        if (array_key_exists('status', $validated)) {
            $status = $validated['status'];

            if ($status !== $tournament->status && ! Tournament::canTransition($tournament->status, $status)) {
                return $this->errorResponse(
                    "Impossible passage de « {$tournament->status} » à « {$status} » dans le cycle de vie du tournoi",
                    422,
                    ['status' => ['This status change is not allowed by the tournament lifecycle.']]
                );
            }
        }

        if (isset($validated['entryFee'])) {
            $validated['entry_fee'] = $validated['entryFee'];
        }
        if (isset($validated['maxParticipants'])) {
            $validated['max_participants'] = $validated['maxParticipants'];
        }
        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('tournaments', 'public');
            $validated['image_url'] = '/storage/' . $path;
        }
        unset($validated['image'], $validated['entryFee'], $validated['maxParticipants']);

        $tournament->update($validated);

        return $this->successResponse($tournament->toTournamentDto(), 'Tournament updated');
    }

    public function destroy(Request $request, string $id): JsonResponse
    {
        $tournament = Tournament::findOrFail($id);

        if (! $this->isApexAdmin($request->user())) {
            return $this->errorResponse('Only an APEX administrator can delete a tournament', 403);
        }

        $tournament->delete();

        return $this->successResponse(null, 'Tournament deleted');
    }

    private function filteredQuery(Request $request): Builder
    {
        $builder = Tournament::with('club')->latest('date');

        if ($request->filled('q')) {
            $q = $request->input('q');
            $builder->where(function ($query) use ($q) {
                $query->where('name', 'like', "%{$q}%")
                    ->orWhere('description', 'like', "%{$q}%");
            });
        }

        // Every criterion narrows the result set; none of them may widen it again.
        if ($request->filled('status')) {
            $builder->where('status', $request->input('status'));
        }
        if ($request->filled('location')) {
            $builder->where('location', 'like', '%' . $request->input('location') . '%');
        }
        if ($request->filled('date')) {
            $builder->whereDate('date', $request->input('date'));
        }

        return $builder;
    }

    private function paginate(Request $request, Builder $builder): array
    {
        $page = (int) $request->input('page', 0);
        $size = (int) $request->input('size', 10);

        return $builder->skip($page * $size)->take($size)->get()
            ->map(fn (Tournament $tournament) => $tournament->toTournamentDto())
            ->values()
            ->all();
    }

    private function creationRules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'date' => 'required',
            'location' => 'required|string|max:255',
            'imageUrl' => 'nullable|string',
            'image' => 'nullable|image|max:5120',
            'entryFee' => 'required|numeric|min:0',
            'maxParticipants' => 'required|integer|min:1',
        ];
    }

    private function updateRules(): array
    {
        return [
            'name' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'date' => 'sometimes|required',
            'location' => 'sometimes|required|string|max:255',
            'status' => 'sometimes|required|in:' . implode(',', Tournament::statuses()),
            'image' => 'sometimes|image|max:5120',
            'entryFee' => 'sometimes|required|numeric|min:0',
            'maxParticipants' => 'sometimes|required|integer|min:1',
        ];
    }

    private function parseDate(string $value): ?Carbon
    {
        try {
            return Carbon::parse($value);
        } catch (\Throwable) {
            return null;
        }
    }

    private function invalidDateResponse(): JsonResponse
    {
        return $this->errorResponse('invalid_date', 422, [
            'date' => ['La date du tournoi est invalide.'],
        ]);
    }

    private function isApexAdmin(?User $user): bool
    {
        return $user !== null && $user->isApexAdmin();
    }
}
