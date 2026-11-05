<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /** Course-specific photograph, mapped by club name and course name. */
    private array $photos = [
        'Royal Golf Dar Es Salam' => [
            'Parcours Rouge' => '/golf-courses/royal-dar-es-salam-rouge.webp',
            'Parcours Bleu' => '/golf-courses/royal-dar-es-salam-bleu.webp',
            'Parcours Vert' => '/golf-courses/royal-dar-es-salam-vert.webp',
        ],
        'Royal Golf de Marrakech' => [
            'Ancien Parcours' => '/golf-courses/royal-marrakech-ancien-parcours.webp',
            'Parcours Menara' => '/golf-courses/royal-marrakech-menara.webp',
        ],
        'Royal Golf Anfa Mohammedia' => [
            'Parcours Anfa' => '/golf-courses/rgam-anfa.webp',
            'Parcours Mohammedia' => '/golf-courses/rgam-mohammedia.webp',
        ],
        'Golf du Palais Royal' => [
            'Parcours Royal' => '/golf-courses/palais-royal-royal.webp',
        ],
    ];

    public function up(): void
    {
        $this->assign($this->photos);
    }

    public function down(): void
    {
        $this->assign([
            'Royal Golf Dar Es Salam' => [
                'Parcours Rouge' => '/royal-golf-rabat-course.jpg',
                'Parcours Bleu' => '/royal-golf-rabat-course.jpg',
                'Parcours Vert' => '/royal-golf-rabat-course.jpg',
            ],
            'Royal Golf de Marrakech' => [
                'Ancien Parcours' => '/section1.png',
                'Parcours Menara' => '/section2.png',
            ],
            'Royal Golf Anfa Mohammedia' => [
                'Parcours Anfa' => '/section3.png',
                'Parcours Mohammedia' => '/section2.png',
            ],
            'Golf du Palais Royal' => [
                'Parcours Royal' => '/golf-palais-royal-cover.jpg',
            ],
        ]);
    }

    private function assign(array $map): void
    {
        foreach ($map as $clubName => $courses) {
            $clubId = DB::table('clubs')->where('name', $clubName)->value('id');

            if ($clubId === null) {
                continue;
            }

            foreach ($courses as $courseName => $image) {
                DB::table('golf_courses')
                    ->where('club_id', $clubId)
                    ->where('name', $courseName)
                    ->update(['image' => $image, 'updated_at' => now()]);
            }
        }
    }
};
