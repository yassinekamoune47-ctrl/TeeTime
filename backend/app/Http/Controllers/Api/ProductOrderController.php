<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use App\Models\Product;
use App\Models\ProductOrder;
use App\Models\ProductVariant;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ProductOrderController extends Controller
{
    use ApiResponseTrait;

    public function index(Request $request): JsonResponse
    {
        if (! $this->isAdmin($request)) {
            return $this->errorResponse('Unauthorized', 403);
        }

        $query = ProductOrder::with(['user', 'product'])->latest();

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        $orders = $query->get()->map(fn (ProductOrder $order) => $order->toDto())->values()->all();

        return $this->successResponse($orders, 'Orders retrieved successfully');
    }

    public function mine(Request $request): JsonResponse
    {
        $user = $request->user();

        if (! $user) {
            return $this->errorResponse('Unauthenticated', 401);
        }

        $orders = ProductOrder::with(['user', 'product'])
            ->where('user_id', $user->id)
            ->latest()
            ->get()
            ->map(fn (ProductOrder $order) => $order->toDto())
            ->values()
            ->all();

        return $this->successResponse($orders, 'Orders retrieved successfully');
    }

    public function store(Request $request): JsonResponse
    {
        $user = $request->user();

        if (! $user) {
            return $this->errorResponse('Unauthenticated', 401);
        }

        $validated = $request->validate([
            'productId' => 'required|exists:products,id',
            'quantity' => 'nullable|integer|min:1|max:10',
            'size' => 'nullable|string|max:20',
            'color' => 'nullable|string|max:40',
            'notes' => 'nullable|string|max:500',
        ]);

        $product = Product::with('variants')->where('is_active', true)->find($validated['productId']);

        if (! $product) {
            return $this->errorResponse('Product not available', 404);
        }

        if ($product->isPriceOnRequest()) {
            return $this->errorResponse('This product is priced on request and cannot be ordered online', 422);
        }

        $quantity = (int) ($validated['quantity'] ?? 1);

        $order = DB::transaction(function () use ($product, $user, $validated, $quantity) {
            $variant = null;

            if ($product->variants->isNotEmpty()) {
                $size = trim((string) ($validated['size'] ?? ''));
                $color = trim((string) ($validated['color'] ?? ''));

                if ($size === '' || $color === '') {
                    throw ValidationException::withMessages([
                        'size' => __('Please select a size and color.'),
                    ]);
                }

                $variant = ProductVariant::where('product_id', $product->id)
                    ->where('size', $size)
                    ->where('color', $color)
                    ->lockForUpdate()
                    ->first();

                if (! $variant) {
                    throw ValidationException::withMessages([
                        'size' => __('The selected size and color are unavailable.'),
                    ]);
                }

                if ($variant->stock < 1) {
                    throw ValidationException::withMessages([
                        'size' => __('The selected size and color are out of stock.'),
                    ]);
                }

                if ($variant->stock < $quantity) {
                    throw ValidationException::withMessages([
                        'quantity' => __('Not enough stock for the selected size and color.'),
                    ]);
                }

                $variant->decrement('stock', $quantity);
            }

            $subtotal = (float) $product->price * $quantity;

            return ProductOrder::create([
                'user_id' => $user->id,
                'product_id' => $product->id,
                'product_variant_id' => $variant?->id,
                'size' => $variant?->size,
                'color' => $variant?->color,
                'quantity' => $quantity,
                'unit_price' => $product->price,
                'total_price' => $subtotal,
                'status' => 'PENDING',
                'notes' => $validated['notes'] ?? null,
            ]);
        });

        return $this->successResponse(
            $order->load(['user', 'product'])->toDto(),
            'Order created successfully',
            201,
        );
    }

    public function updateStatus(Request $request): JsonResponse
    {
        if (! $this->isAdmin($request)) {
            return $this->errorResponse('Unauthorized', 403);
        }

        $validated = $request->validate([
            'id' => 'required|exists:product_orders,id',
            'status' => 'required|in:ACCEPTED,REJECTED',
        ]);

        $order = DB::transaction(function () use ($validated) {
            $order = ProductOrder::with(['user', 'product'])
                ->whereKey($validated['id'])
                ->lockForUpdate()
                ->firstOrFail();

            $previousStatus = $order->status;

            if ($order->product_variant_id && $validated['status'] !== $previousStatus) {
                if ($validated['status'] === 'REJECTED') {
                    ProductVariant::whereKey($order->product_variant_id)
                        ->increment('stock', (int) $order->quantity);
                } elseif ($previousStatus === 'REJECTED') {
                    $variant = ProductVariant::whereKey($order->product_variant_id)
                        ->lockForUpdate()
                        ->first();

                    if (! $variant || $variant->stock < $order->quantity) {
                        throw ValidationException::withMessages([
                            'status' => __('Not enough stock to accept this order again.'),
                        ]);
                    }

                    $variant->decrement('stock', (int) $order->quantity);
                }
            }

            $order->update(['status' => $validated['status']]);

            if ($validated['status'] === 'ACCEPTED' && $previousStatus !== 'ACCEPTED') {
                $this->notifyOrderAccepted($order);
            }

            return $order;
        });

        return $this->successResponse(
            $order->load(['user', 'product'])->toDto(),
            'Order status updated successfully',
        );
    }

    private function notifyOrderAccepted(ProductOrder $order): void
    {
        Notification::create([
            'user_id' => $order->user_id,
            'title' => 'Commande acceptée',
            'message' => "Votre commande a été acceptée avec succès par l'administrateur.",
            'type' => 'ORDER_ACCEPTED',
            'data' => [
                'orderId' => (string) $order->id,
                'productName' => $order->product?->name,
                'quantity' => (int) $order->quantity,
                'size' => $order->size,
                'color' => $order->color,
                'totalPrice' => (float) $order->total_price,
                'amountDue' => round((float) $order->total_price, 2),
            ],
        ]);
    }

    public function pay(Request $request): JsonResponse
    {
        $user = $request->user();

        if (! $user) {
            return $this->errorResponse('Unauthenticated', 401);
        }

        $validated = $request->validate([
            'id' => 'required|exists:product_orders,id',
            'deliveryFullName' => 'required|string|max:100',
            'deliveryPhone' => 'required|string|max:30',
            'deliveryCity' => 'required|string|max:100',
            'deliveryAddress' => 'required|string|max:255',
            'deliveryDetails' => 'nullable|string|max:500',
        ]);

        $order = ProductOrder::with(['user', 'product'])->findOrFail($validated['id']);

        if ((int) $order->user_id !== (int) $user->id) {
            return $this->errorResponse('Unauthorized', 403);
        }

        if ($order->payment_status === 'PAID') {
            return $this->errorResponse('Order already paid', 422);
        }

        if ($order->status !== 'ACCEPTED') {
            return $this->errorResponse('Order is not ready for payment', 422);
        }

        $details = trim((string) ($validated['deliveryDetails'] ?? ''));

        $payload = [
            'payment_status' => 'PAID',
            'paid_at' => now(),
            'delivery_full_name' => trim($validated['deliveryFullName']),
            'delivery_phone' => trim($validated['deliveryPhone']),
            'delivery_city' => trim($validated['deliveryCity']),
            'delivery_address' => trim($validated['deliveryAddress']),
            'delivery_details' => $details === '' ? null : $details,
        ];

        DB::transaction(function () use ($order, $payload) {
            $fresh = ProductOrder::whereKey($order->id)->lockForUpdate()->firstOrFail();

            if ($fresh->payment_status === 'PAID') {
                throw ValidationException::withMessages([
                    'id' => __('Order already paid'),
                ]);
            }

            $fresh->update($payload);
        });

        $order->refresh()->load(['user', 'product']);

        return $this->successResponse($order->toDto(), 'Order paid successfully');
    }

    private function isAdmin(Request $request): bool
    {
        $user = $request->user();

        return $user !== null && strtoupper((string) $user->role) === 'ADMIN';
    }
}
