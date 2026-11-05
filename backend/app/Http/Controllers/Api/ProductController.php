<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class ProductController extends Controller
{
    use ApiResponseTrait;

    public function index(Request $request): JsonResponse
    {
        $query = Product::with('variants')->where('is_active', true)->latest();

        if ($request->filled('category')) {
            $query->where('category', $request->input('category'));
        }

        if ($request->filled('search')) {
            $term = $request->input('search');
            $query->where(function ($q) use ($term) {
                $q->where('name', 'like', "%{$term}%")
                  ->orWhere('description', 'like', "%{$term}%");
            });
        }

        $products = $query->get()->map(fn (Product $product) => $product->toDto())->values()->all();

        return $this->successResponse($products, 'Products retrieved successfully');
    }

    public function manage(): JsonResponse
    {
        $products = Product::with('variants')->latest()->get()->map(fn (Product $product) => $product->toDto())->values()->all();

        return $this->successResponse($products, 'Products retrieved successfully');
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $this->validateProduct($request);

        $product = Product::create([
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'category' => $validated['category'] ?? 'ACCESSORIES',
            'price' => $validated['price'] ?? null,
            'image_url' => $this->storeImage($request),
            'is_active' => $request->boolean('isActive', true),
        ]);

        return $this->successResponse($product->load('variants')->toDto(), 'Product created successfully', 201);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $product = Product::findOrFail($id);
        $validated = $this->validateProduct($request, true);

        $data = [
            'name' => $validated['name'] ?? $product->name,
            'description' => $validated['description'] ?? $product->description,
            'category' => $validated['category'] ?? $product->category,
            'price' => array_key_exists('price', $validated) ? $validated['price'] : $product->price,
        ];

        $image = $this->storeImage($request);
        if ($image !== null) {
            $data['image_url'] = $image;
        }

        if ($request->has('isActive')) {
            $data['is_active'] = $request->boolean('isActive');
        }

        $previousImage = $product->image_url;
        $product->update($data);

        if (isset($data['image_url']) && $data['image_url'] !== $previousImage) {
            $this->deleteManagedImage($previousImage);
        }

        return $this->successResponse($product->fresh()->load('variants')->toDto(), 'Product updated successfully');
    }

    public function updateVariants(Request $request, string $id): JsonResponse
    {
        if (! $this->isAdmin($request)) {
            return $this->errorResponse('Unauthorized', 403);
        }

        $product = Product::findOrFail($id);

        $validated = $request->validate([
            'variants' => 'present|array',
            'variants.*.size' => 'required|string|max:20',
            'variants.*.color' => 'required|string|max:40',
            'variants.*.stock' => 'required|integer|min:0',
        ]);

        $rows = collect($validated['variants'])->map(fn (array $row) => [
            'size' => trim((string) $row['size']),
            'color' => trim((string) $row['color']),
            'stock' => (int) $row['stock'],
        ]);

        if ($rows->contains(fn (array $row) => $row['size'] === '' || $row['color'] === '')) {
            return $this->errorResponse('Variant size and color are required', 422);
        }

        $keys = $rows->map(fn (array $row) => mb_strtolower($row['size'].'|'.$row['color']));

        if ($keys->duplicates()->isNotEmpty()) {
            return $this->errorResponse('Duplicate size and color combinations', 422);
        }

        DB::transaction(function () use ($product, $rows) {
            $existing = $product->variants()->get()->keyBy(
                fn (ProductVariant $variant) => mb_strtolower($variant->size.'|'.$variant->color),
            );
            $keptIds = [];

            foreach ($rows as $row) {
                $variant = $existing->get(mb_strtolower($row['size'].'|'.$row['color']));

                if ($variant) {
                    $variant->update([
                        'size' => $row['size'],
                        'color' => $row['color'],
                        'stock' => $row['stock'],
                    ]);
                } else {
                    $variant = $product->variants()->create($row);
                }

                $keptIds[] = $variant->id;
            }

            $product->variants()->whereNotIn('id', $keptIds)->delete();
        });

        return $this->successResponse(
            $product->fresh()->load('variants')->toDto(),
            'Variants updated successfully',
        );
    }

    public function destroy(string $id): JsonResponse
    {
        $product = Product::findOrFail($id);
        $product->delete();
        $this->deleteManagedImage($product->image_url);

        return $this->successResponse(null, 'Product deleted successfully');
    }

    private function validateProduct(Request $request, bool $partial = false): array
    {
        $required = $partial ? 'sometimes|required' : 'required';

        return $request->validate([
            'name' => "{$required}|string|max:255",
            'description' => 'nullable|string',
            'category' => 'nullable|string|max:50',
            'price' => $partial ? 'sometimes|nullable|numeric|min:0' : 'nullable|numeric|min:0',
            'image' => 'nullable|image|max:5120',
            'imageUrl' => 'nullable|string|max:2048',
        ]);
    }

    private function storeImage(Request $request): ?string
    {
        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('products', 'public');

            return '/storage/' . $path;
        }

        if ($request->filled('imageUrl')) {
            return $request->input('imageUrl');
        }

        return null;
    }

    private function deleteManagedImage(?string $url): void
    {
        if (! $url || ! str_starts_with($url, '/storage/products/')) {
            return;
        }

        Storage::disk('public')->delete(str_replace('/storage/', '', $url));
    }

    private function isAdmin(Request $request): bool
    {
        $user = $request->user();

        return $user !== null && strtoupper((string) $user->role) === 'ADMIN';
    }
}
