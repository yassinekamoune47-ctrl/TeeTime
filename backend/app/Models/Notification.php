<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Notification extends Model
{
    protected $fillable = [
        'user_id',
        'title',
        'message',
        'type',
        'data',
        'is_read',
    ];

    protected function casts(): array
    {
        return [
            'is_read' => 'boolean',
            'data' => 'array',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function toNotificationDto(): array
    {
        return [
            'id' => (string) $this->id,
            'userId' => (string) $this->user_id,
            'title' => $this->title,
            'message' => $this->message,
            'type' => $this->type ?? 'INFO',
            'isRead' => (bool) $this->is_read,
            'data' => $this->data ?? null,
            'createdAt' => $this->created_at ? $this->created_at->toISOString() : '',
        ];
    }
}
