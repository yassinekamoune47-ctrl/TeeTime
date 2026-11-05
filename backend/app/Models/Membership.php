<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Membership extends Model
{
    protected $fillable = [
        'club_id',
        'title',
        'title_en',
        'description',
        'description_en',
        'price',
        'status',
        'benefits',
        'benefits_en',
    ];

    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'benefits' => 'array',
            'benefits_en' => 'array',
        ];
    }

    public function club(): BelongsTo
    {
        return $this->belongsTo(Club::class);
    }

    public function requests(): HasMany
    {
        return $this->hasMany(MembershipRequest::class);
    }

    public function localizedTitle(): string
    {
        return app()->getLocale() === 'en' && $this->title_en
            ? $this->title_en
            : (string) $this->title;
    }

    public function toMembershipDto(): array
    {
        $club = $this->club;
        $isEnglish = app()->getLocale() === 'en';

        $benefits = $isEnglish && ! empty($this->benefits_en)
            ? $this->benefits_en
            : $this->benefits;

        return [
            'id' => (string) $this->id,
            'title' => $this->localizedTitle(),
            'description' => $isEnglish && $this->description_en
                ? $this->description_en
                : ($this->description ?? ''),
            'price' => (float) $this->price,
            'status' => $this->status ?? 'ACTIVE',
            'benefits' => is_array($benefits) ? $benefits : [],
            'club' => $club ? [
                'id' => (string) $club->id,
                'name' => $club->localizedName(),
                'city' => $club->city,
                'address' => $club->address,
            ] : null,
        ];
    }
}
