<?php

namespace Database\Seeders;

use App\Models\Club;
use App\Models\GolfCourse;
use App\Models\Membership;
use App\Models\MembershipRequest;
use App\Models\Notification;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\Reservation;
use App\Models\TimeSlot;
use App\Models\Tournament;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Users
        $admin = User::firstOrCreate(['email' => 'admin@teetime.com'], [
            'name' => 'Admin TeeTime',
            'first_name' => 'Admin',
            'last_name' => 'Executive',
            'password' => Hash::make('password123'),
            'role' => 'ADMIN',
            'status' => 'ACTIVE',
            'phone_number' => '+212600000001',
            'gender' => 'MALE',
            'bio' => 'Platform Administrator',
        ]);

        // APEX tournaments belong to this role, not to the platform ADMIN above.
        User::firstOrCreate(['email' => 'apexadmin@teetime.com'], [
            'name' => 'Admin APEX',
            'first_name' => 'APEX',
            'last_name' => 'Network',
            'password' => Hash::make('password123'),
            'role' => User::ROLE_ADMIN_APEX,
            'status' => 'ACTIVE',
            'phone_number' => '+212600000000',
            'gender' => 'MALE',
            'bio' => 'APEX Tournament Administrator',
        ]);

        $manager = User::firstOrCreate(['email' => 'manager@teetime.com'], [
            'name' => 'Karim Alami',
            'first_name' => 'Karim',
            'last_name' => 'Alami',
            'password' => Hash::make('password123'),
            'role' => 'MANAGER',
            'status' => 'ACTIVE',
            'phone_number' => '+212661000002',
            'gender' => 'MALE',
            'bio' => 'Club Director & PGA Professional',
        ]);

        $player = User::firstOrCreate(['email' => 'player@teetime.com'], [
            'name' => 'Youssef Bennani',
            'first_name' => 'Youssef',
            'last_name' => 'Bennani',
            'password' => Hash::make('password123'),
            'role' => 'PLAYER',
            'status' => 'ACTIVE',
            'phone_number' => '+212662000003',
            'gender' => 'MALE',
            'bio' => 'Golf enthusiast with handicap 12.4',
        ]);

        // 2. Clubs
        $club1 = Club::firstOrCreate(['name' => 'Royal Golf de Marrakech'], [
            'name_en' => 'Royal Golf Marrakech',
            'city' => 'Marrakech',
            'address' => 'Ancienne Route de Ouarzazate, BP 634, 40000 Marrakech',
            'description' => 'Un club légendaire au cœur de la palmeraie, fondé en 1920. Profitez de deux parcours d\'exception dans un cadre verdoyant.',
            'description_en' => 'A legendary club in the heart of the palm grove, founded in 1920. Enjoy two exceptional courses in a lush setting.',
            'phone' => '+212 524 40 98 28',
            'email' => 'contact@royalgolfmarrakech.com',
            'logo_url' => '/teetime-logo.png',
            'cover_url' => '/club 1.png',
            'owner_id' => $manager->id,
            'status' => 'ACTIVE',
        ]);

        $club2 = Club::firstOrCreate(['name' => 'Royal Golf Anfa Mohammedia'], [
            'name_en' => 'Royal Golf Anfa Mohammedia',
            'city' => 'Casablanca',
            'address' => 'Lice d’Anfa, Anfa supérieur, Casablanca 20250',
            'description' => "Un club urbain historique avec une vue imprenable sur l'océan Atlantique et un parcours technique.",
            'description_en' => 'A historic city club with stunning views over the Atlantic Ocean and a technical course.',
            'phone' => '+212 5 22 36 10 26',
            'email' => 'royal.golf.am@gmail.com',
            'logo_url' => '/teetime-logo.png',
            'cover_url' => '/club2.png',
            'owner_id' => null,
            'status' => 'ACTIVE',
        ]);

        $club3 = Club::firstOrCreate(['name' => 'Golf du Palais Royal'], [
            'name_en' => "Golf du Palais Royal d'Agadir",
            'city' => 'Agadir',
            'address' => 'Souss-Massa, Agadir',
            'description' => 'Un club de championnat d\'élite offrant un défi technique prestigieux et des vues côtières spectaculaires.',
            'description_en' => 'An elite championship club offering a prestigious technical challenge and spectacular coastal views.',
            'phone' => null,
            'email' => null,
            'logo_url' => '/golf-palais-royal-cover.jpg',
            'cover_url' => '/golf-palais-royal-cover.jpg',
            'owner_id' => null,
            'status' => 'ACTIVE',
        ]);

        $club4 = Club::firstOrCreate(['name' => 'Royal Golf Dar Es Salam'], [
            'name_en' => 'Royal Golf Dar Es Salam',
            'city' => 'Rabat',
            'address' => 'Avenue Mohammed VI km 9, route des Zaërs, Souissi, Rabat',
            'description' => 'Un parcours royal historique au cœur de la forêt de Souissi, alliant traditions marocaines et golf de haut niveau.',
            'description_en' => 'A historic royal course in the heart of the Souissi forest, combining Moroccan traditions with top-level golf.',
            'phone' => '+212 537 755 864',
            'email' => 'contact@royalgolfdaressalam.com',
            'logo_url' => '/royal-golf-rabat-logo.png',
            'cover_url' => '/royal-golf-rabat-cover.jpg',
            'owner_id' => null,
            'status' => 'ACTIVE',
        ]);

        $club5 = Club::firstOrCreate(['name' => 'PalmGolf Casablanca'], [
            'name_en' => 'PalmGolf Casablanca',
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
        ]);

        $club1->update([
            'name_en' => 'Royal Golf Marrakech',
            'description_en' => 'A legendary club in the heart of the palm grove, founded in 1920. Enjoy two exceptional courses in a lush setting.',
        ]);
        $club2->update([
            'name_en' => 'Royal Golf Anfa Mohammedia',
            'description_en' => 'A historic city club with stunning views over the Atlantic Ocean and a technical course.',
        ]);
        $club3->update([
            'logo_url' => '/golf-palais-royal-cover.jpg',
            'cover_url' => '/golf-palais-royal-cover.jpg',
            'name_en' => "Golf du Palais Royal d'Agadir",
            'description_en' => 'An elite championship club offering a prestigious technical challenge and spectacular coastal views.',
        ]);
        $club4->update([
            'logo_url' => '/royal-golf-rabat-logo.png',
            'cover_url' => '/royal-golf-rabat-cover.jpg',
            'name_en' => 'Royal Golf Dar Es Salam',
            'description_en' => 'A historic royal course in the heart of the Souissi forest, combining Moroccan traditions with top-level golf.',
        ]);
        $club5->update([
            'logo_url' => '/golf-courses/palmgolf-casablanca-logo.png',
            'cover_url' => '/golf-courses/palmgolf-casablanca-cover.webp',
            'name_en' => 'PalmGolf Casablanca',
            'description_en' => 'PalmGolf Casablanca, at the heart of the California Golf Resort in Bouskoura, offers an 18-hole course (par 71, 6,571 m) designed by Nelson & Haworth. Green fees are not published: rates and bookings on request from the club.',
        ]);

        // 3. Courses — verified green fees (official club tariff pages)
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

        $c1 = GolfCourse::firstOrCreate(['name' => 'Ancien Parcours', 'club_id' => $club1->id], [
            'description' => 'Le parcours historique 18 trous du Royal Golf de Marrakech, fondé en 1920, bordé de cyprès et d’oliviers centenaires.',
            'location' => 'Marrakech',
            'number_of_holes' => 18,
            'image' => '/golf-courses/royal-marrakech-ancien-parcours.webp',
            'is_active' => true,
        ]);
        $c1->update([
            'image' => '/golf-courses/royal-marrakech-ancien-parcours.webp',
            'price_per_player' => 1200,
            'price_weekend' => null,
            'green_fees' => [
                ['label' => '18 trous', 'labelEn' => '18 holes', 'holes' => 18, 'price' => 1200],
            ],
            'extra_fees' => $marrakechExtras,
        ]);

        $c2 = GolfCourse::firstOrCreate(['name' => 'Parcours Menara', 'club_id' => $club1->id], [
            'description' => 'Le parcours 9 trous du Royal Golf de Marrakech, moderne et technique, idéal pour le jeu court.',
            'location' => 'Marrakech',
            'number_of_holes' => 9,
            'image' => '/golf-courses/royal-marrakech-menara.webp',
            'is_active' => true,
        ]);
        $c2->update([
            'image' => '/golf-courses/royal-marrakech-menara.webp',
            'price_per_player' => 700,
            'price_weekend' => null,
            'green_fees' => [
                ['label' => '9 trous', 'labelEn' => '9 holes', 'holes' => 9, 'price' => 700],
            ],
            'extra_fees' => $marrakechExtras,
        ]);

        $c3 = GolfCourse::firstOrCreate(['name' => 'Parcours Anfa', 'club_id' => $club2->id], [
            'description' => 'Le parcours 9 trous du site d’Anfa, au cœur de Casablanca.',
            'location' => 'Casablanca',
            'number_of_holes' => 9,
            'image' => '/golf-courses/rgam-anfa.webp',
            'is_active' => true,
        ]);
        $c3->update([
            'image' => '/golf-courses/rgam-anfa.webp',
            'price_per_player' => 400,
            'price_weekend' => 500,
            'green_fees' => [
                ['label' => '9 trous — Licencié', 'labelEn' => '9 holes — Licensed', 'holes' => 9, 'price' => 250, 'weekendPrice' => 300],
                ['label' => '9 trous — Non licencié', 'labelEn' => '9 holes — Non-licensed', 'holes' => 9, 'price' => 400, 'weekendPrice' => 500],
            ],
            'extra_fees' => [
                ['label' => 'Voiturette — 9 trous', 'labelEn' => 'Cart — 9 holes', 'price' => 250],
            ],
        ]);

        $c6 = GolfCourse::firstOrCreate(['name' => 'Parcours Mohammedia', 'club_id' => $club2->id], [
            'description' => 'Le parcours 18 trous (par 72) du site de Mohammedia, le long de l’océan Atlantique.',
            'location' => 'Mohammedia',
            'price_per_player' => 600,
            'price_weekend' => 700,
            'number_of_holes' => 18,
            'image' => '/golf-courses/rgam-mohammedia.webp',
            'is_active' => true,
            'green_fees' => [
                ['label' => '18 trous — Licencié', 'labelEn' => '18 holes — Licensed', 'holes' => 18, 'price' => 400, 'weekendPrice' => 500],
                ['label' => '18 trous — Non licencié', 'labelEn' => '18 holes — Non-licensed', 'holes' => 18, 'price' => 600, 'weekendPrice' => 700],
            ],
            'extra_fees' => [
                ['label' => 'Voiturette — 18 trous', 'labelEn' => 'Cart — 18 holes', 'price' => 350],
            ],
        ]);
        $c6->update(['image' => '/golf-courses/rgam-mohammedia.webp']);

        $c4 = GolfCourse::firstOrCreate(['name' => 'Parcours Rouge', 'club_id' => $club4->id], [
            'description' => 'Le parcours signature 18 trous du Royal Golf Dar Es Salam, tracé par Robert Trent Jones entre pins, chênes-lièges et eucalyptus.',
            'location' => 'Rabat',
            'number_of_holes' => 18,
            'image' => '/golf-courses/royal-dar-es-salam-rouge.webp',
            'is_active' => true,
        ]);
        $c4->update([
            'image' => '/golf-courses/royal-dar-es-salam-rouge.webp',
            'price_per_player' => 1200,
            'price_weekend' => null,
            'green_fees' => [
                ['label' => '18 trous — Public', 'labelEn' => '18 holes — Public', 'holes' => 18, 'price' => 1200],
                ['label' => '18 trous — Fédéral', 'labelEn' => '18 holes — Federation member', 'holes' => 18, 'price' => 900],
                ['label' => '9 trous — Public', 'labelEn' => '9 holes — Public', 'holes' => 9, 'price' => 650],
                ['label' => '9 trous — Fédéral', 'labelEn' => '9 holes — Federation member', 'holes' => 9, 'price' => 490],
            ],
            'extra_fees' => $rgdsExtras,
        ]);

        GolfCourse::firstOrCreate(['name' => 'Parcours Bleu', 'club_id' => $club4->id], [
            'description' => 'Le deuxième parcours 18 trous du Royal Golf Dar Es Salam, plus court et technique, au cœur de la forêt de Souissi.',
            'location' => 'Rabat',
            'price_per_player' => 850,
            'price_weekend' => null,
            'number_of_holes' => 18,
            'image' => '/golf-courses/royal-dar-es-salam-bleu.webp',
            'is_active' => true,
            'green_fees' => [
                ['label' => '18 trous — Public', 'labelEn' => '18 holes — Public', 'holes' => 18, 'price' => 850],
                ['label' => '18 trous — Fédéral', 'labelEn' => '18 holes — Federation member', 'holes' => 18, 'price' => 640],
                ['label' => '9 trous — Public', 'labelEn' => '9 holes — Public', 'holes' => 9, 'price' => 450],
                ['label' => '9 trous — Fédéral', 'labelEn' => '9 holes — Federation member', 'holes' => 9, 'price' => 340],
            ],
            'extra_fees' => $rgdsExtras,
        ]);

        GolfCourse::firstOrCreate(['name' => 'Parcours Vert', 'club_id' => $club4->id], [
            'description' => 'Un parcours 9 trous compact, idéal pour une partie rapide ou une séance d’entraînement.',
            'location' => 'Rabat',
            'price_per_player' => 300,
            'price_weekend' => null,
            'number_of_holes' => 9,
            'image' => '/golf-courses/royal-dar-es-salam-vert.webp',
            'is_active' => true,
            'green_fees' => [
                ['label' => '9 trous — Public', 'labelEn' => '9 holes — Public', 'holes' => 9, 'price' => 300],
                ['label' => '9 trous — Fédéral', 'labelEn' => '9 holes — Federation member', 'holes' => 9, 'price' => 250],
            ],
            'extra_fees' => $rgdsExtras,
        ]);

        $c5 = GolfCourse::firstOrCreate(['name' => 'Parcours Royal', 'club_id' => $club3->id], [
            'description' => 'Parcours 18 trous du Golf du Palais Royal d’Agadir. Club privé : les green fees ne sont pas publiés, réservation sur demande.',
            'location' => 'Agadir',
            'number_of_holes' => 18,
            'image' => '/golf-courses/palais-royal-royal.webp',
            'is_active' => true,
        ]);
        $c5->update([
            'image' => '/golf-courses/palais-royal-royal.webp',
            'price_per_player' => null,
            'price_weekend' => null,
            'green_fees' => [],
            'extra_fees' => [],
        ]);

        $c7 = GolfCourse::firstOrCreate(['name' => 'Parcours PalmGolf', 'club_id' => $club5->id], [
            'description' => 'Parcours 18 trous (par 71, 6 571 m) du PalmGolf Casablanca, dans le California Golf Resort à Bouskoura. Green fees non publiés : tarifs sur demande auprès du club.',
            'location' => 'Casablanca',
            'number_of_holes' => 18,
            'image' => '/golf-courses/palmgolf-casablanca-course.webp',
            'is_active' => true,
        ]);
        $c7->update([
            'image' => '/golf-courses/palmgolf-casablanca-course.webp',
            'price_per_player' => null,
            'price_weekend' => null,
            'green_fees' => [],
            'extra_fees' => [
                ['label' => 'Voiturette GPS', 'labelEn' => 'GPS cart', 'price' => null],
                ['label' => 'Caddie', 'labelEn' => 'Caddie', 'price' => null],
                ['label' => 'Location de clubs', 'labelEn' => 'Club rental', 'price' => null],
                ['label' => 'Chariot', 'labelEn' => 'Trolley', 'price' => null],
            ],
        ]);

        // 4. Weekly maintenance closures and the published tee-time sheet
        //
        // Values follow Carbon's dayOfWeekIso (1 = Monday … 7 = Sunday). A closed
        // weekday is a green-keeping day: no date is offered to players at all.
        // PalmGolf closes two days a week, which is why it exposes fewer dates
        // than the Marrakech or Anfa clubs.
        $closedWeekdays = [
            'Ancien Parcours' => [3],
            'Parcours Menara' => [3],
            'Parcours Anfa' => [1],
            'Parcours Mohammedia' => [1],
            'Parcours Rouge' => [1],
            'Parcours Bleu' => [2],
            'Parcours Vert' => [3],
            'Parcours Royal' => [2],
            'Parcours PalmGolf' => [1, 2],
        ];

        $windowStart = GolfCourse::bookingWindowStart();
        $windowEnd = GolfCourse::bookingWindowEnd();

        // Rolls from older runs sit before tomorrow or beyond the window; a row a
        // player has booked is never removed.
        TimeSlot::where(function ($q) use ($windowStart, $windowEnd) {
            $q->where('start_time', '<', $windowStart)->orWhere('start_time', '>', $windowEnd);
        })
            ->whereDoesntHave('reservations')
            ->get()
            ->each->delete();

        $slotsByCourse = [];

        foreach (GolfCourse::where('is_active', true)->orderBy('id')->get() as $course) {
            $course->update(['closed_weekdays' => $closedWeekdays[$course->name] ?? []]);

            foreach ($course->openDatesInWindow() as $dateStr) {
                foreach ([8, 12, 16] as $h) {
                    $start = Carbon::parse($dateStr)->setHour($h)->setMinute(0)->setSecond(0);
                    $end = $start->copy()->addHours(2);

                    // firstOrCreate keeps a manager's CLOSED or fully booked slot as stored.
                    $slot = TimeSlot::firstOrCreate([
                        'golf_course_id' => $course->id,
                        'start_time' => $start,
                        'end_time' => $end,
                    ], [
                        'status' => 'OPEN',
                        'max_players' => 4,
                    ]);

                    $createdSlots[] = $slot;
                    $slotsByCourse[$course->id][] = $slot;
                }
            }
        }

        // 5. Memberships — verified tariffs published by Royal Golf Anfa Mohammedia (Anfa site, Casablanca)
        // Source: https://rgam.ma/devenir-membre (annual dues include the federal licence).
        $anfa = $club2;

        $mIndividual = Membership::updateOrCreate(['title' => 'Cotisation Individuelle', 'club_id' => $anfa->id], [
            'title_en' => 'Individual Membership',
            'description' => "Royal Golf Anfa Mohammedia (site d'Anfa, Casablanca) : cotisation annuelle de 10 750 DHS, licence fédérale incluse. Droits d'entrée : 60 000 DHS (frais unique).",
            'description_en' => 'Royal Golf Anfa Mohammedia (Anfa course, Casablanca): annual subscription of 10,750 DHS, federal licence included. Entry fee: 60,000 DHS (one-time).',
            'price' => 10750,
            'status' => 'ACTIVE',
            'benefits' => ['Licence fédérale incluse'],
            'benefits_en' => ['Federal licence included'],
        ]);

        Membership::updateOrCreate(['title' => 'Cotisation Couple', 'club_id' => $anfa->id], [
            'title_en' => 'Couple Membership',
            'description' => "Royal Golf Anfa Mohammedia (site d'Anfa, Casablanca) : cotisation annuelle de 13 810 DHS, licence fédérale incluse. Droits d'entrée : 80 000 DHS (frais unique).",
            'description_en' => 'Royal Golf Anfa Mohammedia (Anfa course, Casablanca): annual subscription of 13,810 DHS, federal licence included. Entry fee: 80,000 DHS (one-time).',
            'price' => 13810,
            'status' => 'ACTIVE',
            'benefits' => ['Licence fédérale incluse'],
            'benefits_en' => ['Federal licence included'],
        ]);

        Membership::updateOrCreate(['title' => 'Cotisation Junior (-18 ans)', 'club_id' => $anfa->id], [
            'title_en' => 'Junior Membership (under 18)',
            'description' => "Royal Golf Anfa Mohammedia (site d'Anfa, Casablanca) : cotisation annuelle de 1 600 DHS, licence fédérale incluse.",
            'description_en' => 'Royal Golf Anfa Mohammedia (Anfa course, Casablanca): annual subscription of 1,600 DHS, federal licence included.',
            'price' => 1600,
            'status' => 'ACTIVE',
            'benefits' => ['Licence fédérale incluse'],
            'benefits_en' => ['Federal licence included'],
        ]);

        Membership::updateOrCreate(['title' => 'Cotisation Étudiant (18-25 ans)', 'club_id' => $anfa->id], [
            'title_en' => 'Student Membership (18-25)',
            'description' => "Royal Golf Anfa Mohammedia (site d'Anfa, Casablanca) : cotisation annuelle de 3 500 DHS, licence fédérale incluse. Droits d'entrée : 20 000 DHS (frais unique).",
            'description_en' => 'Royal Golf Anfa Mohammedia (Anfa course, Casablanca): annual subscription of 3,500 DHS, federal licence included. Entry fee: 20,000 DHS (one-time).',
            'price' => 3500,
            'status' => 'ACTIVE',
            'benefits' => ['Licence fédérale incluse'],
            'benefits_en' => ['Federal licence included'],
        ]);

        // Legacy fabricated offers are archived, never deleted, because historical requests reference them.
        Membership::whereIn('title', [
            'Abonnement Annuel Or',
            'Abonnement Semaine',
            'Abonnement Atlantique',
            'Abonnement Urbain',
            'Abonnement Prestige',
            'Abonnement Souissi',
            'Abonnement Découverte',
        ])->update(['status' => 'SUSPENDED']);

        // 6. Membership Request (Player accepted for Club 1)
        MembershipRequest::firstOrCreate([
            'user_id' => $player->id,
            'membership_id' => $mIndividual->id,
        ], [
            'status' => 'ACCEPTED',
        ]);

        // 7. Reservations for Player — on the first published tee time of the manager's own club
        $firstMarrakechSlot = $slotsByCourse[$c1->id][0] ?? null;

        if ($firstMarrakechSlot) {
            Reservation::firstOrCreate([
                'user_id' => $player->id,
                'golf_course_id' => $firstMarrakechSlot->golf_course_id,
                'time_slot_id' => $firstMarrakechSlot->id,
            ], [
                'reservation_date' => $firstMarrakechSlot->start_time->toDateString(),
                'number_of_players' => 2,
                'status' => 'CONFIRMED',
                'notes' => 'Départ matinal, deux joueurs.',
            ]);
        }

        // 8. Boutique products
        //
        // Every item below is a real, currently listed brand product. The price is
        // the selling price verified on the brand's official store or an authorised
        // retailer on 2026-10-30, converted to MAD at 1 USD = 9.846987 MAD
        // (open.er-api.com) and rounded to a whole dirham. The verification date and
        // the original USD price are kept in each description.
        $products = [
            ['Driver TaylorMade Qi4D LS', 'CLUBS', 6400, '/products/taylormade-qi4d-ls-driver.jpg', 'Driver TaylorMade Qi4D LS 9° : tête carbone à centre de gravité avancé, bague de réglage HOT LAUNCH et shaft graphite. Prix vérifié le 30/10/2026 : 649,99 USD sur taylormadegolf.com (Qi4D-LS-Driver/DW-TC438).'],
            ['Série de fers TaylorMade P·790', 'CLUBS', 11816, '/products/taylormade-p790-irons.jpg', 'Série de fers forgés creux TaylorMade P·790 en acier doux, insert Speed Pocket et finition chromée satinée. Prix vérifié le 30/10/2026 : 1 199,99 USD (tarif baissé de 1 399,99 USD) sur taylormadegolf.com (DW-TC635).'],
            ['Putter TaylorMade Spider ZT Max', 'CLUBS', 4431, '/products/taylormade-spider-zt-max.jpg', 'Putter mallet TaylorMade Spider ZT Max à très haut MOI, ligne d’alignement Pure Roll et semelle acier. Prix vérifié le 30/10/2026 : 449,99 USD sur taylormadegolf.com (Spider-ZT-Max/DW-TE630).'],
            ['Wedge Titleist Vokey SM11', 'CLUBS', 1969, '/products/titleist-vokey-sm11-wedge.jpg', 'Wedge Titleist Vokey Design SM11 en finition Tour Chrome, rainures fraisées et mouture S. Prix vérifié le 30/10/2026 : 199,99 USD sur globalgolf.com (produit 1088949). Les photos officielles sont communes à tous les lofts de la gamme SM11.'],
            ['Balles TaylorMade TP5x (Dizaine)', 'BALLS', 571, '/products/taylormade-tp5x-balls.jpg', 'Balles cinq pièces TaylorMade TP5x en urethane, vol tendu et toucher doux autour du green, coloris blanc. Prix vérifié le 30/10/2026 : 57,99 USD la douzaine sur taylormadegolf.com (TP5x-Golf-Balls/DW-TE923).'],
            ['Gant TaylorMade Tour Preferred Cuir', 'GLOVES', 276, '/products/taylormade-tour-preferred-glove.jpg', 'Gant en cuir cabré TaylorMade Tour Preferred, empiècements perforés et fermeture Velcro au poignet. Prix vérifié le 30/10/2026 : 27,99 USD sur taylormadegolf.com (DW-N38558).'],
            ['Gant TaylorMade Stratus Tech', 'GLOVES', 128, '/products/taylormade-stratus-tech-glove.jpg', 'Gant synthétique TaylorMade Stratus Tech en Hypertec, léger et résistant, idéal pour l’entraînement. Prix vérifié le 30/10/2026 : 12,99 USD sur taylormadegolf.com (Stratus-Tech-Golf-Glove/DW-UF138).'],
            ['Gant TaylorMade Kalea Femme', 'GLOVES', 157, '/products/taylormade-kalea-glove.jpg', 'Gant femme TaylorMade Kalea en cuir souple, coupe ajustée et dos respirant pour un confort durable. Prix vérifié le 30/10/2026 : 15,99 USD sur taylormadegolf.com (DW-M23469).'],
            ['Gant FootJoy Pure Touch Limited', 'GLOVES', 393, '/products/footjoy-pure-touch-glove.jpg', 'Gant FootJoy Pure Touch Limited en cuir cabré, paume ultra-fine pour un toucher et une sensibilité maximaux. Prix vérifié le 30/10/2026 : 39,95 USD sur globalgolf.com (produit 1034890).'],
            ['Gant FootJoy WeatherSof', 'GLOVES', 128, '/products/footjoy-weathersof-glove.jpg', 'Gant FootJoy WeatherSof en cuir synthétique, confort durable et excellente prise par temps chaud ou humide. Prix vérifié le 30/10/2026 : 12,95 USD sur globalgolf.com (produit 1080164).'],
            ['Pantalon TaylorMade Greg Norman ML75', 'TROUSERS', 591, '/products/gregnorman-ml75-pants-bamboo.jpg', 'Pantalon Greg Norman ML75 Micro Lux en tissu stretch déperlant, coupe slim et poches zippées, coloris Bamboo. Prix vérifié le 30/10/2026 : 59,99 USD sur globalgolf.com (produit 1047537).'],
            ['Pantalon Adidas Ultimate365 Tapered', 'TROUSERS', 886, '/products/adidas-ultimate365-tapered-navy.jpg', 'Pantalon Adidas Ultimate365 coupe fuselée en tricot stretch à séchage rapide, protection UV et taille ajustée, coloris Collegiate Navy. Prix vérifié le 30/10/2026 : 90,00 USD sur globalgolf.com (produit 1073795).'],
            ['Pantalon Under Armour Drive 5 Poches', 'TROUSERS', 837, '/products/underarmour-drive-pants-black.jpg', 'Pantalon Under Armour Drive cinq poches en tissu Ultra Stretch Soft, coupe décontractée et ceinture confort, coloris noir. Prix vérifié le 30/10/2026 : 85,00 USD sur globalgolf.com (produit 1064410).'],
            ['Short Adidas ULT365 Plissé Noir', 'TROUSERS', 369, '/products/adidas-ult365-shorts-black.jpg', 'Short plissé Adidas Ultimate365 en tricot stretch recyclé, quatre poches et ourlet net, coloris noir. Prix vérifié le 30/10/2026 : 37,48 USD (tarif promotionnel) sur globalgolf.com (produit 1080937).'],
            ['Pantalon pluie Adidas U365 ClimaProof+', 'TROUSERS', 960, '/products/adidas-climaproof-rain-pant-grey.jpg', 'Pantalon imperméable Adidas Ultimate365 Tour ClimaProof+ à coutures étanchées et bas zippés, coloris Gris. Prix vérifié le 30/10/2026 : 97,48 USD sur globalgolf.com (produit 1086322).'],
            ['Polo Greg Norman Freedom Micro Piqué', 'APPAREL', 345, '/products/gregnorman-freedom-polo-navy.jpg', 'Polo Greg Norman Freedom en micro-piqué respirant à col montant autoportant, coloris marine. Prix vérifié le 30/10/2026 : 34,99 USD sur globalgolf.com (produit 1055478).'],
            ['Polo Ben Hogan Solid Ottoman Blanc', 'APPAREL', 345, '/products/benhogan-ottoman-polo-white.jpg', 'Polo Ben Hogan en maille ottomane texturée, col tricoté et coupe classique, coloris blanc éclatant. Prix vérifié le 30/10/2026 : 34,99 USD sur globalgolf.com (produit 1072159).'],
            ['Polo FootJoy MicroFeeder Stripe Marine', 'APPAREL', 837, '/products/footjoy-microfeeder-polo-navy.jpg', 'Polo FootJoy TOUR LOGO MicroFeeder en fil Lisle à fines rayures et col self-collar, douceur et fraîcheur durables. Prix vérifié le 30/10/2026 : 85,00 USD sur globalgolf.com (produit 1074344).'],
            ['Veste J.Lindeberg Heath Coupe-vent', 'APPAREL', 1152, '/products/jlindeberg-heath-wind-olive.jpg', 'Veste coupe-vent J.Lindeberg Heath légère et déperlante, col montant, poches zippées et logo brodé au bras, coloris Oil Green. Prix vérifié le 30/10/2026 : 117,00 USD sur globalgolf.com (produit 1083906).'],
            ['Chaussures FootJoy Pro/SL Spikeless', 'SHOES', 1821, '/products/footjoy-prosl-shoe.jpg', 'Chaussures FootJoy Pro/SL sans crampons, tige pleine fleur et semelle à adhérence polyvalente, coloris blanc et gris. Prix vérifié le 30/10/2026 : 184,95 USD sur globalgolf.com (produit 1088716).'],
            ['Chaussures FootJoy Premiere Packard', 'SHOES', 2461, '/products/footjoy-packard-shoe.jpg', 'Chaussures FootJoy Premiere Series Packard en cuir pleine fleur à semelle spikeless, style intemporel du club au parcours, coloris blanc. Prix vérifié le 30/10/2026 : 249,95 USD sur globalgolf.com (produit 1088713).'],
            ['Chaussures Adidas Tour360 24 Boost', 'SHOES', 1969, '/products/adidas-tour360-24-boost-shoe.jpg', 'Chaussures à crampons vissés Adidas Tour360 24 Boost, amorti Boost et tige imperméable, coloris Core Black. Prix vérifié le 30/10/2026 : 199,99 USD sur globalgolf.com (produit 1072802).'],
            ['Chaussures FootJoy Quantum Femme', 'SHOES', 1673, '/products/footjoy-quantum-ladies-shoe.jpg', 'Chaussures spikeless FootJoy Quantum pour femme, tige respirante et semelle d’adhérence, coloris blanc et rose pâle. Prix vérifié le 30/10/2026 : 169,95 USD sur globalgolf.com (produit 1095183).'],
            ['Chaussures Junior FootJoy FJ Flex XP', 'SHOES', 590, '/products/footjoy-flexxp-jr-shoe.jpg', 'Chaussures de golf junior FootJoy FJ Flex XP spikeless, fermeture pratique et semelle souple, coloris bleu (fin de série). Prix vérifié le 30/10/2026 : 59,87 USD sur globalgolf.com (produit 1056230).'],
            ['Sac Titleist Mid Size Tour Staff', 'BAGS', 3939, '/products/titleist-mid-size-tour-staff.jpg', 'Sac de parcours Titleist Mid Size Tour Staff en cuir synthétique, sept diviseurs pleine longueur et grande poche supérieure, noir et blanc. Prix vérifié le 30/10/2026 : 399,99 USD sur globalgolf.com (produit 1065583).'],
            ['Sac Callaway Par 3 Trépied', 'BAGS', 1969, '/products/callaway-par3-stand.jpg', 'Sac trépied Callaway Par 3 léger à quatre diviseurs, bretelles rembourrées et support intégré, coloris blanc et marine. Prix vérifié le 30/10/2026 : 199,99 USD sur globalgolf.com (produit 1071682).'],
            ['Sac Titleist Cart 15', 'BAGS', 3151, '/products/titleist-cart-15.jpg', 'Sac chariot Titleist Cart 15 à neuf diviseurs, base stable et poches zippées généreuses, coloris noir. Prix vérifié le 30/10/2026 : 319,99 USD sur globalgolf.com (produit 1075386).'],
            ['Sac de voyage PING Rolling Cover', 'BAGS', 3683, '/products/ping-rolling-cover.jpg', 'Sac de voyage à roulettes PING Rolling Cover, coque renforcée, poignée télescopique et protection rembourrée pour les clubs. Prix vérifié le 30/10/2026 : 374,00 USD sur globalgolf.com (produit 1050854).'],
            ['Sac à chaussures TaylorMade Players', 'BAGS', 788, '/products/taylormade-players-shoe-bag.jpg', 'Sac à chaussures TaylorMade Players avec compartiment ventilé et bandoulière réglable, à emporter au golf comme en voyage, coloris noir. Prix vérifié le 30/10/2026 : 79,99 USD sur taylormadegolf.com (Players-Shoe-Bag/DW-UF073).'],
            ['Télémètre Bushnell Tour V7 Shift', 'ACCESSORIES', 3939, '/products/bushnell-tour-v7-shift.png', 'Télémètre Bushnell Tour V7 Shift : grossissement 6x, portée 5-1 300 yards, PinSeeker avec Visual JOLT et compensation de pente commutable. Prix vérifié le 30/10/2026 : 399,99 USD sur bushnellgolf.com.'],
            ['Parapluie Callaway Tour Authentic 68"', 'ACCESSORIES', 935, '/products/callaway-tour-authentic-umbrella.png', 'Parapluie Callaway Tour Authentic double canopée de 68 pouces, ouverture automatique et résistance au vent, coloris noir. Prix vérifié le 30/10/2026 : 95,00 USD sur callawaygolf.com.'],
            ['Tees TaylorMade Bois (Pack de 100)', 'ACCESSORIES', 98, '/products/taylormade-tees-100pack.jpg', 'Tees en bois TaylorMade de 2¾ pouces, pointe fine pour un départ propre, livrés en pack de cent. Prix vérifié le 30/10/2026 : 9,99 USD sur taylormadegolf.com (100-Pack-of-Tees/B1162501).'],
            ['Serviette Callaway Odyssey Microfibre', 'ACCESSORIES', 197, '/products/callaway-odyssey-towel.png', 'Serviette microfibre Callaway ODYSSEY très absorbante avec boucle d’attache pour le sac, format généreux. Prix vérifié le 30/10/2026 : 20,00 USD sur callawaygolf.com.'],
            ['Outil de pitch Callaway Izzo 4-en-1', 'ACCESSORIES', 148, '/products/callaway-izzo-divot-repair-kit.png', 'Kit Callaway Izzo 4-en-1 : outil de réparation de green, marqueur de balle aimanté, dévisse-pitch et support, en acier inoxydable. Prix vérifié le 30/10/2026 : 14,99 USD sur callawaygolf.com.'],
            ['Ceinture PING Tour Cuir', 'ACCESSORIES', 1960, '/products/ping-tour-belt.png', 'Ceinture PING Tour en cuir pleine fleur avec boucle nickel brossée et passant gravé PING, coloris noir. Prix vérifié le 30/10/2026 : 199,00 USD sur ping.com.'],
            ['Bouteille isotherme TaylorMade Sports', 'ACCESSORIES', 148, '/products/taylormade-sports-bottle.jpg', 'Bouteille isotherme TaylorMade en acier inoxydable à double paroi, garde les boissons fraîches durant toute la partie et s’accroche au sac. Prix vérifié le 30/10/2026 : 14,99 USD sur taylormadegolf.com (Sports-Bottle/DW-ANV17).'],
            ['Protège-bois TaylorMade Qi10', 'ACCESSORIES', 148, '/products/taylormade-qi10-headcover.jpg', 'Protège-bois TaylorMade Qi10 en maille tricotée avec fermeture aimantée et broderie Qi10, protège le bois de parcours. Prix vérifié le 30/10/2026 : 14,99 USD sur globalgolf.com (produit 1080366).'],

            // Caps — authentic brand caps; each has its official front and back product
            // photo.
            ['Casquette Titleist Tour Performance', 'CAPS', 443, '/products/titleist-tour-performance.png', 'Casquette Titleist Tour Performance : tissu technique léger, panneau avant structuré et ajustement réglable. Prix vérifié le 30/10/2026 : 45,00 USD sur titleist.com (25THATP).'],
            ['Casquette Callaway Tour Authentic Performance Pro LW', 'CAPS', 394, '/products/callaway-ta-performance-pro-lw.png', 'Casquette Callaway Tour Authentic Performance Pro LW : construction légère non structurée, profil bas et tissu à séchage rapide. Prix vérifié le 30/10/2026 : 39,99 USD sur callawaygolf.com.'],
            ['Casquette TaylorMade Radar Performance', 'CAPS', 394, '/products/taylormade-radar-performance.jpg', 'Casquette TaylorMade Radar Performance : design structuré classique, tissu technique respirant et fermeture réglable. Prix vérifié le 30/10/2026 : 39,99 USD sur taylormadegolf.com (DW-UF110).'],
            ['Casquette TaylorMade Spider Radar', 'CAPS', 394, '/products/taylormade-spider-radar.jpg', 'Casquette TaylorMade Spider Radar : panneau avant structuré, broderie Spider bleue et sangle de réglage à l’arrière. Prix vérifié le 30/10/2026 : 39,99 USD sur taylormadegolf.com (DW-UF439).'],
            ['Casquette Callaway Tour Authentic Performance Pro Charcoal', 'CAPS', 394, '/products/callaway-ta-performance-pro-charcoal.jpg', 'Casquette Callaway Tour Authentic Performance Pro en tissu chiné charbon, broderie Callaway à l’avant et logo ODYSSEY à l’arrière. Prix vérifié le 30/10/2026 : 39,99 USD sur callawaygolf.com.'],
        ];

        foreach ($products as [$name, $category, $price, $image, $description]) {
            Product::updateOrCreate(['name' => $name], [
                'category' => $category,
                'price' => $price,
                'image_url' => $image,
                'description' => $description,
                'is_active' => true,
            ]);
        }

        // 8a. Retire the fictional products that the verified brand catalogue above
        // replaces. Listed explicitly so that products created from the admin
        // dashboard are never touched.
        $retiredProducts = [
            'Driver Titanium LS', 'Série de fers Forgés Pro', 'Putter Mallet Precision', 'Wedge de sable 56°',
            'Balles de golf Pro Tour (Pack de 12)', 'Gant de golf cuir Premium', 'Polo Golf Club Marine',
            'Casquette Fairway Verte', 'Sac de golf Executive', 'Télémètre Laser Pro', 'Parapluie de golf Storm',
            'Chaussures de golf Spikeless', 'Tees de golf Bois (Pack de 50)', 'Serviette de golf Microfibre',
            'Pantalon Golf Classic Beige', 'Pantalon Golf Slim Marine', 'Pantalon Golf Technique Noir',
            'Short Golf Plissé Blanc', 'Pantalon Golf Imperméable Gris', 'Chaussures Golf Classic Cuir Blanc',
            'Chaussures Golf Tour Noir', 'Chaussures Golf Femme Rose', 'Chaussures Golf Junior Bleu',
            'Gant de golf Cuir Blanc', 'Gant de golf Synthétique Noir', 'Gant de golf Cuir Rouge',
            'Gant de golf Cuir Marine', 'Sac de golf Trépied Léger', 'Sac de golf Chariot Pro',
            'Sac de voyage de golf à roulettes', 'Sac à chaussures ventilé', 'Protège-têtes de clubs (Pack de 4)',
            'Outil de réparation de pitch', 'Ceinture de golf cuir', 'Bouteille isotherme Teetime',
            'Polo Golf Blanc Classique', 'Polo Golf Rayé Marine', 'Veste Coupe-vent Golf Olive',
        ];

        Product::whereIn('name', $retiredProducts)->delete();

        // 8b. Alternate hover views: the brand's own second product photo for the
        // exact same item — back view for caps, trousers, shirts, gloves and bags,
        // top view for shoes, opposite angle for clubs and accessories.
        $hoverImages = [
            'Driver TaylorMade Qi4D LS' => '/products/taylormade-qi4d-ls-driver-alt.jpg',
            'Série de fers TaylorMade P·790' => '/products/taylormade-p790-irons-alt.jpg',
            'Putter TaylorMade Spider ZT Max' => '/products/taylormade-spider-zt-max-alt.jpg',
            'Wedge Titleist Vokey SM11' => '/products/titleist-vokey-sm11-wedge-face.jpg',
            'Balles TaylorMade TP5x (Dizaine)' => '/products/taylormade-tp5x-balls-alt.jpg',

            'Gant TaylorMade Tour Preferred Cuir' => '/products/taylormade-tour-preferred-glove-alt.jpg',
            'Gant FootJoy Pure Touch Limited' => '/products/footjoy-pure-touch-glove-back.jpg',

            'Pantalon TaylorMade Greg Norman ML75' => '/products/gregnorman-ml75-pants-bamboo-back.jpg',
            'Pantalon Adidas Ultimate365 Tapered' => '/products/adidas-ultimate365-tapered-navy-back.jpg',
            'Pantalon Under Armour Drive 5 Poches' => '/products/underarmour-drive-pants-black-back.jpg',
            'Short Adidas ULT365 Plissé Noir' => '/products/adidas-ult365-shorts-black-back.jpg',

            'Polo Greg Norman Freedom Micro Piqué' => '/products/gregnorman-freedom-polo-navy-back.jpg',
            'Polo Ben Hogan Solid Ottoman Blanc' => '/products/benhogan-ottoman-polo-white-back.jpg',
            'Polo FootJoy MicroFeeder Stripe Marine' => '/products/footjoy-microfeeder-polo-navy-back.jpg',

            'Chaussures FootJoy Pro/SL Spikeless' => '/products/footjoy-prosl-shoe-top.jpg',
            'Chaussures FootJoy Premiere Packard' => '/products/footjoy-packard-shoe-top.jpg',
            'Chaussures Adidas Tour360 24 Boost' => '/products/adidas-tour360-24-boost-shoe-top.jpg',
            'Chaussures FootJoy Quantum Femme' => '/products/footjoy-quantum-ladies-shoe-top.jpg',
            'Chaussures Junior FootJoy FJ Flex XP' => '/products/footjoy-flexxp-jr-shoe-top.jpg',

            'Sac Titleist Mid Size Tour Staff' => '/products/titleist-mid-size-tour-staff-back.jpg',
            'Sac Callaway Par 3 Trépied' => '/products/callaway-par3-stand-back.jpg',
            'Sac Titleist Cart 15' => '/products/titleist-cart-15-back.jpg',
            'Sac de voyage PING Rolling Cover' => '/products/ping-rolling-cover-back.jpg',
            'Sac à chaussures TaylorMade Players' => '/products/taylormade-players-shoe-bag-alt.jpg',

            'Parapluie Callaway Tour Authentic 68"' => '/products/callaway-tour-authentic-umbrella-alt.png',
            'Tees TaylorMade Bois (Pack de 100)' => '/products/taylormade-tees-100pack-alt.jpg',
            'Serviette Callaway Odyssey Microfibre' => '/products/callaway-odyssey-towel-alt.png',
            'Outil de pitch Callaway Izzo 4-en-1' => '/products/callaway-izzo-divot-repair-kit-alt.png',
            'Ceinture PING Tour Cuir' => '/products/ping-tour-belt-back.png',
            'Bouteille isotherme TaylorMade Sports' => '/products/taylormade-sports-bottle-alt.jpg',
            'Protège-bois TaylorMade Qi10' => '/products/taylormade-qi10-headcover-back.jpg',

            'Casquette Titleist Tour Performance' => '/products/titleist-tour-performance-back.png',
            'Casquette Callaway Tour Authentic Performance Pro LW' => '/products/callaway-ta-performance-pro-lw-back.png',
            'Casquette TaylorMade Radar Performance' => '/products/taylormade-radar-performance-back.jpg',
            'Casquette TaylorMade Spider Radar' => '/products/taylormade-spider-radar-back.jpg',
            'Casquette Callaway Tour Authentic Performance Pro Charcoal' => '/products/callaway-ta-performance-pro-charcoal-back.jpg',
        ];

        foreach ($hoverImages as $name => $hoverImage) {
            Product::where('name', $name)->update(['hover_image_url' => $hoverImage]);
        }

        // Any product whose brand does not publish a second product-only photo keeps
        // a single view.
        Product::whereNotIn('name', array_keys($hoverImages))->update(['hover_image_url' => null]);

        // 8c. Product variants (size, color, stock) — colours are the verified
        // colourways of each product.
        $clothingSizes = ['XS', 'S', 'M', 'L', 'XL'];
        $waistSizes = ['28', '30', '32', '34', '36', '38'];
        $shoeSizes = ['39', '40', '41', '42', '43', '44', '45'];
        $juniorShoeSizes = ['34', '35', '36', '37', '38'];
        $gloveSizes = ['S', 'M', 'L', 'XL'];

        $variantCatalog = [
            'Polo Greg Norman Freedom Micro Piqué' => [$clothingSizes, ['Marine' => [6, 4, 0, 3, 5]]],
            'Polo Ben Hogan Solid Ottoman Blanc' => [$clothingSizes, ['Blanc' => [5, 7, 4, 0, 6]]],
            'Polo FootJoy MicroFeeder Stripe Marine' => [$clothingSizes, ['Marine' => [4, 0, 5, 2, 3]]],
            'Veste J.Lindeberg Heath Coupe-vent' => [$clothingSizes, ['Olive' => [2, 3, 0, 4, 1]]],

            'Pantalon TaylorMade Greg Norman ML75' => [$waistSizes, ['Bamboo' => [5, 3, 0, 4, 2, 1]]],
            'Pantalon Adidas Ultimate365 Tapered' => [$waistSizes, ['Marine' => [4, 2, 5, 0, 3, 1]]],
            'Pantalon Under Armour Drive 5 Poches' => [$waistSizes, ['Noir' => [3, 4, 0, 5, 2, 2]]],
            'Short Adidas ULT365 Plissé Noir' => [$waistSizes, ['Noir' => [6, 0, 4, 3, 5, 0]]],
            'Pantalon pluie Adidas U365 ClimaProof+' => [$waistSizes, ['Gris' => [2, 3, 1, 0, 4, 2]]],

            'Chaussures FootJoy Pro/SL Spikeless' => [$shoeSizes, ['Blanc/Gris' => [3, 5, 0, 4, 2, 3, 1]]],
            'Chaussures FootJoy Premiere Packard' => [$shoeSizes, ['Blanc' => [4, 6, 3, 0, 5, 2, 1]]],
            'Chaussures Adidas Tour360 24 Boost' => [$shoeSizes, ['Noir' => [2, 4, 6, 5, 3, 0, 2]]],
            'Chaussures FootJoy Quantum Femme' => [$shoeSizes, ['Blanc/Rose' => [3, 0, 5, 4, 2, 1, 0]]],
            'Chaussures Junior FootJoy FJ Flex XP' => [$juniorShoeSizes, ['Bleu' => [4, 2, 0, 5, 3]]],

            'Gant TaylorMade Tour Preferred Cuir' => [$gloveSizes, ['Blanc' => [5, 3, 0, 4]]],
            'Gant TaylorMade Stratus Tech' => [$gloveSizes, ['Blanc' => [6, 4, 2, 0]]],
            'Gant TaylorMade Kalea Femme' => [$gloveSizes, ['Blanc' => [3, 5, 0, 2]]],
            'Gant FootJoy Pure Touch Limited' => [$gloveSizes, ['Blanc perle' => [4, 0, 3, 2]]],
            'Gant FootJoy WeatherSof' => [$gloveSizes, ['Noir' => [0, 4, 5, 2]]],
        ];

        foreach ($variantCatalog as $productName => [$sizes, $colors]) {
            $product = Product::where('name', $productName)->first();

            if (! $product) {
                continue;
            }

            foreach ($colors as $color => $stockBySize) {
                foreach ($sizes as $index => $size) {
                    ProductVariant::firstOrCreate(
                        ['product_id' => $product->id, 'size' => $size, 'color' => $color],
                        ['stock' => $stockBySize[$index] ?? 0],
                    );
                }
            }
        }

        // 9. Tournaments
        Tournament::firstOrCreate(['name' => 'Trophée Hassan II Pro-Am', 'club_id' => $club1->id], [
            'description' => 'Le tournoi prestigieux de printemps rassemblant les meilleurs golfeurs amateurs et professionnels.',
            'date' => Carbon::now()->addDays(14)->setHour(9)->setMinute(0),
            'location' => 'Marrakech',
            'status' => Tournament::STATUS_INSCRIPTIONS_OUVERTES,
            'image_url' => '/section3.png',
            'entry_fee' => 1200,
            'max_participants' => 72,
            'current_participants' => 28,
        ]);

        Tournament::firstOrCreate(['name' => 'Open de Casablanca 2026', 'club_id' => $club2->id], [
            'description' => 'Tournoi ouvert à tous les licenciés sous formule Stableford individuel.',
            'date' => Carbon::now()->addDays(28)->setHour(8)->setMinute(30),
            'location' => 'Casablanca',
            'status' => Tournament::STATUS_BROUILLON,
            'image_url' => '/section2.png',
            'entry_fee' => 600,
            'max_participants' => 54,
            'current_participants' => 12,
        ]);

        // 9. Notifications
        Notification::firstOrCreate([
            'user_id' => $player->id,
            'title' => 'Réservation confirmée !',
        ], [
            'message' => 'Votre tee time au Royal Golf de Marrakech a été confirmé.',
            'type' => 'RESERVATION',
            'is_read' => false,
        ]);

        Notification::firstOrCreate([
            'user_id' => $manager->id,
            'title' => 'Nouvelle demande d’adhésion',
        ], [
            'message' => 'Un golfeur a soumis une demande d’adhésion pour l’Abonnement Annuel Or.',
            'type' => 'MEMBERSHIP',
            'is_read' => false,
        ]);
    }
}
