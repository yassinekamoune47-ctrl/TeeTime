<?php

use App\Models\Tournament;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Legacy status -> APEX lifecycle status.
     */
    private const UP_MAP = [
        'PENDING' => Tournament::STATUS_BROUILLON,
        'ACTIVE' => Tournament::STATUS_INSCRIPTIONS_OUVERTES,
        'COMPLETED' => Tournament::STATUS_TERMINE,
        'CANCELED' => Tournament::STATUS_ARCHIVE,
    ];

    /**
     * APEX status -> nearest legacy status, for the rollback only.
     */
    private const DOWN_MAP = [
        Tournament::STATUS_BROUILLON => 'PENDING',
        Tournament::STATUS_INSCRIPTIONS_OUVERTES => 'ACTIVE',
        Tournament::STATUS_INSCRIPTIONS_FERMEES => 'ACTIVE',
        Tournament::STATUS_AVANT_TOURNOI => 'ACTIVE',
        Tournament::STATUS_EN_DIRECT => 'ACTIVE',
        Tournament::STATUS_TERMINE => 'COMPLETED',
        Tournament::STATUS_RESULTATS_PUBLIES => 'COMPLETED',
        Tournament::STATUS_ARCHIVE => 'CANCELED',
    ];

    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Widen first so the remapped values are accepted by the column.
        $this->setType('string', 32);
        $this->remap(self::UP_MAP);
        $this->setType('enum');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $this->setType('string', 32);
        $this->remap(self::DOWN_MAP);
        $this->setType('enum', 32, ['PENDING', 'ACTIVE', 'COMPLETED', 'CANCELED'], 'PENDING');
    }

    private function setType(string $type, ?int $length = null, ?array $values = null, ?string $default = null): void
    {
        $default ??= Tournament::STATUS_BROUILLON;
        $values ??= Tournament::statuses();

        Schema::table('tournaments', function (Blueprint $table) use ($type, $length, $values, $default) {
            $column = $type === 'enum'
                ? $table->enum('status', $values)
                : $table->string('status', $length ?? 32);

            $column->default($default)->change();
        });
    }

    private function remap(array $map): void
    {
        foreach ($map as $from => $to) {
            DB::table('tournaments')->where('status', $from)->update(['status' => $to]);
        }
    }
};
