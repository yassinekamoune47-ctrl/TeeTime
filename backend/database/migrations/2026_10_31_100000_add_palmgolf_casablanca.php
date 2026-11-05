<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    private string $clubName = 'PalmGolf Casablanca';

    private string $courseName = 'Parcours PalmGolf';

    public function up(): void
    {
        $clubId = DB::table('clubs')->where('name', $this->clubName)->value('id');

        if ($clubId === null) {
            $clubId = DB::table('clubs')->insertGetId([
                'name' => $this->clubName,
                'name_en' => $this->clubName,
                'city' => 'Casablanca',
                'address' => 'California Golf Resort, Bouskoura, Casablanca',
                'description' => 'PalmGolf Casablanca, au cœur du California Golf Resort à Bouskoura, propose un parcours 18 trous (par 71, 6 571 m) dessiné par Nelson & Haworth. Les green fees ne sont pas publiés : tarifs et réservation sur demande auprès du club.',
                'description_en' => 'PalmGolf Casablanca, at the heart of the California Golf Resort in Bouskoura, offers an 18-hole course (par 71, 6,571 m) designed by Nelson & Haworth. Green fees are not published: rates and bookings on request from the club.',
                'phone' => '+212 537 75 58 64',
                'email' => null,
                'logo_url' => '/golf-courses/palmgolf-casablanca-logo.png',
                'cover_url' => '/golf-courses/palmgolf-casablanca-cover.webp',
                'owner_id' => null,
                'status' => 'ACTIVE',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        $courseId = DB::table('golf_courses')
            ->where('club_id', $clubId)
            ->where('name', $this->courseName)
            ->value('id');

        if ($courseId === null) {
            DB::table('golf_courses')->insert([
                'club_id' => $clubId,
                'name' => $this->courseName,
                'description' => 'Parcours 18 trous (par 71, 6 571 m) du PalmGolf Casablanca, dans le California Golf Resort à Bouskoura. Green fees non publiés : tarifs sur demande auprès du club.',
                'location' => 'Casablanca',
                'price_per_player' => null,
                'price_weekend' => null,
                'green_fees' => json_encode([]),
                'extra_fees' => json_encode([
                    ['label' => 'Voiturette GPS', 'labelEn' => 'GPS cart', 'price' => null],
                    ['label' => 'Caddie', 'labelEn' => 'Caddie', 'price' => null],
                    ['label' => 'Location de clubs', 'labelEn' => 'Club rental', 'price' => null],
                    ['label' => 'Chariot', 'labelEn' => 'Trolley', 'price' => null],
                ]),
                'number_of_holes' => 18,
                'image' => '/golf-courses/palmgolf-casablanca-course.webp',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }

    public function down(): void
    {
        $clubId = DB::table('clubs')->where('name', $this->clubName)->value('id');

        if ($clubId === null) {
            return;
        }

        $courseId = DB::table('golf_courses')
            ->where('club_id', $clubId)
            ->where('name', $this->courseName)
            ->value('id');

        if ($courseId !== null && ! DB::table('reservations')->where('golf_course_id', $courseId)->exists()) {
            DB::table('golf_courses')->where('id', $courseId)->delete();
        }

        if (! DB::table('golf_courses')->where('club_id', $clubId)->exists()
            && ! DB::table('memberships')->where('club_id', $clubId)->exists()) {
            DB::table('clubs')->where('id', $clubId)->delete();
        }
    }
};
