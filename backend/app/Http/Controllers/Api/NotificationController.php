<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    use ApiResponseTrait;

    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        if (! $user) {
            return $this->errorResponse('Unauthenticated', 401);
        }

        $page = max(0, (int) $request->input('page', 0));
        $size = min(50, max(1, (int) $request->input('size', 20)));

        $notifications = Notification::where('user_id', $user->id)
            ->latest()
            ->skip($page * $size)
            ->take($size)
            ->get()
            ->map(fn (Notification $notification) => $notification->toNotificationDto())
            ->values()
            ->all();

        return $this->successResponse($notifications);
    }

    public function unreadCount(Request $request): JsonResponse
    {
        $user = $request->user();

        if (! $user) {
            return $this->errorResponse('Unauthenticated', 401);
        }

        $count = Notification::where('user_id', $user->id)->where('is_read', false)->count();

        return $this->successResponse($count);
    }

    public function markAsRead(Request $request, string $id): JsonResponse
    {
        $user = $request->user();

        if (! $user) {
            return $this->errorResponse('Unauthenticated', 401);
        }

        $notification = Notification::where('user_id', $user->id)->find($id);

        if (! $notification) {
            return $this->errorResponse('Notification not found', 404);
        }

        $notification->update(['is_read' => true]);

        return $this->successResponse($notification->toNotificationDto(), 'Marked as read');
    }

    public function markAllAsRead(Request $request): JsonResponse
    {
        $user = $request->user();

        if (! $user) {
            return $this->errorResponse('Unauthenticated', 401);
        }

        Notification::where('user_id', $user->id)
            ->where('is_read', false)
            ->update(['is_read' => true]);

        return $this->successResponse('All notifications marked as read');
    }
}
