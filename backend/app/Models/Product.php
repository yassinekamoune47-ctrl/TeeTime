<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    protected $fillable = [
        'name',
        'description',
        'category',
        'price',
        'image_url',
        'hover_image_url',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'price' => 'float',
            'is_active' => 'boolean',
        ];
    }

    public function orders(): HasMany
    {
        return $this->hasMany(ProductOrder::class);
    }

    public function variants(): HasMany
    {
        return $this->hasMany(ProductVariant::class)->orderBy('id');
    }

    public function isPriceOnRequest(): bool
    {
        return $this->price === null;
    }

    public function toDto(): array
    {
        return [
            'id' => (string) $this->id,
            'name' => $this->name,
            'description' => $this->description ?? '',
            'category' => $this->category,
            'price' => $this->price === null ? null : (float) $this->price,
            'priceOnRequest' => $this->isPriceOnRequest(),
            'imageUrl' => $this->image_url ?? '',
            'hoverImageUrl' => $this->hover_image_url ?? '',
            'isActive' => (bool) $this->is_active,
            'variants' => $this->relationLoaded('variants')
                ? $this->variants->map(fn (ProductVariant $variant) => $variant->toDto())->values()->all()
                : [],
            'createdAt' => $this->created_at?->toISOString() ?? '',
        ];
    }
}
