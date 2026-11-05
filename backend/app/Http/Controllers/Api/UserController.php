<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    use ApiResponseTrait;

    public function searchUsers(Request $request): JsonResponse
    {
        if (! $this->isAdmin($request->user())) {
            return $this->errorResponse('Unauthorized', 403);
        }

        $query = User::with('managedClub');

        if ($request->filled('firstName')) {
            $val = $request->input('firstName');
            $query->where(function ($q) use ($val) {
                $q->where('first_name', 'like', "%{$val}%")
                  ->orWhere('name', 'like', "%{$val}%");
            });
        }
        if ($request->filled('lastName')) {
            $query->where('last_name', 'like', '%' . $request->input('lastName') . '%');
        }
        if ($request->filled('email')) {
            $query->where('email', 'like', '%' . $request->input('email') . '%');
        }
        if ($request->filled('phoneNumber')) {
            $query->where('phone_number', 'like', '%' . $request->input('phoneNumber') . '%');
        }
        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }
        if ($request->filled('role')) {
            $role = str_replace('ROLE_', '', $request->input('role'));
            $query->where('role', $role);
        }
        if ($request->filled('gender')) {
            $query->where('gender', $request->input('gender'));
        }

        $page = (int) $request->input('page', 0);
        $size = (int) $request->input('size', 10);

        $total = $query->count();
        $users = $query->skip($page * $size)->take($size)->get();

        $dtos = $users->map(fn($u) => $u->toUserDto())->values()->all();

        return $this->successResponse($dtos, 'Users retrieved successfully', 200, [
            'length' => count($dtos),
        ]);
    }

    public function getManagers(Request $request): JsonResponse
    {
        if (! $this->isAdmin($request->user())) {
            return $this->errorResponse('Unauthorized', 403);
        }

        $managers = User::where('role', 'MANAGER')
            ->orWhere('role', 'ROLE_MANAGER')
            ->get();

        $dtos = $managers->map(function ($m) {
            return [
                'id' => (string) $m->id,
                'firstName' => $m->first_name ?? explode(' ', $m->name)[0],
                'lastName' => $m->last_name ?? (count(explode(' ', $m->name)) > 1 ? implode(' ', array_slice(explode(' ', $m->name), 1)) : ''),
            ];
        })->values()->all();

        return $this->successResponse($dtos, 'Managers retrieved successfully');
    }

    public function addManager(Request $request): JsonResponse
    {
        if (! $this->isAdmin($request->user())) {
            return $this->errorResponse('Unauthorized', 403);
        }

        $validated = $request->validate([
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
            'firstName' => 'nullable|string|max:100',
            'lastName' => 'nullable|string|max:100',
            'username' => 'nullable|string|max:100',
            'phoneNumber' => 'nullable|string|max:50',
            'gender' => 'nullable|string',
        ]);

        $name = trim(($validated['firstName'] ?? '') . ' ' . ($validated['lastName'] ?? ''));
        if (empty($name)) {
            $name = $validated['username'] ?? explode('@', $validated['email'])[0];
        }

        $manager = User::create([
            'name' => $name,
            'first_name' => $validated['firstName'] ?? null,
            'last_name' => $validated['lastName'] ?? null,
            'email' => $validated['email'],
            'password' => $validated['password'],
            'phone_number' => $validated['phoneNumber'] ?? null,
            'gender' => $validated['gender'] ?? null,
            'role' => 'MANAGER',
            'status' => 'ACTIVE',
        ]);

        return $this->successResponse($manager->toUserDto(), 'Manager created successfully', 201);
    }

    public function changeStatus(Request $request): JsonResponse
    {
        if (! $this->isAdmin($request->user())) {
            return $this->errorResponse('Unauthorized', 403);
        }

        $userId = $request->input('userId');
        $status = $request->input('status');

        $user = User::findOrFail($userId);
        $user->update(['status' => $status]);

        return $this->successResponse($user->toUserDto(), 'User status updated successfully');
    }

    public function updateMyData(Request $request): JsonResponse
    {
        $user = $request->user();

        if (! $user) {
            return $this->errorResponse('Unauthenticated', 401);
        }

        // The official tournament credentials (FRMG licence, handicap) are deliberately
        // absent: they are declared once at sign-up and never editable from the profile.
        $validated = $request->validate([
            'firstName' => 'required|string|max:100',
            'lastName' => 'required|string|max:100',
            'gender' => 'required|string|in:MALE,FEMALE',
            'countryCallingCode' => 'required|string|max:8',
            'phoneNumber' => 'required|string|min:4|max:50',
            'bio' => 'nullable|string',
            'birthDate' => 'nullable|date',
        ]);

        $user->update([
            'name' => trim($validated['firstName'] . ' ' . $validated['lastName']),
            'first_name' => $validated['firstName'],
            'last_name' => $validated['lastName'],
            'country_calling_code' => $validated['countryCallingCode'],
            'phone_number' => $validated['phoneNumber'],
            'gender' => $validated['gender'],
            'bio' => $validated['bio'] ?? null,
            'birth_date' => $validated['birthDate'] ?? null,
        ]);

        return $this->successResponse($user->toUserDto(), 'Profile updated successfully');
    }

    public function updateMyPassword(Request $request): JsonResponse
    {
        $user = $request->user();

        if (! $user) {
            return $this->errorResponse('Unauthenticated', 401);
        }

        $request->validate([
            'password' => 'required|string',
            'newPassword' => 'required|string|min:6',
        ]);

        if (! Hash::check($request->input('password'), $user->password)) {
            return $this->errorResponse('Current password does not match', 400);
        }

        $user->update([
            'password' => $request->input('newPassword'),
        ]);

        return $this->successResponse(null, 'Password updated successfully');
    }

    public function updateMyProfilePicture(Request $request): JsonResponse
    {
        $user = $request->user();

        if (! $user) {
            return $this->errorResponse('Unauthenticated', 401);
        }

        if ($request->hasFile('profilePic')) {
            $path = $request->file('profilePic')->store('avatars', 'public');
            $user->update(['avatar_url' => '/storage/' . $path]);
        }

        return $this->successResponse($user->toUserDto(), 'Profile picture updated successfully');
    }

    private function isAdmin(?User $user): bool
    {
        return $user !== null && strtoupper((string) $user->role) === 'ADMIN';
    }
}
