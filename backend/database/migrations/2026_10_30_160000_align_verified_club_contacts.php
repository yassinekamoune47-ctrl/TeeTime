<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Replaces invented contact details with the ones published by the clubs
 * or the Royal Moroccan Golf Federation. Golf du Palais Royal d'Agadir is a
 * private course without published contacts, so its details are cleared
 * instead of being made up.
 */
return new class extends Migration
{
    public function up(): void
    {
        DB::table('clubs')
            ->where('name', 'Royal Golf Anfa Mohammedia')
            ->update([
                'address' => 'Lice d’Anfa, Anfa supérieur, Casablanca 20250',
                'phone' => '+212 5 22 36 10 26',
                'email' => 'royal.golf.am@gmail.com',
            ]);

        DB::table('clubs')
            ->where('name', 'Golf du Palais Royal')
            ->update([
                'name_en' => "Golf du Palais Royal d'Agadir",
                'phone' => null,
                'email' => null,
            ]);

        DB::table('clubs')
            ->where('name', 'Royal Golf de Marrakech')
            ->update([
                'name_en' => 'Royal Golf Marrakech',
                'address' => 'Ancienne Route de Ouarzazate, BP 634, 40000 Marrakech',
            ]);
    }

    public function down(): void
    {
        DB::table('clubs')
            ->where('name', 'Royal Golf Anfa Mohammedia')
            ->update([
                'address' => 'Boulevard de l’Océan Atlantique, Anfa, Casablanca',
                'phone' => '+212 522 36 12 34',
                'email' => 'contact@golfanfa.ma',
            ]);

        DB::table('clubs')
            ->where('name', 'Golf du Palais Royal')
            ->update([
                'name_en' => 'Royal Palace Golf Club',
                'phone' => '+212 528 84 56 78',
                'email' => 'contact@golfpalaisroyal.ma',
            ]);

        DB::table('clubs')
            ->where('name', 'Royal Golf de Marrakech')
            ->update([
                'name_en' => 'Royal Golf of Marrakech',
                'address' => 'Route d’Ouarzazate, Palmeraie, Marrakech',
            ]);
    }
};
