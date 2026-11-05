<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProductOrder extends Model
{
    protected $fillable = [
        'user_id',
        'product_id',
        'product_variant_id',
        'size',
        'color',
        'quantity',
        'unit_price',
        'total_price',
        'status',
        'notes',
        'payment_status',
        'paid_at',
        'delivery_full_name',
        'delivery_phone',
        'delivery_city',
        'delivery_address',
        'delivery_details',
    ];

    protected function casts(): array
    {
        return [
            'quantity' => 'integer',
            'unit_price' => 'float',
            'total_price' => 'float',
            'paid_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function variant(): BelongsTo
    {
        return $this->belongsTo(ProductVariant::class, 'product_variant_id');
    }

    public function toDto(): array
    {
        $user = $this->user;
        $product = $this->product;

        return [
            'id' => (string) $this->id,
            'status' => $this->status,
            'quantity' => (int) $this->quantity,
            'unitPrice' => (float) $this->unit_price,
            'totalPrice' => (float) $this->total_price,
            'amountDue' => round((float) $this->total_price, 2),
            'size' => $this->size,
            'color' => $this->color,
            'notes' => $this->notes ?? '',
            'paymentStatus' => $this->payment_status ?? 'UNPAID',
            'paidAt' => $this->paid_at?->toISOString(),
            'deliveryFullName' => $this->delivery_full_name,
            'deliveryPhone' => $this->delivery_phone,
            'deliveryCity' => $this->delivery_city,
            'deliveryAddress' => $this->delivery_address,
            'deliveryDetails' => $this->delivery_details,
            'productId' => $product ? (string) $product->id : '',
            'productName' => $product?->name ?? 'Produit supprimé',
            'productImage' => $product?->image_url ?? '',
            'productCategory' => $product?->category ?? '',
            'playerName' => $user
                ? ($user->first_name ? "{$user->first_name} {$user->last_name}" : $user->name)
                : 'Joueur',
            'playerEmail' => $user?->email ?? '',
            'createdAt' => $this->created_at?->toISOString() ?? '',
        ];
    }
}
