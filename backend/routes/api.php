<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ClubController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\GolfCourseController;
use App\Http\Controllers\Api\MembershipController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\ProductOrderController;
use App\Http\Controllers\Api\ReservationController;
use App\Http\Controllers\Api\TimeSlotController;
use App\Http\Controllers\Api\TournamentController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| TeeTime Executive API Routes
|--------------------------------------------------------------------------
|
| Public routes are limited to authentication and read-only catalog data
| (clubs, courses, membership plans, tournaments, products). Everything that
| returns or mutates account-owned data lives behind auth:sanctum.
|
*/

// ─── Authentication ───
Route::post('/login', [AuthController::class, 'login']);
Route::post('/auth/sign-up', [AuthController::class, 'signup']);
Route::get('/auth/me', [AuthController::class, 'me']);
Route::post('/auth/logout', [AuthController::class, 'logout']);

// ─── Public catalog ───
Route::get('/clubs', [ClubController::class, 'index']);
Route::get('/clubs/my-club', [ClubController::class, 'getMyClub'])
    ->middleware('auth:sanctum');
Route::get('/clubs/{club}', [ClubController::class, 'show']);
Route::post('/clubs/all', [ClubController::class, 'searchClubs']);

Route::get('/golf-courses', [GolfCourseController::class, 'index']);
Route::get('/golf-courses/{golf_course}', [GolfCourseController::class, 'show']);

Route::post('/time-slots/search', [TimeSlotController::class, 'searchTimeSlots']);
Route::get('/time-slots/course', [TimeSlotController::class, 'searchCourseTimeSlots']);
Route::get('/time-slots/available-dates', [TimeSlotController::class, 'availableDates']);

Route::post('/memberships/all', [MembershipController::class, 'searchAll']);
Route::get('/memberships/{membership}', [MembershipController::class, 'show']);

Route::post('/tournaments/public-search', [TournamentController::class, 'publicSearch']);

Route::get('/products', [ProductController::class, 'index']);

// ─── Authenticated routes ───
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/mfa/activate', [AuthController::class, 'activateMfa']);
    Route::post('/mfa/verify', [AuthController::class, 'mfaVerification']);

    // ─── Clubs management ───
    // Specific paths must be registered before the {club} wildcard.
    Route::post('/clubs/add', [ClubController::class, 'store']);
    Route::patch('/clubs/update', [ClubController::class, 'updateFromFormData']);
    Route::patch('/clubs/reassign', [ClubController::class, 'reassign']);
    Route::patch('/clubs/change-status', [ClubController::class, 'changeStatus']);
    Route::post('/clubs', [ClubController::class, 'store']);
    Route::put('/clubs/{club}', [ClubController::class, 'update']);
    Route::patch('/clubs/{club}', [ClubController::class, 'update']);
    Route::delete('/clubs/{club}', [ClubController::class, 'destroy']);

    // ─── Golf courses management ───
    Route::post('/courses/add', [GolfCourseController::class, 'store']);
    Route::patch('/courses/update', [GolfCourseController::class, 'update']);
    Route::delete('/courses/delete/{id}', [GolfCourseController::class, 'destroy']);

    // ─── Users & Profile ───
    Route::post('/users/all', [UserController::class, 'searchUsers']);
    Route::post('/users/managers', [UserController::class, 'getManagers']);
    Route::post('/users/add-manager', [UserController::class, 'addManager']);
    Route::patch('/users/change-status', [UserController::class, 'changeStatus']);
    Route::patch('/users/updateMyData', [UserController::class, 'updateMyData']);
    Route::put('/users/updateMyPassword', [UserController::class, 'updateMyPassword']);
    Route::put('/users/updateMyPP', [UserController::class, 'updateMyProfilePicture']);

    // ─── Time slots & planning ───
    Route::post('/time-slots/manager', [TimeSlotController::class, 'searchManagerTimeSlots']);
    Route::post('/time-slots/add', [TimeSlotController::class, 'createTimeSlot']);
    Route::put('/time-slots/update-status', [TimeSlotController::class, 'updateTimeSlotStatus']);

    // ─── Reservations ───
    Route::post('/reservations/player/list', [ReservationController::class, 'searchPlayerReservations']);
    Route::get('/reservations/club', [ReservationController::class, 'searchClubReservations']);
    Route::put('/reservations/update-status', [ReservationController::class, 'updateStatus']);
    Route::post('/reservations', [ReservationController::class, 'store']);
    Route::post('/reservations/add', [ReservationController::class, 'store']);
    Route::post('/reservations/book', [ReservationController::class, 'store']);
    Route::patch('/reservations/{id}/cancel', [ReservationController::class, 'cancel']);

    // ─── Memberships & requests ───
    Route::post('/memberships/getMyMemberships', [MembershipController::class, 'getMyMemberships']);
    Route::post('/memberships/player/clubs', [MembershipController::class, 'searchPlayerClubs']);
    Route::post('/memberships/add', [MembershipController::class, 'store']);
    Route::patch('/memberships/update', [MembershipController::class, 'update']);

    Route::post('/memberships-requests/all', [MembershipController::class, 'searchRequests']);
    Route::post('/memberships-requests/members', [MembershipController::class, 'searchMembers']);
    Route::post('/memberships-requests/request', [MembershipController::class, 'requestMembership']);
    Route::post('/memberships-requests/accept', [MembershipController::class, 'acceptRequest']);
    Route::post('/memberships-requests/reject', [MembershipController::class, 'rejectRequest']);

    // ─── Tournaments management (APEX Admin only) ───
    Route::post('/tournaments/search', [TournamentController::class, 'search']);
    Route::post('/tournaments', [TournamentController::class, 'store']);
    Route::put('/tournaments', [TournamentController::class, 'update']);
    Route::delete('/tournaments/{id}', [TournamentController::class, 'destroy']);

    // ─── Boutique management ───
    Route::get('/products/manage', [ProductController::class, 'manage']);
    Route::post('/products', [ProductController::class, 'store']);
    Route::post('/products/{id}', [ProductController::class, 'update']);
    Route::put('/products/{id}/variants', [ProductController::class, 'updateVariants']);
    Route::delete('/products/{id}', [ProductController::class, 'destroy']);

    Route::get('/product-orders/mine', [ProductOrderController::class, 'mine']);
    Route::get('/product-orders', [ProductOrderController::class, 'index']);
    Route::post('/product-orders', [ProductOrderController::class, 'store']);
    Route::post('/product-orders/pay', [ProductOrderController::class, 'pay']);
    Route::put('/product-orders/update-status', [ProductOrderController::class, 'updateStatus']);

    // ─── Dashboards ───
    Route::get('/dashboard/admin', [DashboardController::class, 'adminDashboard']);
    Route::get('/dashboard/manager', [DashboardController::class, 'managerDashboard']);
    Route::get('/dashboard/player', [DashboardController::class, 'playerDashboard']);

    // ─── Notifications ───
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::get('/notifications/unread-count', [NotificationController::class, 'unreadCount']);
    Route::patch('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
    Route::patch('/notifications/read-all', [NotificationController::class, 'markAllAsRead']);
});
