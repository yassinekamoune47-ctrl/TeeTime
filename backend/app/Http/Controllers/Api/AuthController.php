<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Laravel\Sanctum\PersonalAccessToken;

class AuthController extends Controller
{
    use ApiResponseTrait;

    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        // Registered e-mail addresses only: a username never authenticates anyone.
        $user = User::where('email', $request->input('email'))->first();

        $passwordMatches = false;
        if ($user) {
            try {
                $passwordMatches = Hash::check($request->input('password'), $user->password);
            } catch (\RuntimeException) {
                // Stored value is not a password hash (legacy/plaintext row): reject instead of 500.
                $passwordMatches = false;
            }
        }

        if (! $user || ! $passwordMatches) {
            return $this->errorResponse('Invalid credentials', 401);
        }

        if ($user->status === 'SUSPENDED') {
            return $this->errorResponse('Your account has been suspended. Please contact support.', 403);
        }

        // Issue Sanctum token and web session login for cookie support
        Auth::login($user);
        if ($request->hasSession()) {
            $request->session()->regenerate();
        }
        $token = $user->createToken('auth-token')->plainTextToken;

        return $this->successResponse($user->toUserDto(), 'Login successful', 200, [
            'token' => $token,
        ]);
    }

    public function signup(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'firstName' => 'required|string|max:100',
            'lastName' => 'required|string|max:100',
            'email' => 'required|email|max:255|unique:users,email',
            'password' => 'required|string|min:6',
            'gender' => 'required|string|in:MALE,FEMALE',
            'countryCallingCode' => 'required|string|max:8',
            'phoneNumber' => 'required|string|min:4|max:50',
            'frmglLicenseNumber' => 'nullable|required_without:currentHandicap|string|max:50',
            'currentHandicap' => 'nullable|required_without:frmglLicenseNumber|numeric|between:0,18',
        ]);

        $user = User::create([
            'name' => trim($validated['firstName'] . ' ' . $validated['lastName']),
            'first_name' => $validated['firstName'],
            'last_name' => $validated['lastName'],
            'email' => $validated['email'],
            'password' => $validated['password'],
            'country_calling_code' => $validated['countryCallingCode'],
            'phone_number' => $validated['phoneNumber'],
            'frmgl_license_number' => $validated['frmglLicenseNumber'] ?? null,
            'current_handicap' => $validated['currentHandicap'] ?? null,
            'gender' => $validated['gender'],
            'role' => 'PLAYER',
            'status' => 'ACTIVE',
        ]);

        Auth::login($user);
        if ($request->hasSession()) {
            $request->session()->regenerate();
        }
        $token = $user->createToken('auth-token')->plainTextToken;

        return $this->successResponse($user->toUserDto(), 'Registration successful', 201, [
            'token' => $token,
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        $user = $request->user();

        if (! $user) {
            return $this->errorResponse('Unauthenticated', 401);
        }

        return $this->successResponse($user->toUserDto());
    }

    public function logout(Request $request): JsonResponse
    {
        $token = $request->user()?->currentAccessToken();

        if ($token instanceof PersonalAccessToken) {
            $token->delete();
        }

        Auth::guard('web')->logout();

        if ($request->hasSession()) {
            $request->session()->invalidate();
            $request->session()->regenerateToken();
        }

        return $this->successResponse(null, 'Logged out successfully');
    }

    public function activateMfa(Request $request): JsonResponse
    {
        $user = $request->user();
        if ($user) {
            $user->update(['is_totp_enabled' => true]);
        }

        return $this->successResponse('MFA Activated successfully');
    }

    public function mfaVerification(Request $request): JsonResponse
    {
        $user = $request->user();

        if (! $user) {
            return $this->errorResponse('Unauthenticated', 401);
        }

        return $this->successResponse($user->toUserDto(), 'MFA Verified successfully');
    }
}
