<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Tournament extends Model
{
    public const STATUS_BROUILLON = 'BROUILLON';

    public const STATUS_INSCRIPTIONS_OUVERTES = 'INSCRIPTIONS_OUVERTES';

    public const STATUS_INSCRIPTIONS_FERMEES = 'INSCRIPTIONS_FERMEES';

    public const STATUS_AVANT_TOURNOI = 'AVANT_TOURNOI';

    public const STATUS_EN_DIRECT = 'EN_DIRECT';

    public const STATUS_TERMINE = 'TERMINE';

    public const STATUS_RESULTATS_PUBLIES = 'RESULTATS_PUBLIES';

    public const STATUS_ARCHIVE = 'ARCHIVE';

    /**
     * Statuses hidden from every player-facing surface.
     */
    public const PRIVATE_STATUSES = [
        self::STATUS_BROUILLON,
    ];

    /**
     * Allowed lifecycle transitions. The lifecycle only moves forward, and any
     * non-terminal status may be archived. ARCHIVE is terminal.
     */
    public const TRANSITIONS = [
        self::STATUS_BROUILLON => [
            self::STATUS_INSCRIPTIONS_OUVERTES,
            self::STATUS_ARCHIVE,
        ],
        self::STATUS_INSCRIPTIONS_OUVERTES => [
            self::STATUS_INSCRIPTIONS_FERMEES,
            self::STATUS_ARCHIVE,
        ],
        self::STATUS_INSCRIPTIONS_FERMEES => [
            self::STATUS_AVANT_TOURNOI,
            self::STATUS_ARCHIVE,
        ],
        self::STATUS_AVANT_TOURNOI => [
            self::STATUS_EN_DIRECT,
            self::STATUS_ARCHIVE,
        ],
        self::STATUS_EN_DIRECT => [
            self::STATUS_TERMINE,
        ],
        self::STATUS_TERMINE => [
            self::STATUS_RESULTATS_PUBLIES,
        ],
        self::STATUS_RESULTATS_PUBLIES => [
            self::STATUS_ARCHIVE,
        ],
        self::STATUS_ARCHIVE => [],
    ];

    protected $fillable = [
        'club_id',
        'name',
        'description',
        'date',
        'location',
        'status',
        'image_url',
        'entry_fee',
        'max_participants',
        'current_participants',
    ];

    protected function casts(): array
    {
        return [
            'date' => 'datetime',
            'entry_fee' => 'decimal:2',
            'max_participants' => 'integer',
            'current_participants' => 'integer',
        ];
    }

    public static function statuses(): array
    {
        return array_keys(self::TRANSITIONS);
    }

    public static function nextStatuses(string $status): array
    {
        return self::TRANSITIONS[$status] ?? [];
    }

    public static function canTransition(string $from, string $to): bool
    {
        return in_array($to, self::nextStatuses($from), true);
    }

    public function club(): BelongsTo
    {
        return $this->belongsTo(Club::class);
    }

    public function toTournamentDto(): array
    {
        $club = $this->club;

        return [
            'id' => (string) $this->id,
            'name' => $this->name,
            'description' => $this->description ?? '',
            'date' => $this->date ? $this->date->format('Y-m-d') : '',
            'location' => $this->location,
            'clubName' => $club?->name,
            'status' => $this->status,
            'imageUrl' => $this->image_url ?? '/section3.png',
            'entryFee' => (float) $this->entry_fee,
            'maxParticipants' => (int) $this->max_participants,
            'nextStatuses' => self::nextStatuses($this->status),
        ];
    }
}
