<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Aligns existing club rows with the official names and contact details
 * published by the clubs (Golf d'Anfa belongs to Royal Golf Anfa Mohammedia;
 * the Rabat royal club is Royal Golf Dar Es Salam).
 */
return new class extends Migration
{
    public function up(): void
    {
        DB::table('clubs')
            ->where('name', "Golf d'Anfa")
            ->update([
                'name' => 'Royal Golf Anfa Mohammedia',
                'name_en' => 'Royal Golf Anfa Mohammedia',
            ]);

        DB::table('clubs')
            ->where('name', 'Royal Golf de Rabat')
            ->update([
                'name' => 'Royal Golf Dar Es Salam',
                'name_en' => 'Royal Golf Dar Es Salam',
                'address' => 'Avenue Mohammed VI km 9, route des Zaërs, Souissi, Rabat',
                'phone' => '+212 537 755 864',
                'email' => 'contact@royalgolfdaressalam.com',
            ]);

        DB::table('golf_courses')
            ->where('description', 'like', '%Royal Golf de Rabat%')
            ->update([
                'description' => DB::raw("REPLACE(description, 'Royal Golf de Rabat', 'Royal Golf Dar Es Salam')"),
            ]);
    }

    public function down(): void
    {
        DB::table('clubs')
            ->where('name', 'Royal Golf Anfa Mohammedia')
            ->update([
                'name' => "Golf d'Anfa",
                'name_en' => 'Anfa Golf Club',
            ]);

        DB::table('clubs')
            ->where('name', 'Royal Golf Dar Es Salam')
            ->update([
                'name' => 'Royal Golf de Rabat',
                'name_en' => 'Royal Golf of Rabat',
                'address' => 'Avenue Mohammed VI, Souissi, Rabat',
                'phone' => '+212 537 75 58 64',
                'email' => 'contact@royalgolfrabat.ma',
            ]);
    }
};
