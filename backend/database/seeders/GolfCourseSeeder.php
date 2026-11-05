<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\GolfCourse;

class GolfCourseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        
        GolfCourse::create([
            'name' => 'Golf de Casablanca',
            'description' => 'Terrain de golf de test',
            'location' => 'Casablanca, Maroc',
            'price_per_player' => 500,
            'number_of_holes' => 18,
            'is_active' => true,
        ]);
    }
}
