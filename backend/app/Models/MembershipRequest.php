<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MembershipRequest extends Model
{
    protected $fillable = [
        'user_id',
        'membership_id',
        'status',
        'payment_status',
        'paid_at',
        'start_date',
        'end_date',
    ];

    protected function casts(): array
    {
        return [
            'paid_at' => 'datetime',
            'start_date' => 'date:Y-m-d',
            'end_date' => 'date:Y-m-d',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function membership(): BelongsTo
    {
        return $this->belongsTo(Membership::class);
    }

    public function toRequestDto(): array
    {
        $user = $this->user;
        $membership = $this->membership;

        return [
            'id' => (string) $this->id,
            'userId' => $user ? (string) $user->id : '',
            'userFullName' => $user ? ($user->first_name ? "{$user->first_name} {$user->last_name}" : $user->name) : 'Golfer',
            'userEmail' => $user?->email,
            'userPhone' => $user?->phone_number,
            'membershipId' => (string) $this->membership_id,
            'planName' => $membership ? $membership->localizedTitle() : 'Standard Membership',
            'clubName' => $membership?->club?->localizedName(),
            'price' => (float) ($membership?->price ?? 0),
            'startDate' => $this->start_date?->toDateString(),
            'endDate' => $this->end_date?->toDateString(),
            'status' => $this->status,
            'paymentStatus' => $this->payment_status ?? 'UNPAID',
            'paidAt' => $this->paid_at ? $this->paid_at->toISOString() : null,
            'createdAt' => $this->created_at ? $this->created_at->toISOString() : '',
        ];
    }
}
