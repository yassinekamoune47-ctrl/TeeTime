<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('golf_courses', function (Blueprint $table) {
            $table->decimal('price_per_player', 10, 2)->nullable()->change();
            $table->decimal('price_weekend', 10, 2)->nullable()->after('price_per_player');
            $table->json('green_fees')->nullable()->after('price_weekend');
            $table->json('extra_fees')->nullable()->after('green_fees');
        });

        $rgdsExtras = [
            ['label' => 'Voiturette — 18 trous', 'labelEn' => 'Cart — 18 holes', 'price' => 400],
            ['label' => 'Voiturette — 9 trous', 'labelEn' => 'Cart — 9 holes', 'price' => 250],
            ['label' => 'Sac de golf', 'labelEn' => 'Golf bag', 'price' => 300],
            ['label' => 'Caddie — 18 trous', 'labelEn' => 'Caddie — 18 holes', 'price' => 200],
            ['label' => 'Caddie — 9 trous', 'labelEn' => 'Caddie — 9 holes', 'price' => 100],
            ['label' => 'Chariot', 'labelEn' => 'Trolley', 'price' => 50],
            ['label' => 'Seau de balles (practice)', 'labelEn' => 'Practice balls (bucket)', 'price' => 20],
        ];

        $marrakechExtras = [
            ['label' => 'Caddie — 18 trous (obligatoire)', 'labelEn' => 'Caddie — 18 holes (mandatory)', 'price' => 200, 'priceMax' => 300],
            ['label' => 'Caddie — 9 trous (obligatoire)', 'labelEn' => 'Caddie — 9 holes (mandatory)', 'price' => 150, 'priceMax' => 250],
            ['label' => 'Sac de golf — 18 trous', 'labelEn' => 'Golf bag — 18 holes', 'price' => 400],
            ['label' => 'Sac de golf — 9 trous', 'labelEn' => 'Golf bag — 9 holes', 'price' => 250],
            ['label' => 'Voiturette — 18 trous', 'labelEn' => 'Cart — 18 holes', 'price' => 450],
            ['label' => 'Voiturette — 9 trous', 'labelEn' => 'Cart — 9 holes', 'price' => 300],
            ['label' => 'Chariot — 18 trous', 'labelEn' => 'Trolley — 18 holes', 'price' => 70],
            ['label' => 'Chariot — 9 trous', 'labelEn' => 'Trolley — 9 holes', 'price' => 40],
        ];

        $rgamExtras = [
            ['label' => 'Voiturette — 9 trous', 'labelEn' => 'Cart — 9 holes', 'price' => 250],
            ['label' => 'Voiturette — 18 trous', 'labelEn' => 'Cart — 18 holes', 'price' => 350],
        ];

        $clubs = DB::table('clubs')->pluck('id', 'name');

        // ── Royal Golf Dar Es Salam (Rabat): Rouge / Bleu / Vert ──
        if ($rgdsId = $clubs['Royal Golf Dar Es Salam'] ?? null) {
            $rouge = DB::table('golf_courses')
                ->where('club_id', $rgdsId)
                ->where('name', 'Parcours Principal')
                ->first();

            $rougeId = $rouge?->id ?? DB::table('golf_courses')
                ->where('club_id', $rgdsId)
                ->where('number_of_holes', 18)
                ->value('id');

            if ($rougeId) {
                DB::table('golf_courses')->where('id', $rougeId)->update([
                    'name' => 'Parcours Rouge',
                    'description' => 'Le parcours signature 18 trous du Royal Golf Dar Es Salam, tracé par Robert Trent Jones entre pins, chênes-lièges et eucalyptus.',
                    'price_per_player' => 1200,
                    'price_weekend' => null,
                    'number_of_holes' => 18,
                    'green_fees' => json_encode([
                        ['label' => '18 trous — Public', 'labelEn' => '18 holes — Public', 'holes' => 18, 'price' => 1200],
                        ['label' => '18 trous — Fédéral', 'labelEn' => '18 holes — Federation member', 'holes' => 18, 'price' => 900],
                        ['label' => '9 trous — Public', 'labelEn' => '9 holes — Public', 'holes' => 9, 'price' => 650],
                        ['label' => '9 trous — Fédéral', 'labelEn' => '9 holes — Federation member', 'holes' => 9, 'price' => 490],
                    ]),
                    'extra_fees' => json_encode($rgdsExtras),
                    'updated_at' => now(),
                ]);
            }

            if (! DB::table('golf_courses')->where('club_id', $rgdsId)->where('name', 'Parcours Bleu')->exists()) {
                DB::table('golf_courses')->insert([
                    'club_id' => $rgdsId,
                    'name' => 'Parcours Bleu',
                    'description' => 'Le deuxième parcours 18 trous du Royal Golf Dar Es Salam, plus court et technique, au cœur de la forêt de Souissi.',
                    'location' => 'Rabat',
                    'price_per_player' => 850,
                    'price_weekend' => null,
                    'number_of_holes' => 18,
                    'image' => '/royal-golf-rabat-course.jpg',
                    'is_active' => true,
                    'green_fees' => json_encode([
                        ['label' => '18 trous — Public', 'labelEn' => '18 holes — Public', 'holes' => 18, 'price' => 850],
                        ['label' => '18 trous — Fédéral', 'labelEn' => '18 holes — Federation member', 'holes' => 18, 'price' => 640],
                        ['label' => '9 trous — Public', 'labelEn' => '9 holes — Public', 'holes' => 9, 'price' => 450],
                        ['label' => '9 trous — Fédéral', 'labelEn' => '9 holes — Federation member', 'holes' => 9, 'price' => 340],
                    ]),
                    'extra_fees' => json_encode($rgdsExtras),
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            if (! DB::table('golf_courses')->where('club_id', $rgdsId)->where('name', 'Parcours Vert')->exists()) {
                DB::table('golf_courses')->insert([
                    'club_id' => $rgdsId,
                    'name' => 'Parcours Vert',
                    'description' => 'Un parcours 9 trous compact, idéal pour une partie rapide ou une séance d’entraînement.',
                    'location' => 'Rabat',
                    'price_per_player' => 300,
                    'price_weekend' => null,
                    'number_of_holes' => 9,
                    'image' => '/royal-golf-rabat-course.jpg',
                    'is_active' => true,
                    'green_fees' => json_encode([
                        ['label' => '9 trous — Public', 'labelEn' => '9 holes — Public', 'holes' => 9, 'price' => 300],
                        ['label' => '9 trous — Fédéral', 'labelEn' => '9 holes — Federation member', 'holes' => 9, 'price' => 250],
                    ]),
                    'extra_fees' => json_encode($rgdsExtras),
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }

        // ── Royal Golf de Marrakech: Ancien Parcours (18) / Menara (9) ──
        if ($marrakechId = $clubs['Royal Golf de Marrakech'] ?? null) {
            $ancienId = DB::table('golf_courses')
                ->where('club_id', $marrakechId)
                ->where(fn ($q) => $q->where('name', 'Parcours Massy')->orWhere('number_of_holes', 18))
                ->value('id');

            if ($ancienId) {
                DB::table('golf_courses')->where('id', $ancienId)->update([
                    'name' => 'Ancien Parcours',
                    'description' => 'Le parcours historique 18 trous du Royal Golf de Marrakech, fondé en 1920, bordé de cyprès et d’oliviers centenaires.',
                    'price_per_player' => 1200,
                    'price_weekend' => null,
                    'number_of_holes' => 18,
                    'green_fees' => json_encode([
                        ['label' => '18 trous', 'labelEn' => '18 holes', 'holes' => 18, 'price' => 1200],
                    ]),
                    'extra_fees' => json_encode($marrakechExtras),
                    'updated_at' => now(),
                ]);
            }

            $menaraId = DB::table('golf_courses')
                ->where('club_id', $marrakechId)
                ->where(fn ($q) => $q->where('name', 'Parcours Menara')->orWhere('number_of_holes', 9))
                ->value('id');

            if ($menaraId) {
                DB::table('golf_courses')->where('id', $menaraId)->update([
                    'name' => 'Parcours Menara',
                    'description' => 'Le parcours 9 trous du Royal Golf de Marrakech, moderne et technique, idéal pour le jeu court.',
                    'price_per_player' => 700,
                    'price_weekend' => null,
                    'number_of_holes' => 9,
                    'green_fees' => json_encode([
                        ['label' => '9 trous', 'labelEn' => '9 holes', 'holes' => 9, 'price' => 700],
                    ]),
                    'extra_fees' => json_encode($marrakechExtras),
                    'updated_at' => now(),
                ]);
            }
        }

        // ── Royal Golf Anfa Mohammedia: Anfa (9) / Mohammedia (18) ──
        if ($rgamId = $clubs['Royal Golf Anfa Mohammedia'] ?? null) {
            $anfaId = DB::table('golf_courses')
                ->where('club_id', $rgamId)
                ->where(fn ($q) => $q->where('name', 'Parcours Atlantique')->orWhere('number_of_holes', 18))
                ->value('id');

            if ($anfaId) {
                DB::table('golf_courses')->where('id', $anfaId)->update([
                    'name' => 'Parcours Anfa',
                    'description' => 'Le parcours 9 trous du site d’Anfa, au cœur de Casablanca.',
                    'price_per_player' => 400,
                    'price_weekend' => 500,
                    'number_of_holes' => 9,
                    'green_fees' => json_encode([
                        ['label' => '9 trous — Licencié', 'labelEn' => '9 holes — Licensed', 'holes' => 9, 'price' => 250, 'weekendPrice' => 300],
                        ['label' => '9 trous — Non licencié', 'labelEn' => '9 holes — Non-licensed', 'holes' => 9, 'price' => 400, 'weekendPrice' => 500],
                    ]),
                    'extra_fees' => json_encode([
                        ['label' => 'Voiturette — 9 trous', 'labelEn' => 'Cart — 9 holes', 'price' => 250],
                    ]),
                    'updated_at' => now(),
                ]);
            }

            if (! DB::table('golf_courses')->where('club_id', $rgamId)->where('name', 'Parcours Mohammedia')->exists()) {
                DB::table('golf_courses')->insert([
                    'club_id' => $rgamId,
                    'name' => 'Parcours Mohammedia',
                    'description' => 'Le parcours 18 trous (par 72) du site de Mohammedia, le long de l’océan Atlantique.',
                    'location' => 'Mohammedia',
                    'price_per_player' => 600,
                    'price_weekend' => 700,
                    'number_of_holes' => 18,
                    'image' => '/section2.png',
                    'is_active' => true,
                    'green_fees' => json_encode([
                        ['label' => '18 trous — Licencié', 'labelEn' => '18 holes — Licensed', 'holes' => 18, 'price' => 400, 'weekendPrice' => 500],
                        ['label' => '18 trous — Non licencié', 'labelEn' => '18 holes — Non-licensed', 'holes' => 18, 'price' => 600, 'weekendPrice' => 700],
                    ]),
                    'extra_fees' => json_encode([
                        ['label' => 'Voiturette — 18 trous', 'labelEn' => 'Cart — 18 holes', 'price' => 350],
                    ]),
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }

        // ── Golf du Palais Royal (Agadir): private, green fees not published ──
        if ($palaisId = $clubs['Golf du Palais Royal'] ?? null) {
            DB::table('golf_courses')
                ->where('club_id', $palaisId)
                ->update([
                    'name' => 'Parcours Royal',
                    'description' => 'Parcours 18 trous du Golf du Palais Royal d’Agadir. Club privé : les green fees ne sont pas publiés, réservation sur demande.',
                    'price_per_player' => null,
                    'price_weekend' => null,
                    'number_of_holes' => 18,
                    'green_fees' => json_encode([]),
                    'extra_fees' => json_encode([]),
                    'updated_at' => now(),
                ]);
        }
    }

    public function down(): void
    {
        Schema::table('golf_courses', function (Blueprint $table) {
            $table->dropColumn(['price_weekend', 'green_fees', 'extra_fees']);
        });

        DB::table('golf_courses')->whereNull('price_per_player')->update(['price_per_player' => 0]);

        Schema::table('golf_courses', function (Blueprint $table) {
            $table->decimal('price_per_player', 10, 2)->nullable(false)->change();
        });
    }
};
