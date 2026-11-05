<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Club extends Model
{
    protected $fillable = [
        'name',
        'name_en',
        'city',
        'address',
        'description',
        'description_en',
        'phone',
        'email',
        'logo_url',
        'cover_url',
        'owner_id',
        'status',
    ];

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function golfCourses(): HasMany
    {
        return $this->hasMany(GolfCourse::class);
    }

    public function memberships(): HasMany
    {
        return $this->hasMany(Membership::class);
    }

    public function tournaments(): HasMany
    {
        return $this->hasMany(Tournament::class);
    }

    public function localizedName(): string
    {
        return app()->getLocale() === 'en' && $this->name_en
            ? $this->name_en
            : (string) $this->name;
    }

    public function localizedDescription(): string
    {
        return app()->getLocale() === 'en' && $this->description_en
            ? $this->description_en
            : (string) ($this->description ?? '');
    }

    public function toClubDto(): array
    {
        $courses = $this->golfCourses ?? collect();
        $owner = $this->owner;

        return [
            'id' => (string) $this->id,
            'name' => $this->localizedName(),
            'description' => $this->localizedDescription(),
            'city' => $this->city,
            'address' => $this->address,
            'phone' => $this->phone ?? '',
            'email' => $this->email ?? '',
            'logoURL' => $this->logo_url ?? '/teetime-logo.png',
            'coverURL' => $this->cover_url ?? '/club 1.png',
            'status' => $this->status ?? 'ACTIVE',
            'ownerId' => $this->owner_id ? (string) $this->owner_id : null,
            'ownerName' => $owner ? ($owner->first_name ? "{$owner->first_name} {$owner->last_name}" : $owner->name) : null,
            'memberCount' => $this->memberships()->count() * 12, // approx/active member count
            'courseCount' => $courses->count(),
            'createdAt' => $this->created_at ? $this->created_at->toISOString() : '',
            'courses' => $courses->map(fn($course) => $course->toCourseDto())->values()->all(),
        ];
    }
}
