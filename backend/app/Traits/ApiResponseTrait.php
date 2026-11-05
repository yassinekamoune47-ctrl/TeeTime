<?php

namespace App\Traits;

use Illuminate\Http\JsonResponse;

trait ApiResponseTrait
{
    protected function successResponse($data = null, string $message = 'Success', int $statusCode = 200, array $extra = []): JsonResponse
    {
        return response()->json(array_merge([
            'success' => true,
            'message' => $message,
            'data' => $data,
        ], $extra), $statusCode);
    }

    protected function paginatedResponse(array $data, int $total, int $page, int $size, string $message = 'Success'): JsonResponse
    {
        $hasMore = (($page + 1) * $size) < $total;

        return response()->json([
            'success' => true,
            'message' => $message,
            'length' => count($data),
            'data' => [
                'content' => $data,
                'totalElements' => $total,
                'totalPages' => (int) ceil($total / ($size ?: 1)),
                'size' => $size,
                'number' => $page,
                'last' => !$hasMore,
            ],
        ]);
    }

    protected function errorResponse(string $message = 'Error', int $statusCode = 400, $errors = null): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => $message,
            'errors' => $errors,
        ], $statusCode);
    }
}
