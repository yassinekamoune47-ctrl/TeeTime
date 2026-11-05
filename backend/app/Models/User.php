<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    public const ROLE_PLAYER = 'PLAYER';

    public const ROLE_MANAGER = 'MANAGER';

    public const ROLE_ADMIN = 'ADMIN';

    public const ROLE_ADMIN_APEX = 'ADMIN_APEX';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'first_name',
        'last_name',
        'email',
        'password',
        'role',
        'phone_number',
        'country_calling_code',
        'frmgl_license_number',
        'current_handicap',
        'status',
        'gender',
        'avatar_url',
        'bio',
        'birth_date',
        'is_totp_enabled',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'birth_date' => 'date',
            'current_handicap' => 'decimal:1',
            'is_totp_enabled' => 'boolean',
            'password' => 'hashed',
        ];
    }

    public function managedClub(): HasOne
    {
        return $this->hasOne(Club::class, 'owner_id');
    }

    public function reservations(): HasMany
    {
        return $this->hasMany(Reservation::class);
    }

    public function membershipRequests(): HasMany
    {
        return $this->hasMany(MembershipRequest::class);
    }

    public function notifications(): HasMany
    {
        return $this->hasMany(Notification::class);
    }

    /**
     * users.role is a free varchar and carries legacy or hand-written spellings
     * ('ROLE_MANAGER', 'Admin APEX'), so every role comparison goes through this
     * canonical form.
     */
    public function normalizedRole(): string
    {
        $role = trim((string) $this->role);
        $role = preg_replace('/^ROLE_/i', '', $role);
        $role = strtoupper(str_replace([' ', '-'], '_', (string) $role));

        // APEX administrators have been stored under both word orders.
        return $role === 'APEX_ADMIN' ? self::ROLE_ADMIN_APEX : $role;
    }

    public function isAdmin(): bool
    {
        return $this->normalizedRole() === self::ROLE_ADMIN;
    }

    /** APEX tournaments belong to this role, not to the platform ADMIN above. */
    public function isApexAdmin(): bool
    {
        return $this->normalizedRole() === self::ROLE_ADMIN_APEX;
    }

    public function toUserDto(): array
    {
        $club = $this->managedClub;

        return [
            'id' => (string) $this->id,
            'firstName' => $this->first_name ?? explode(' ', $this->name)[0] ?? '',
            'lastName' => $this->last_name ?? (count(explode(' ', $this->name)) > 1 ? implode(' ', array_slice(explode(' ', $this->name), 1)) : ''),
            'username' => $this->name,
            'email' => $this->email,
            'phoneNumber' => $this->phone_number ?? '',
            'countryCallingCode' => $this->country_calling_code,
            'frmglLicenseNumber' => $this->frmgl_license_number,
            'currentHandicap' => $this->current_handicap === null ? null : (float) $this->current_handicap,
            'status' => $this->status ?? 'ACTIVE',
            'gender' => $this->gender,
            'avatarURL' => $this->avatar_url ?? '',
            'bio' => $this->bio ?? '',
            'birthDate' => $this->birth_date ? $this->birth_date->format('Y-m-d') : null,
            'role' => $this->normalizedRole() !== '' ? $this->normalizedRole() : self::ROLE_PLAYER,
            'registerAt' => $this->created_at ? $this->created_at->toISOString() : '',
            'clubId' => $club ? (string) $club->id : '',
            'clubName' => $club ? $club->name : '',
            'isTotpEnabled' => (bool) $this->is_totp_enabled,
        ];
    }
}
