<?php

namespace Tests\Feature;

use App\Models\Club;
use App\Models\GolfCourse;
use App\Models\Membership;
use App\Models\MembershipRequest;
use App\Models\Notification;
use App\Models\Product;
use App\Models\ProductOrder;
use App\Models\ProductVariant;
use App\Models\Reservation;
use App\Models\TimeSlot;
use App\Models\User;
use Carbon\Carbon;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ApiIntegrationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
    }

    /**
     * Runs a club search and returns the matched clubs' cities, sorted, so that
     * assertions stay independent of the row order returned by the endpoint.
     */
    private function searchedClubCities(array $criteria): array
    {
        $response = $this->postJson('/api/clubs/all', $criteria + [
            'name' => '',
            'city' => '',
            'page' => 0,
            'size' => 100,
        ]);

        $response->assertStatus(200)->assertJsonPath('success', true);

        return collect($response->json('data'))->pluck('city')->sort()->values()->all();
    }

    public function test_login_endpoint(): void
    {
        $response = $this->postJson('/api/login', [
            'email' => 'admin@teetime.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.role', 'ADMIN');
    }

    public function test_clubs_listing(): void
    {
        $response = $this->getJson('/api/clubs');

        $response->assertStatus(200)
            ->assertJsonIsArray();
    }

    public function test_clubs_search_endpoint(): void
    {
        $response = $this->postJson('/api/clubs/all', [
            'page' => 0,
            'size' => 10,
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('success', true);
    }

    /**
     * The seeded clubs are:
     *   Royal Golf de Marrakech (Marrakech), Royal Golf Anfa Mohammedia (Casablanca),
     *   Golf du Palais Royal (Agadir), Royal Golf Dar Es Salam (Rabat),
     *   PalmGolf Casablanca (Casablanca).
     *
     * Cities are asserted instead of names because the endpoint returns the
     * localized name, which differs between the fr and en columns.
     */
    public function test_clubs_search_matches_city_and_name_as_case_insensitive_partial(): void
    {
        $cities = [
            ['city' => 'casa'],
            ['city' => 'CASA'],
            ['city' => 'Casablanca'],
        ];

        foreach ($cities as $criteria) {
            $this->assertSame(
                ['Casablanca', 'Casablanca'],
                $this->searchedClubCities($criteria),
                json_encode($criteria)
            );
        }

        $this->assertSame(['Marrakech'], $this->searchedClubCities(['city' => 'marrakech']));
        $this->assertSame(['Agadir'], $this->searchedClubCities(['city' => 'gadir']));

        // A partial name matches several clubs, whatever the casing used.
        $this->assertSame(
            ['Agadir', 'Casablanca', 'Marrakech', 'Rabat'],
            $this->searchedClubCities(['name' => 'royal'])
        );
        $this->assertSame(
            ['Agadir', 'Casablanca', 'Marrakech', 'Rabat'],
            $this->searchedClubCities(['name' => 'ROYAL'])
        );
        $this->assertSame(['Casablanca'], $this->searchedClubCities(['name' => 'palm']));
    }

    public function test_clubs_search_combines_city_and_name_filters(): void
    {
        // Both inputs at once narrow the result set down to their intersection.
        $this->assertSame(['Rabat'], $this->searchedClubCities(['name' => 'royal', 'city' => 'rabat']));
        $this->assertSame(['Casablanca'], $this->searchedClubCities(['name' => 'royal', 'city' => 'casa']));
        $this->assertSame(['Marrakech'], $this->searchedClubCities(['name' => 'marrakech', 'city' => 'marrakech']));

        // Criteria that no single club satisfies return nothing rather than falling back.
        $this->assertSame([], $this->searchedClubCities(['name' => 'palm', 'city' => 'marrakech']));
        $this->assertSame([], $this->searchedClubCities(['name' => 'zzzzzz']));
        $this->assertSame([], $this->searchedClubCities(['city' => 'zzzzzz']));
    }

    public function test_clubs_search_without_criteria_lists_every_active_club(): void
    {
        $expected = ['Agadir', 'Casablanca', 'Casablanca', 'Marrakech', 'Rabat'];

        $this->assertSame($expected, $this->searchedClubCities([]));
        $this->assertSame($expected, $this->searchedClubCities(['name' => '', 'city' => '']));

        // Whitespace-only input is trimmed away and must not filter anything out.
        $this->assertSame($expected, $this->searchedClubCities(['name' => '   ', 'city' => '   ']));
    }

    public function test_clubs_search_status_filter_hides_suspended_clubs(): void
    {
        $closed = Club::create([
            'name' => 'Royal Golf Fermé',
            'name_en' => 'Royal Golf Fermé',
            'city' => 'Tanger',
            'address' => 'Route du golf, Tanger',
            'status' => 'SUSPENDED',
        ]);

        $this->assertNotContains('Tanger', $this->searchedClubCities(['status' => 'ACTIVE']));
        $this->assertContains('Tanger', $this->searchedClubCities(['name' => 'royal']));

        $this->assertSame(
            ['Tanger'],
            $this->searchedClubCities(['city' => 'tanger', 'status' => 'SUSPENDED'])
        );

        $this->assertContains('Tanger', $this->searchedClubCities([]));

        $closed->delete();
    }

    public function test_time_slots_search(): void
    {
        $response = $this->postJson('/api/time-slots/search', [
            'page' => 0,
            'size' => 5,
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('success', true);
    }

    public function test_tournaments_search(): void
    {
        // The full tournament list (drafts included) is reserved to the APEX administrator.
        $response = $this->actingAs(User::where('role', 'ADMIN_APEX')->first())
            ->postJson('/api/tournaments/search', [
                'page' => 0,
                'size' => 10,
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('success', true);
    }

    public function test_memberships_search(): void
    {
        $response = $this->postJson('/api/memberships/all', [
            'page' => 0,
            'size' => 10,
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('success', true);
    }

    public function test_memberships_search_returns_only_verified_anfa_offers(): void
    {
        $response = $this->withHeaders(['Accept-Language' => 'fr'])
            ->postJson('/api/memberships/all', [
                'page' => 0,
                'size' => 50,
            ]);

        $response->assertStatus(200)->assertJsonCount(4, 'data');

        $data = collect($response->json('data'));

        $this->assertSame(['Royal Golf Anfa Mohammedia'], $data->pluck('club.name')->unique()->values()->all());
        $this->assertSame(
            [1600.0, 3500.0, 10750.0, 13810.0],
            $data->pluck('price')->map(fn ($price) => (float) $price)->sort()->values()->all(),
        );
    }

    public function test_memberships_are_localized_in_english(): void
    {
        $response = $this->withHeaders(['Accept-Language' => 'en-US,en;q=0.9'])
            ->postJson('/api/memberships/all', [
                'page' => 0,
                'size' => 50,
            ]);

        $response->assertStatus(200);

        $data = collect($response->json('data'));
        $individual = $data->firstWhere('title', 'Individual Membership');

        $this->assertNotNull($individual);
        $this->assertSame('Royal Golf Anfa Mohammedia', $individual['club']['name']);
        $this->assertSame('Federal licence included', $individual['benefits'][0]);
        $this->assertTrue($data->pluck('title')->contains('Student Membership (18-25)'));
    }

    public function test_memberships_search_stays_french_for_french_locale(): void
    {
        $response = $this->withHeaders(['Accept-Language' => 'fr-FR,fr;q=0.9'])
            ->postJson('/api/memberships/all', [
                'page' => 0,
                'size' => 50,
            ]);

        $response->assertStatus(200);

        $data = collect($response->json('data'));
        $individual = $data->firstWhere('title', 'Cotisation Individuelle');

        $this->assertNotNull($individual);
        $this->assertSame('Royal Golf Anfa Mohammedia', $individual['club']['name']);
        $this->assertSame('Licence fédérale incluse', $individual['benefits'][0]);
    }

    public function test_memberships_search_filters_by_english_club_name(): void
    {
        $response = $this->withHeaders(['Accept-Language' => 'en'])
            ->postJson('/api/memberships/all', [
                'page' => 0,
                'size' => 50,
                'clubName' => 'Anfa',
            ]);

        $response->assertStatus(200)->assertJsonCount(4, 'data');

        $this->assertSame('Individual Membership', $response->json('data.0.title'));
    }

    public function test_suspended_memberships_are_not_listed(): void
    {
        Membership::query()->update(['status' => 'SUSPENDED']);

        $this->postJson('/api/memberships/all', [
            'page' => 0,
            'size' => 50,
        ])->assertStatus(200)->assertJsonCount(0, 'data');
    }

    public function test_price_search_returns_the_closest_matches_sorted_by_difference(): void
    {
        $prices = fn (array $payload) => collect(
            $this->postJson('/api/memberships/all', ['page' => 0, 'size' => 50] + $payload)
                ->assertStatus(200)
                ->json('data')
        )->pluck('price')->map(fn ($price) => (float) $price)->values()->all();

        // 10,750 is close to 10,000 while 13,810 (38% away) and the junior plans are excluded.
        $this->assertSame([10750.0], $prices(['price' => 10000]));

        // The exact match comes first, then the next closest plan.
        $this->assertSame([10750.0, 13810.0], $prices(['price' => 10750]));

        // Lower targets match the cheaper plans only.
        $this->assertSame([1600.0], $prices(['price' => 2000]));

        // Prices too far from the target return no results.
        $this->assertSame([], $prices(['price' => 6000]));
    }

    public function test_membership_detail_endpoint_is_localized(): void
    {
        $membership = Membership::where('title', 'Cotisation Individuelle')->firstOrFail();

        $this->withHeaders(['Accept-Language' => 'fr'])
            ->getJson('/api/memberships/' . $membership->id)
            ->assertStatus(200)
            ->assertJsonPath('data.title', 'Cotisation Individuelle')
            ->assertJsonPath('data.club.name', 'Royal Golf Anfa Mohammedia');

        $this->withHeaders(['Accept-Language' => 'en'])
            ->getJson('/api/memberships/' . $membership->id)
            ->assertStatus(200)
            ->assertJsonPath('data.title', 'Individual Membership')
            ->assertJsonPath('data.club.name', 'Royal Golf Anfa Mohammedia');
    }

    public function test_membership_subscription_is_paid_on_request(): void
    {
        $player = User::where('email', 'player@teetime.com')->firstOrFail();
        $membership = Membership::where('title', 'Cotisation Individuelle')->firstOrFail();

        $response = $this->actingAs($player)->postJson('/api/memberships-requests/request', [
            'membershipId' => (string) $membership->id,
        ])->assertStatus(201)
            ->assertJsonPath('data.paymentStatus', 'PAID')
            ->assertJsonPath('data.userFullName', 'Youssef Bennani')
            ->assertJsonPath('data.userEmail', 'player@teetime.com')
            ->assertJsonPath('data.userPhone', '+212662000003')
            ->assertJsonPath('data.startDate', now()->toDateString())
            ->assertJsonPath('data.endDate', now()->addYearNoOverflow()->toDateString())
            ->assertJsonPath('data.status', 'PENDING')
            ->assertJsonMissingPath('data.paymentMethod');

        $this->assertEquals((float) $membership->price, $response->json('data.price'));

        $request = MembershipRequest::where('user_id', $player->id)
            ->where('membership_id', $membership->id)
            ->where('status', 'PENDING')
            ->firstOrFail();

        $this->assertSame(now()->toDateString(), $request->start_date->toDateString());
        $this->assertSame(now()->addYearNoOverflow()->toDateString(), $request->end_date->toDateString());
    }

    public function test_admin_sees_membership_requests_for_every_plan(): void
    {
        $admin = User::where('email', 'admin@teetime.com')->firstOrFail();
        $player = User::where('email', 'player@teetime.com')->firstOrFail();
        $plans = Membership::query()->orderBy('id')->take(2)->get();

        $this->assertCount(2, $plans);

        foreach ($plans as $plan) {
            $this->actingAs($player)->postJson('/api/memberships-requests/request', [
                'membershipId' => (string) $plan->id,
            ])->assertStatus(201);
        }

        $response = $this->actingAs($admin)->postJson('/api/memberships-requests/all', [
            'status' => 'PENDING',
            'page' => 0,
            'size' => 50,
        ])->assertStatus(200);

        $requests = collect($response->json('data'));

        foreach ($plans as $plan) {
            $entry = $requests->firstWhere('membershipId', (string) $plan->id);

            $this->assertNotNull($entry);
            $this->assertNotNull($entry['userFullName']);
            $this->assertSame('player@teetime.com', $entry['userEmail']);
            $this->assertSame(now()->toDateString(), $entry['startDate']);
            $this->assertSame(now()->addYearNoOverflow()->toDateString(), $entry['endDate']);
            $this->assertArrayHasKey('clubName', $entry);
            $this->assertArrayHasKey('price', $entry);
        }
    }

    public function test_admin_can_accept_and_reject_membership_requests(): void
    {
        $admin = User::where('email', 'admin@teetime.com')->firstOrFail();
        $player = User::where('email', 'player@teetime.com')->firstOrFail();
        $plans = Membership::query()->orderBy('id')->take(2)->get();

        $first = $this->actingAs($player)->postJson('/api/memberships-requests/request', [
            'membershipId' => (string) $plans[0]->id,
        ])->assertStatus(201)->json('data.id');

        $second = $this->actingAs($player)->postJson('/api/memberships-requests/request', [
            'membershipId' => (string) $plans[1]->id,
        ])->assertStatus(201)->json('data.id');

        $this->actingAs($admin)
            ->postJson('/api/memberships-requests/accept?requestId=' . $first)
            ->assertStatus(200)
            ->assertJsonPath('data.status', 'ACCEPTED');

        $this->actingAs($admin)
            ->postJson('/api/memberships-requests/reject?requestId=' . $second)
            ->assertStatus(200)
            ->assertJsonPath('data.status', 'REJECTED');

        $this->assertSame('ACCEPTED', MembershipRequest::findOrFail($first)->status);
        $this->assertSame('REJECTED', MembershipRequest::findOrFail($second)->status);

        $list = collect($this->actingAs($admin)->postJson('/api/memberships-requests/all', [
            'page' => 0,
            'size' => 50,
        ])->assertStatus(200)->json('data'))->keyBy('id');

        $this->assertSame('ACCEPTED', $list[$first]['status']);
        $this->assertSame('REJECTED', $list[$second]['status']);
    }

    public function test_membership_request_decision_requires_authentication(): void
    {
        $player = User::where('email', 'player@teetime.com')->firstOrFail();
        $membership = Membership::firstOrFail();

        $requestId = MembershipRequest::create([
            'user_id' => $player->id,
            'membership_id' => $membership->id,
            'status' => 'PENDING',
        ])->id;

        $this->postJson('/api/memberships-requests/accept?requestId=' . $requestId)
            ->assertStatus(401);

        $this->assertSame('PENDING', MembershipRequest::findOrFail($requestId)->status);
    }

    public function test_manager_can_only_decide_requests_for_owned_club(): void
    {
        $manager = User::where('email', 'manager@teetime.com')->firstOrFail();
        $player = User::where('email', 'player@teetime.com')->firstOrFail();
        $clubId = $manager->managedClub?->id;

        $this->assertNotNull($clubId);

        $ownPlan = Membership::create([
            'club_id' => $clubId,
            'title' => 'Test Own Club Plan',
            'price' => 1000,
            'status' => 'ACTIVE',
        ]);
        $otherPlan = Membership::where('club_id', '!=', $clubId)->firstOrFail();

        $ownRequest = $this->actingAs($player)->postJson('/api/memberships-requests/request', [
            'membershipId' => (string) $ownPlan->id,
        ])->assertStatus(201)->json('data.id');

        $otherRequest = $this->actingAs($player)->postJson('/api/memberships-requests/request', [
            'membershipId' => (string) $otherPlan->id,
        ])->assertStatus(201)->json('data.id');

        $this->actingAs($manager)
            ->postJson('/api/memberships-requests/accept?requestId=' . $ownRequest)
            ->assertStatus(200)
            ->assertJsonPath('data.status', 'ACCEPTED');

        $this->actingAs($manager)
            ->postJson('/api/memberships-requests/reject?requestId=' . $otherRequest)
            ->assertStatus(403);

        $this->assertSame('ACCEPTED', MembershipRequest::findOrFail($ownRequest)->status);
        $this->assertSame('PENDING', MembershipRequest::findOrFail($otherRequest)->status);
    }

    public function test_membership_subscription_requires_authentication(): void
    {
        $membership = Membership::firstOrFail();

        $this->postJson('/api/memberships-requests/request', [
            'membershipId' => (string) $membership->id,
        ])->assertStatus(401);
    }

    public function test_duplicate_pending_membership_subscription_is_rejected(): void
    {
        $player = User::where('email', 'player@teetime.com')->firstOrFail();
        $membership = Membership::where('title', 'Cotisation Individuelle')->firstOrFail();
        $payload = ['membershipId' => (string) $membership->id];

        $this->actingAs($player)->postJson('/api/memberships-requests/request', $payload)->assertStatus(201);
        $this->actingAs($player)->postJson('/api/memberships-requests/request', $payload)->assertStatus(422);

        $this->assertSame(1, MembershipRequest::where('user_id', $player->id)
            ->where('membership_id', $membership->id)
            ->where('status', 'PENDING')
            ->count());
    }

    public function test_dashboard_admin(): void
    {
        $admin = User::where('email', 'admin@teetime.com')->firstOrFail();

        $response = $this->actingAs($admin)->getJson('/api/dashboard/admin');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonStructure([
                'data' => [
                    'kpis',
                    'usersGrowth',
                    'reservationsTrend',
                ],
            ]);
    }

    public function test_admin_dashboard_lists_recent_reservation_dates(): void
    {
        $admin = User::where('email', 'admin@teetime.com')->firstOrFail();

        $response = $this->actingAs($admin)->getJson('/api/dashboard/admin');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'recentReservations' => [
                        [
                            'id',
                            'playerName',
                            'clubName',
                            'courseName',
                            'reservationDate',
                            'time',
                            'numberOfPlayers',
                            'status',
                        ],
                    ],
                ],
            ]);
    }

    public function test_reservation_saves_selected_reservation_date(): void
    {
        $player = User::where('email', 'player@teetime.com')->firstOrFail();
        $slot = \App\Models\TimeSlot::orderBy('id')->firstOrFail();
        $date = $slot->start_time->copy()->addDays(3)->toDateString();

        $response = $this->actingAs($player)->postJson('/api/reservations/add', [
            'courseId' => (string) $slot->golf_course_id,
            'startTime' => "{$date}T08:00:00",
            'reservationDate' => $date,
            'numberOfPlayers' => 2,
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.reservationDate', $date);

        $reservation = Reservation::latest('id')->firstOrFail();

        $this->assertSame($date, $reservation->reservation_date->format('Y-m-d'));
        $this->assertSame($player->id, $reservation->user_id);
    }

    public function test_course_time_slots_endpoint_returns_three_tee_times(): void
    {
        $slot = \App\Models\TimeSlot::orderBy('id')->firstOrFail();
        $date = $slot->start_time->copy()->addDays(4)->toDateString();

        $response = $this->getJson('/api/time-slots/course?courseId='.$slot->golf_course_id.'&date='.$date);

        $response->assertStatus(200)
            ->assertJsonCount(3, 'data')
            ->assertJsonPath('data.0.startTime', "{$date}T08:00:00")
            ->assertJsonPath('data.2.startTime', "{$date}T16:00:00");
    }

    public function test_manager_time_slots_endpoint(): void
    {
        $manager = User::where('email', 'manager@teetime.com')->firstOrFail();

        $response = $this->actingAs($manager)->postJson('/api/time-slots/manager', [
            'page' => 0,
            'size' => 100,
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonStructure([
                'data' => [
                    'content' => [
                        '*' => ['id', 'startTime', 'endTime', 'status', 'bookedPlayers', 'courseId', 'courseName', 'players'],
                    ],
                    'last',
                ],
            ]);
    }

    public function test_manager_reservations_endpoint(): void
    {
        $manager = User::where('email', 'manager@teetime.com')->firstOrFail();

        $response = $this->actingAs($manager)->getJson('/api/reservations/club');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonStructure([
                'data' => [
                    'content' => [
                        '*' => ['id', 'status', 'playerName', 'courseId', 'courseName', 'reservationDate', 'startTime', 'numberOfPlayers', 'greenFee', 'requestedAt'],
                    ],
                    'last',
                ],
            ]);
    }

    public function test_manager_cannot_decide_a_reservation_status(): void
    {
        $manager = User::where('email', 'manager@teetime.com')->firstOrFail();
        $reservation = Reservation::whereHas('golfCourse.club', fn($q) => $q->where('owner_id', $manager->id))->firstOrFail();

        $response = $this->actingAs($manager)->putJson('/api/reservations/update-status', [
            'id' => (string) $reservation->id,
            'status' => 'ACCEPTED',
        ]);

        $response->assertStatus(403)->assertJsonPath('success', false);

        $this->assertNotSame('ACCEPTED', $reservation->fresh()->status);
        $this->assertDatabaseMissing('notifications', ['type' => 'RESERVATION_CONFIRMED']);
    }

    public function test_admin_dashboard_lists_pending_reservation_requests(): void
    {
        $admin = User::where('email', 'admin@teetime.com')->firstOrFail();
        $pending = $this->createPendingReservation();

        $response = $this->actingAs($admin)->getJson('/api/dashboard/admin');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'pendingReservationRequests' => [
                        [
                            'id',
                            'playerName',
                            'clubName',
                            'courseName',
                            'reservationDate',
                            'time',
                            'numberOfPlayers',
                            'status',
                        ],
                    ],
                ],
            ])
            ->assertJsonPath('data.pendingReservationRequests.0.id', (string) $pending->id);
    }

    public function test_admin_can_accept_and_reject_reservations(): void
    {
        $admin = User::where('email', 'admin@teetime.com')->firstOrFail();
        $toAccept = $this->createPendingReservation();
        $toReject = $this->createPendingReservation();

        $accept = $this->actingAs($admin)->putJson('/api/reservations/update-status', [
            'id' => (string) $toAccept->id,
            'status' => 'ACCEPTED',
        ]);
        $accept->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.autoRejected', 0);
        $this->assertSame('ACCEPTED', $toAccept->fresh()->status);

        $reject = $this->actingAs($admin)->putJson('/api/reservations/update-status', [
            'id' => (string) $toReject->id,
            'status' => 'REJECTED',
        ]);
        $reject->assertStatus(200)->assertJsonPath('success', true);
        $this->assertSame('REJECTED', $toReject->fresh()->status);
    }

    private function createPendingReservation(): Reservation
    {
        $player = User::where('email', 'player@teetime.com')->firstOrFail();
        $slot = \App\Models\TimeSlot::orderByDesc('id')->firstOrFail();

        return Reservation::create([
            'user_id' => $player->id,
            'golf_course_id' => $slot->golf_course_id,
            'time_slot_id' => $slot->id,
            'reservation_date' => $slot->start_time->toDateString(),
            'number_of_players' => 2,
            'status' => 'PENDING',
        ]);
    }

    public function test_admin_approval_notifies_the_player_with_the_reservation_details(): void
    {
        $player = User::where('email', 'player@teetime.com')->firstOrFail();
        $admin = User::where('email', 'admin@teetime.com')->firstOrFail();
        $reservation = $this->createPendingReservation();
        $course = GolfCourse::with('club')->findOrFail($reservation->golf_course_id);

        $before = $this->actingAs($player)->getJson('/api/notifications/unread-count')->json('data');

        $this->assertDatabaseMissing('notifications', [
            'user_id' => $player->id,
            'type' => 'RESERVATION_CONFIRMED',
        ]);

        $this->actingAs($admin)->putJson('/api/reservations/update-status', [
            'id' => (string) $reservation->id,
            'status' => 'ACCEPTED',
        ])->assertStatus(200);

        $notification = Notification::where('user_id', $player->id)
            ->where('type', 'RESERVATION_CONFIRMED')
            ->sole();

        $this->assertSame('Réservation acceptée', $notification->title);
        $this->assertSame('Votre réservation a été approuvée !', $notification->message);
        $this->assertFalse($notification->is_read);
        $this->assertSame((string) $reservation->id, $notification->data['reservationId']);
        $this->assertSame($course->club->name, $notification->data['clubName']);
        $this->assertSame($course->name, $notification->data['courseName']);
        $this->assertSame($reservation->reservation_date->toDateString(), $notification->data['reservationDate']);
        $this->assertSame($reservation->timeSlot->start_time->format('H:i'), $notification->data['startTime']);
        $this->assertSame(2, $notification->data['numberOfPlayers']);
        $this->assertNull($notification->data['reason']);

        $after = $this->actingAs($player)->getJson('/api/notifications/unread-count')->json('data');
        $this->assertSame($before + 1, $after);

        // Re-approving the same reservation must not notify twice.
        $this->actingAs($admin)->putJson('/api/reservations/update-status', [
            'id' => (string) $reservation->id,
            'status' => 'ACCEPTED',
        ])->assertStatus(200);

        $this->assertSame(1, Notification::where('user_id', $player->id)
            ->where('type', 'RESERVATION_CONFIRMED')
            ->count());
    }

    public function test_admin_rejection_notifies_the_player_with_the_optional_reason(): void
    {
        $player = User::where('email', 'player@teetime.com')->firstOrFail();
        $admin = User::where('email', 'admin@teetime.com')->firstOrFail();
        $reservation = $this->createPendingReservation();

        $this->actingAs($admin)->putJson('/api/reservations/update-status', [
            'id' => (string) $reservation->id,
            'status' => 'REJECTED',
            'reason' => 'Le départ est complet ce jour-là.',
        ])->assertStatus(200);

        $notification = Notification::where('user_id', $player->id)
            ->where('type', 'RESERVATION_REJECTED')
            ->sole();

        $this->assertSame('Réservation refusée', $notification->title);
        $this->assertSame(
            'Malheureusement, votre demande de réservation a été refusée.',
            $notification->message,
        );
        $this->assertSame('Le départ est complet ce jour-là.', $notification->data['reason']);
        $this->assertSame((string) $reservation->id, $notification->data['reservationId']);
    }

    public function test_reservation_status_change_to_the_same_state_never_notifies_twice(): void
    {
        $player = User::where('email', 'player@teetime.com')->firstOrFail();
        $admin = User::where('email', 'admin@teetime.com')->firstOrFail();
        $reservation = $this->createPendingReservation();

        $this->actingAs($admin)->putJson('/api/reservations/update-status', [
            'id' => (string) $reservation->id,
            'status' => 'REJECTED',
        ])->assertStatus(200);

        $this->actingAs($admin)->putJson('/api/reservations/update-status', [
            'id' => (string) $reservation->id,
            'status' => 'REJECTED',
        ])->assertStatus(200);

        $this->assertSame(1, Notification::where('user_id', $player->id)
            ->where('type', 'RESERVATION_REJECTED')
            ->count());
    }

    public function test_players_displaced_by_capacity_are_notified_once(): void
    {
        $admin = User::where('email', 'admin@teetime.com')->firstOrFail();
        $slot = TimeSlot::whereDoesntHave('reservations')->where('max_players', 4)->firstOrFail();

        $confirmed = $this->createPlayer('Karim', 'Sabri');
        $displacedPlayer = $this->createPlayer('Nadia', 'El Amrani');
        $acceptedPlayer = $this->createPlayer('Omar', 'Benali');

        $this->createReservationOn($slot, $confirmed, 2, 'CONFIRMED');
        $displaced = $this->createReservationOn($slot, $displacedPlayer, 2, 'PENDING');
        $accepted = $this->createReservationOn($slot, $acceptedPlayer, 3, 'PENDING');

        $this->actingAs($admin)->putJson('/api/reservations/update-status', [
            'id' => (string) $accepted->id,
            'status' => 'ACCEPTED',
        ])
            ->assertStatus(200)
            ->assertJsonPath('data.autoRejected', 1);

        $this->assertSame('REJECTED', $displaced->fresh()->status);

        $notification = Notification::where('user_id', $displacedPlayer->id)
            ->where('type', 'RESERVATION_REJECTED')
            ->sole();

        $this->assertSame((string) $displaced->id, $notification->data['reservationId']);
        $this->assertSame('Les places sur ce départ sont complètes.', $notification->data['reason']);

        // The accepted player is notified too, exactly once.
        $this->assertSame(1, Notification::where('user_id', $acceptedPlayer->id)
            ->where('type', 'RESERVATION_CONFIRMED')
            ->count());
    }

    private function createReservationOn(
        \App\Models\TimeSlot $slot,
        User $player,
        int $players,
        string $status,
    ): Reservation {
        return Reservation::create([
            'user_id' => $player->id,
            'golf_course_id' => $slot->golf_course_id,
            'time_slot_id' => $slot->id,
            'reservation_date' => $slot->start_time->toDateString(),
            'number_of_players' => $players,
            'status' => $status,
        ]);
    }

    public function test_shop_catalog_lists_seeded_products_with_images(): void
    {
        $response = $this->getJson('/api/products');

        $response->assertStatus(200)
            ->assertJsonCount(42, 'data')
            ->assertJsonStructure([
                'data' => [
                    ['id', 'name', 'description', 'category', 'price', 'imageUrl', 'hoverImageUrl', 'isActive'],
                ],
            ]);

        $this->assertNotEmpty($response->json('data.0.imageUrl'));

        $clubs = $this->getJson('/api/products?category=CLUBS');
        $clubs->assertStatus(200)->assertJsonCount(4, 'data');
        $this->assertSame('CLUBS', $clubs->json('data.0.category'));
    }

    public function test_shop_catalog_covers_trousers_shoes_gloves_bags_and_accessories(): void
    {
        $expectedCounts = [
            'CLUBS' => 4,
            'BALLS' => 1,
            'GLOVES' => 5,
            'TROUSERS' => 5,
            'APPAREL' => 4,
            'CAPS' => 5,
            'ACCESSORIES' => 8,
            'BAGS' => 5,
            'SHOES' => 5,
        ];

        foreach ($expectedCounts as $category => $count) {
            $response = $this->getJson('/api/products?category='.$category);
            $response->assertStatus(200)->assertJsonCount($count, 'data');
        }

        $trousers = Product::where('category', 'TROUSERS')->pluck('image_url');
        $this->assertCount(5, $trousers);
        $this->assertCount(5, $trousers->unique());
        $trousers->each(fn (string $image) => $this->assertStringStartsWith('/products/', $image));

        // Every product image, primary and alternate, is a file shipped in public/products.
        $publicPath = base_path('../frontend/public');

        Product::all()->each(function (Product $product) use ($publicPath) {
            $this->assertFileExists($publicPath.$product->image_url);

            if ($product->hover_image_url) {
                $this->assertFileExists($publicPath.$product->hover_image_url);
                $this->assertNotSame($product->image_url, $product->hover_image_url);
            }
        });

        // Caps and shoes are the categories where every product publishes a second
        // view: the back of the cap and the top of the shoe.
        $this->assertSame(5, Product::where('category', 'CAPS')->whereNotNull('hover_image_url')->count());
        $this->assertSame(5, Product::where('category', 'SHOES')->whereNotNull('hover_image_url')->count());
        Product::where('category', 'SHOES')->get()
            ->each(fn (Product $product) => $this->assertStringEndsWith('-top.jpg', $product->hover_image_url));

        $this->assertSame(36, Product::whereNotNull('hover_image_url')->count());

        $ml75 = collect($this->getJson('/api/products?category=TROUSERS')->json('data'))
            ->firstWhere('name', 'Pantalon TaylorMade Greg Norman ML75');
        $this->assertSame('/products/gregnorman-ml75-pants-bamboo-back.jpg', $ml75['hoverImageUrl']);

        $gloveNames = Product::where('category', 'GLOVES')->pluck('name');
        $this->assertTrue($gloveNames->contains(fn (string $name) => str_contains($name, 'Tour Preferred')));
        $this->assertTrue($gloveNames->contains(fn (string $name) => str_contains($name, 'Stratus Tech')));
        $this->assertTrue($gloveNames->contains(fn (string $name) => str_contains($name, 'Kalea')));
        $this->assertTrue($gloveNames->contains(fn (string $name) => str_contains($name, 'Pure Touch')));
        $this->assertTrue($gloveNames->contains(fn (string $name) => str_contains($name, 'WeatherSof')));

        $pureTouch = collect($this->getJson('/api/products?category=GLOVES')->json('data'))
            ->firstWhere('name', 'Gant FootJoy Pure Touch Limited');
        $this->assertSame('/products/footjoy-pure-touch-glove-back.jpg', $pureTouch['hoverImageUrl']);
    }

    public function test_catalog_exposes_sizes_colors_and_stock_for_variant_products(): void
    {
        $product = Product::where('name', 'Pantalon TaylorMade Greg Norman ML75')->firstOrFail();

        $response = $this->getJson('/api/products?category=TROUSERS');

        $item = collect($response->json('data'))->firstWhere('id', (string) $product->id);

        $this->assertNotNull($item);
        $this->assertCount(6, $item['variants']);

        $sizes = collect($item['variants'])->pluck('size')->unique()->values()->all();
        $this->assertSame(['28', '30', '32', '34', '36', '38'], $sizes);

        $colors = collect($item['variants'])->pluck('color')->unique()->values()->all();
        $this->assertSame(['Bamboo'], $colors);

        $unavailable = collect($item['variants'])->firstWhere(
            fn (array $variant) => $variant['size'] === '32' && $variant['color'] === 'Bamboo',
        );
        $this->assertSame(0, $unavailable['stock']);

        $driver = Product::where('name', 'Driver TaylorMade Qi4D LS')->firstOrFail();
        $driverItem = collect($this->getJson('/api/products?category=CLUBS')->json('data'))
            ->firstWhere('id', (string) $driver->id);
        $this->assertSame([], $driverItem['variants']);
    }

    public function test_player_orders_a_size_and_color_and_stock_is_decremented(): void
    {
        $player = User::where('email', 'player@teetime.com')->firstOrFail();
        $product = Product::where('name', 'Chaussures Adidas Tour360 24 Boost')->firstOrFail();
        $variant = ProductVariant::where('product_id', $product->id)
            ->where('size', '41')
            ->where('color', 'Noir')
            ->firstOrFail();

        $initialStock = $variant->stock;

        $response = $this->actingAs($player)->postJson('/api/product-orders', [
            'productId' => (string) $product->id,
            'quantity' => 2,
            'size' => '41',
            'color' => 'Noir',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.size', '41')
            ->assertJsonPath('data.color', 'Noir')
            ->assertJsonPath('data.quantity', 2);

        $this->assertDatabaseHas('product_orders', [
            'id' => $response->json('data.id'),
            'product_variant_id' => $variant->id,
            'size' => '41',
            'color' => 'Noir',
        ]);

        $this->assertSame($initialStock - 2, $variant->fresh()->stock);
    }

    public function test_order_requires_a_valid_available_size_and_color(): void
    {
        $player = User::where('email', 'player@teetime.com')->firstOrFail();
        $product = Product::where('name', 'Pantalon TaylorMade Greg Norman ML75')->firstOrFail();

        $this->actingAs($player)->postJson('/api/product-orders', [
            'productId' => (string) $product->id,
        ])->assertStatus(422)->assertJsonValidationErrors('size');

        $this->actingAs($player)->postJson('/api/product-orders', [
            'productId' => (string) $product->id,
            'size' => '32',
            'color' => 'Bamboo',
        ])->assertStatus(422)->assertJsonValidationErrors('size');

        $this->actingAs($player)->postJson('/api/product-orders', [
            'productId' => (string) $product->id,
            'size' => '99',
            'color' => 'Bamboo',
        ])->assertStatus(422)->assertJsonValidationErrors('size');

        $this->actingAs($player)->postJson('/api/product-orders', [
            'productId' => (string) $product->id,
            'size' => '38',
            'color' => 'Bamboo',
            'quantity' => 5,
        ])->assertStatus(422)->assertJsonValidationErrors('quantity');

        $this->assertDatabaseCount('product_orders', 0);
        $this->assertSame(0, ProductVariant::where('product_id', $product->id)->where('size', '32')->where('color', 'Bamboo')->value('stock'));
    }

    public function test_admin_can_manage_variant_sizes_colors_and_stock(): void
    {
        $admin = User::where('email', 'admin@teetime.com')->firstOrFail();
        $player = User::where('email', 'player@teetime.com')->firstOrFail();
        $product = Product::where('name', 'Short Adidas ULT365 Plissé Noir')->firstOrFail();

        $payload = [
            'variants' => [
                ['size' => '30', 'color' => 'Blanc', 'stock' => 9],
                ['size' => '32', 'color' => 'Blanc', 'stock' => 0],
                ['size' => '32', 'color' => 'Marine', 'stock' => 4],
            ],
        ];

        $this->actingAs($player)
            ->putJson("/api/products/{$product->id}/variants", $payload)
            ->assertStatus(403);

        $this->actingAs($admin)
            ->putJson("/api/products/{$product->id}/variants", $payload)
            ->assertStatus(200)
            ->assertJsonCount(3, 'data.variants');

        $this->assertSame(3, ProductVariant::where('product_id', $product->id)->count());
        $this->assertDatabaseHas('product_variants', [
            'product_id' => $product->id,
            'size' => '30',
            'color' => 'Blanc',
            'stock' => 9,
        ]);
        $this->assertDatabaseMissing('product_variants', [
            'product_id' => $product->id,
            'size' => '28',
            'color' => 'Blanc',
        ]);

        $this->actingAs($admin)->putJson("/api/products/{$product->id}/variants", [
            'variants' => [
                ['size' => '30', 'color' => 'Blanc', 'stock' => 1],
                ['size' => '30', 'color' => 'blanc', 'stock' => 2],
            ],
        ])->assertStatus(422);
    }

    public function test_rejecting_an_order_restores_variant_stock(): void
    {
        $player = User::where('email', 'player@teetime.com')->firstOrFail();
        $admin = User::where('email', 'admin@teetime.com')->firstOrFail();
        $product = Product::where('name', 'Chaussures FootJoy Premiere Packard')->firstOrFail();
        $variant = ProductVariant::where('product_id', $product->id)
            ->where('size', '40')
            ->where('color', 'Blanc')
            ->firstOrFail();

        $initialStock = $variant->stock;

        $orderId = $this->actingAs($player)->postJson('/api/product-orders', [
            'productId' => (string) $product->id,
            'quantity' => 2,
            'size' => '40',
            'color' => 'Blanc',
        ])->assertStatus(201)->json('data.id');

        $this->assertSame($initialStock - 2, $variant->fresh()->stock);

        $this->actingAs($admin)->putJson('/api/product-orders/update-status', [
            'id' => (string) $orderId,
            'status' => 'REJECTED',
        ])->assertStatus(200)->assertJsonPath('data.status', 'REJECTED');

        $this->assertSame($initialStock, $variant->fresh()->stock);

        $this->actingAs($admin)->putJson('/api/product-orders/update-status', [
            'id' => (string) $orderId,
            'status' => 'ACCEPTED',
        ])->assertStatus(200)->assertJsonPath('data.status', 'ACCEPTED');

        $this->assertSame($initialStock - 2, $variant->fresh()->stock);
    }

    public function test_player_can_order_a_product_and_admin_can_accept_it(): void
    {
        $player = User::where('email', 'player@teetime.com')->firstOrFail();
        $admin = User::where('email', 'admin@teetime.com')->firstOrFail();
        $product = Product::where('is_active', true)->firstOrFail();

        $create = $this->actingAs($player)->postJson('/api/product-orders', [
            'productId' => (string) $product->id,
            'quantity' => 2,
            'notes' => 'Test commande',
        ]);

        $create->assertStatus(201)
            ->assertJsonPath('data.status', 'PENDING')
            ->assertJsonPath('data.quantity', 2)
            ->assertJsonPath('data.productId', (string) $product->id)
            ->assertJsonPath('data.totalPrice', (int) ($product->price * 2))
            ->assertJsonPath('data.amountDue', (int) ($product->price * 2))
            ->assertJsonMissingPath('data.pointsRedeemed')
            ->assertJsonMissingPath('data.discountAmount')
            ->assertJsonMissingPath('data.pointsEarned')
            ->assertJsonPath('data.paymentStatus', 'UNPAID');

        $orderId = $create->json('data.id');

        $mine = $this->actingAs($player)->getJson('/api/product-orders/mine');
        $mine->assertStatus(200)->assertJsonPath('data.0.id', (string) $orderId);

        $adminList = $this->actingAs($admin)->getJson('/api/product-orders?status=PENDING');
        $adminList->assertStatus(200)->assertJsonPath('data.0.id', (string) $orderId);

        $accept = $this->actingAs($admin)->putJson('/api/product-orders/update-status', [
            'id' => (string) $orderId,
            'status' => 'ACCEPTED',
        ]);

        $accept->assertStatus(200)
            ->assertJsonPath('data.status', 'ACCEPTED')
            ->assertJsonPath('data.paymentStatus', 'UNPAID');
    }

    public function test_player_can_pay_an_accepted_order(): void
    {
        [$player, $order] = $this->acceptedOrderFor(playerEmail: 'player@teetime.com');

        $this->actingAs($player)->postJson('/api/product-orders/pay', [
            'id' => (string) $order->id,
            ...$this->deliveryPayload(),
        ])->assertStatus(200)
            ->assertJsonPath('data.paymentStatus', 'PAID')
            ->assertJsonMissingPath('data.paymentMethod')
            ->assertJsonPath('data.deliveryFullName', 'Player Teetime')
            ->assertJsonPath('data.deliveryPhone', '+212600000000')
            ->assertJsonPath('data.deliveryCity', 'Rabat')
            ->assertJsonPath('data.deliveryAddress', '12 Avenue Hassan II, Appartement 4')
            ->assertJsonPath('data.deliveryDetails', 'Ring twice');

        $this->assertDatabaseHas('product_orders', [
            'id' => $order->id,
            'delivery_full_name' => 'Player Teetime',
            'delivery_phone' => '+212600000000',
            'delivery_city' => 'Rabat',
            'delivery_address' => '12 Avenue Hassan II, Appartement 4',
            'delivery_details' => 'Ring twice',
        ]);
    }

    public function test_payment_requires_delivery_details(): void
    {
        [$player, $order] = $this->acceptedOrderFor(playerEmail: 'player@teetime.com');

        $this->actingAs($player)->postJson('/api/product-orders/pay', [
            'id' => (string) $order->id,
        ])->assertStatus(422)->assertJsonValidationErrors([
            'deliveryFullName',
            'deliveryPhone',
            'deliveryCity',
            'deliveryAddress',
        ]);

        $this->assertDatabaseHas('product_orders', [
            'id' => $order->id,
            'payment_status' => 'UNPAID',
            'delivery_phone' => null,
        ]);
    }

    public function test_pending_order_cannot_be_paid(): void
    {
        $player = User::where('email', 'player@teetime.com')->firstOrFail();
        $product = Product::where('is_active', true)->firstOrFail();

        $order = ProductOrder::create([
            'user_id' => $player->id,
            'product_id' => $product->id,
            'quantity' => 1,
            'unit_price' => $product->price,
            'total_price' => $product->price,
            'status' => 'PENDING',
        ]);

        $this->actingAs($player)->postJson('/api/product-orders/pay', [
            'id' => (string) $order->id,
            ...$this->deliveryPayload(),
        ])->assertStatus(422);

        $this->assertDatabaseHas('product_orders', [
            'id' => $order->id,
            'payment_status' => 'UNPAID',
        ]);
    }

    public function test_player_cannot_pay_someone_elses_order(): void
    {
        [$owner, $order] = $this->acceptedOrderFor(playerEmail: 'player@teetime.com');
        $manager = User::where('email', 'manager@teetime.com')->firstOrFail();

        $this->actingAs($manager)->postJson('/api/product-orders/pay', [
            'id' => (string) $order->id,
            ...$this->deliveryPayload(),
        ])->assertStatus(403);

        $this->assertDatabaseHas('product_orders', [
            'id' => $order->id,
            'payment_status' => 'UNPAID',
        ]);
    }

    public function test_only_admin_can_list_product_orders(): void
    {
        $player = User::where('email', 'player@teetime.com')->firstOrFail();

        $this->actingAs($player)->getJson('/api/product-orders')->assertStatus(403);
    }

    public function test_loyalty_endpoint_is_removed(): void
    {
        $this->getJson('/api/loyalty')->assertNotFound();
    }

    /**
     * @return array{0: User, 1: ProductOrder}
     */
    private function acceptedOrderFor(string $playerEmail): array
    {
        $player = User::where('email', $playerEmail)->firstOrFail();
        $product = Product::where('is_active', true)->firstOrFail();

        $order = ProductOrder::create([
            'user_id' => $player->id,
            'product_id' => $product->id,
            'quantity' => 1,
            'unit_price' => $product->price,
            'total_price' => $product->price,
            'status' => 'ACCEPTED',
        ]);

        return [$player, $order];
    }

    public function test_admin_acceptance_creates_one_notification_for_the_player(): void
    {
        $player = User::where('email', 'player@teetime.com')->firstOrFail();
        $admin = User::where('email', 'admin@teetime.com')->firstOrFail();
        $product = Product::where('is_active', true)->whereDoesntHave('variants')->firstOrFail();

        $orderId = $this->actingAs($player)->postJson('/api/product-orders', [
            'productId' => (string) $product->id,
            'quantity' => 2,
        ])->assertStatus(201)->json('data.id');

        $this->assertDatabaseMissing('notifications', [
            'user_id' => $player->id,
            'type' => 'ORDER_ACCEPTED',
        ]);

        $this->actingAs($admin)->putJson('/api/product-orders/update-status', [
            'id' => (string) $orderId,
            'status' => 'ACCEPTED',
        ])->assertStatus(200)->assertJsonPath('data.status', 'ACCEPTED');

        $notification = Notification::where('user_id', $player->id)
            ->where('type', 'ORDER_ACCEPTED')
            ->sole();

        $this->assertSame('Commande acceptée', $notification->title);
        $this->assertSame(
            "Votre commande a été acceptée avec succès par l'administrateur.",
            $notification->message,
        );
        $this->assertFalse($notification->is_read);
        $this->assertSame((string) $orderId, $notification->data['orderId']);
        $this->assertSame($product->name, $notification->data['productName']);
        $this->assertSame(2, $notification->data['quantity']);

        // Accepting an already accepted order must not duplicate the notification.
        $this->actingAs($admin)->putJson('/api/product-orders/update-status', [
            'id' => (string) $orderId,
            'status' => 'ACCEPTED',
        ])->assertStatus(200);

        $this->assertSame(1, Notification::where('user_id', $player->id)
            ->where('type', 'ORDER_ACCEPTED')
            ->count());

        // Rejecting the order does not add another notification.
        $this->actingAs($admin)->putJson('/api/product-orders/update-status', [
            'id' => (string) $orderId,
            'status' => 'REJECTED',
        ])->assertStatus(200);

        $this->assertSame(1, Notification::where('user_id', $player->id)
            ->where('type', 'ORDER_ACCEPTED')
            ->count());
    }

    public function test_notifications_are_scoped_to_the_authenticated_user(): void
    {
        $player = User::where('email', 'player@teetime.com')->firstOrFail();
        $other = User::factory()->create(['role' => 'PLAYER', 'status' => 'ACTIVE']);

        $notification = Notification::create([
            'user_id' => $player->id,
            'title' => 'Commande acceptée',
            'message' => "Votre commande a été acceptée avec succès par l'administrateur.",
            'type' => 'ORDER_ACCEPTED',
            'data' => ['orderId' => '123', 'productName' => 'Polo Golf', 'quantity' => 1],
        ]);

        $playerList = $this->actingAs($player)->getJson('/api/notifications');
        $playerList->assertStatus(200)->assertJsonFragment(['id' => (string) $notification->id]);

        $this->actingAs($other)->getJson('/api/notifications')
            ->assertStatus(200)
            ->assertJsonMissing(['id' => (string) $notification->id]);

        $this->actingAs($other)
            ->patchJson("/api/notifications/{$notification->id}/read")
            ->assertStatus(404);

        $this->assertDatabaseHas('notifications', [
            'id' => $notification->id,
            'is_read' => false,
        ]);

        $playerUnread = $this->actingAs($player)->getJson('/api/notifications/unread-count');
        $playerUnread->assertStatus(200)->assertJsonPath('data', 2);

        $this->actingAs($other)->getJson('/api/notifications/unread-count')
            ->assertStatus(200)
            ->assertJsonPath('data', 0);

        $this->actingAs($player)
            ->patchJson("/api/notifications/{$notification->id}/read")
            ->assertStatus(200)
            ->assertJsonPath('data.isRead', true);

        $this->assertDatabaseHas('notifications', [
            'id' => $notification->id,
            'is_read' => true,
        ]);

        $this->actingAs($player)->patchJson('/api/notifications/read-all')->assertStatus(200);

        $this->actingAs($player)->getJson('/api/notifications/unread-count')
            ->assertStatus(200)
            ->assertJsonPath('data', 0);
    }

    public function test_notifications_require_authentication(): void
    {
        $this->getJson('/api/notifications')->assertStatus(401);
        $this->getJson('/api/notifications/unread-count')->assertStatus(401);
        $this->patchJson('/api/notifications/read-all')->assertStatus(401);
        $this->patchJson('/api/notifications/1/read')->assertStatus(401);
    }

    public function test_private_player_endpoints_require_authentication(): void
    {
        $this->getJson('/api/dashboard/player')->assertStatus(401);
        $this->postJson('/api/reservations/player/list', [])->assertStatus(401);
        $this->postJson('/api/memberships/player/clubs', [])->assertStatus(401);
        $this->patchJson('/api/reservations/1/cancel')->assertStatus(401);
        $this->postJson('/api/reservations/add', [])->assertStatus(401);
    }

    public function test_player_dashboard_is_scoped_to_the_authenticated_player(): void
    {
        $player = User::where('email', 'player@teetime.com')->firstOrFail();
        $other = $this->createPlayer('Other', 'Golfer');

        $otherReservation = $this->createReservationFor($other, Carbon::today()->addDays(30)->setTime(9, 0));

        $playerClubId = $player->membershipRequests()
            ->where('status', 'ACCEPTED')
            ->firstOrFail()
            ->membership
            ->club_id;

        $otherClub = Club::create([
            'name' => 'Other Test Club',
            'city' => 'Rabat',
            'address' => 'Test address, Rabat',
            'status' => 'ACTIVE',
        ]);
        $otherPlan = Membership::create([
            'club_id' => $otherClub->id,
            'title' => 'Other Club Plan',
            'price' => 1000,
            'status' => 'ACTIVE',
        ]);
        MembershipRequest::create([
            'user_id' => $other->id,
            'membership_id' => $otherPlan->id,
            'status' => 'ACCEPTED',
            'start_date' => now()->toDateString(),
            'end_date' => now()->addYear()->toDateString(),
        ]);

        $playerResponse = $this->actingAs($player)->getJson('/api/dashboard/player')->assertStatus(200);

        $playerResponse->assertJsonPath(
            'data.kpis.totalReservations',
            Reservation::where('user_id', $player->id)->count(),
        );
        $playerResponse->assertJsonPath('data.kpis.clubsCount', 1);
        $playerResponse->assertJsonPath('data.myClubs.0.clubId', (string) $playerClubId);

        $playerRecentIds = collect($playerResponse->json('data.recentReservations'))->pluck('id');
        $this->assertNotContains((string) $otherReservation->id, $playerRecentIds);

        $otherResponse = $this->actingAs($other)->getJson('/api/dashboard/player')->assertStatus(200);

        $otherResponse->assertJsonPath('data.kpis.totalReservations', 1);
        $otherResponse->assertJsonPath('data.kpis.upcomingCount', 1);
        $otherResponse->assertJsonPath('data.nextReservation.reservationId', (string) $otherReservation->id);
        $otherResponse->assertJsonPath('data.kpis.clubsCount', 1);
        $otherResponse->assertJsonPath('data.myClubs.0.clubId', (string) $otherPlan->club_id);
    }

    public function test_player_dashboard_is_empty_for_a_player_without_reservations(): void
    {
        $newPlayer = $this->createPlayer('Empty', 'Player');

        $response = $this->actingAs($newPlayer)->getJson('/api/dashboard/player')->assertStatus(200);

        $response->assertJsonPath('data.kpis.totalReservations', 0)
            ->assertJsonPath('data.kpis.clubsCount', 0)
            ->assertJsonPath('data.kpis.upcomingCount', 0)
            ->assertJsonPath('data.kpis.nextTeeTime', null)
            ->assertJsonPath('data.nextReservation', null)
            ->assertJsonCount(0, 'data.recentReservations')
            ->assertJsonCount(0, 'data.myClubs');

        $this->actingAs($newPlayer)->postJson('/api/memberships/player/clubs', [])
            ->assertStatus(200)
            ->assertJsonCount(0, 'data');
    }

    public function test_player_dashboard_is_forbidden_for_non_players(): void
    {
        $manager = User::where('email', 'manager@teetime.com')->firstOrFail();

        $this->actingAs($manager)->getJson('/api/dashboard/player')->assertStatus(403);
    }

    public function test_player_reservations_only_include_the_authenticated_player(): void
    {
        $player = User::where('email', 'player@teetime.com')->firstOrFail();
        $other = $this->createPlayer('Second', 'Player');

        $otherReservation = $this->createReservationFor($other, Carbon::today()->addDays(31)->setTime(10, 0));

        $playerList = $this->actingAs($player)->postJson('/api/reservations/player/list', [])->assertStatus(200);
        $playerIds = collect($playerList->json('data'))->pluck('reservationId');

        $this->assertNotContains((string) $otherReservation->id, $playerIds);

        $otherList = $this->actingAs($other)->postJson('/api/reservations/player/list', [])->assertStatus(200);
        $otherIds = collect($otherList->json('data'))->pluck('reservationId');

        $this->assertContains((string) $otherReservation->id, $otherIds);
        $this->assertNotContains(
            (string) Reservation::where('user_id', $player->id)->firstOrFail()->id,
            $otherIds,
        );
    }

    public function test_player_cannot_cancel_someone_elses_reservation(): void
    {
        $owner = User::where('email', 'player@teetime.com')->firstOrFail();
        $intruder = $this->createPlayer('Intruder', 'Player');

        $reservation = $this->createReservationFor($owner, Carbon::today()->addDays(32)->setTime(11, 0), 'CONFIRMED');

        $this->actingAs($intruder)
            ->patchJson("/api/reservations/{$reservation->id}/cancel")
            ->assertStatus(403);

        $this->assertSame('CONFIRMED', $reservation->fresh()->status);

        $this->actingAs($owner)
            ->patchJson("/api/reservations/{$reservation->id}/cancel")
            ->assertStatus(200)
            ->assertJsonPath('data.status', 'CANCELLED');

        $this->assertSame('CANCELLED', $reservation->fresh()->status);
    }

    public function test_player_clubs_endpoint_uses_real_accepted_memberships(): void
    {
        $player = User::where('email', 'player@teetime.com')->firstOrFail();

        $clubId = $player->membershipRequests()
            ->where('status', 'ACCEPTED')
            ->firstOrFail()
            ->membership
            ->club_id;

        $this->withHeaders(['Accept-Language' => 'fr'])
            ->actingAs($player)
            ->postJson('/api/memberships/player/clubs', [])
            ->assertStatus(200)
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.clubId', (string) $clubId)
            ->assertJsonPath('data.0.clubName', "Royal Golf Anfa Mohammedia")
            ->assertJsonPath('data.0.membershipTitle', 'Cotisation Individuelle');
    }

    public function test_logout_succeeds_for_session_authenticated_users(): void
    {
        $player = User::where('email', 'player@teetime.com')->firstOrFail();

        $this->actingAs($player)
            ->postJson('/api/auth/logout')
            ->assertStatus(200)
            ->assertJsonPath('success', true);
    }

    public function test_booking_window_rolls_forward_from_tomorrow(): void
    {
        $this->assertSame(
            Carbon::tomorrow()->toDateString(),
            GolfCourse::bookingWindowStart()->toDateString(),
        );
        $this->assertSame(
            Carbon::tomorrow()->addDays(GolfCourse::BOOKING_WINDOW_DAYS - 1)->toDateString(),
            GolfCourse::bookingWindowEnd()->toDateString(),
        );
    }

    public function test_time_slot_search_only_reads_published_tee_times(): void
    {
        $before = TimeSlot::count();
        $palmGolf = GolfCourse::where('name', 'Parcours PalmGolf')->firstOrFail();
        $closedDate = $this->firstClosedDate($palmGolf);

        $response = $this->postJson('/api/time-slots/search', [
            'clubName' => 'PalmGolf',
            'city' => '',
            'address' => '',
            'date' => $closedDate,
            'page' => 0,
            'size' => 5,
        ]);

        $response->assertStatus(200)->assertJsonPath('success', true);

        $this->assertSame($before, TimeSlot::count(), 'A read must not publish tee times');
        $this->assertSame([], $response->json('data.content.0.courses.0.timeSlots'));
        $this->assertNotSame([], $response->json('data.content.0.courses.0.availableDates'));
    }

    public function test_available_dates_stay_inside_the_window_and_skip_closure_days(): void
    {
        foreach (GolfCourse::where('is_active', true)->get() as $course) {
            $dates = $this->getJson('/api/time-slots/available-dates?courseId=' . $course->id)
                ->assertStatus(200)
                ->json('data.availableDates');

            $start = GolfCourse::bookingWindowStart()->toDateString();
            $end = GolfCourse::bookingWindowEnd()->toDateString();

            $this->assertNotEmpty($dates, "course {$course->name} publishes dates");

            foreach ($dates as $date) {
                $this->assertGreaterThanOrEqual($start, $date);
                $this->assertLessThanOrEqual($end, $date);
                $this->assertFalse($course->isClosedOn($date), "course {$course->name} is closed on {$date}");
            }
        }
    }

    public function test_courses_publish_different_amounts_of_dates(): void
    {
        $palmGolf = GolfCourse::where('name', 'Parcours PalmGolf')->firstOrFail();
        $menara = GolfCourse::where('name', 'Parcours Menara')->firstOrFail();

        $this->assertLessThan(count($menara->publishedDates()), count($palmGolf->publishedDates()));
    }

    public function test_player_cannot_book_a_course_on_one_of_its_closure_days(): void
    {
        $player = User::where('email', 'player@teetime.com')->firstOrFail();
        $palmGolf = GolfCourse::where('name', 'Parcours PalmGolf')->firstOrFail();
        $before = Reservation::count();

        $this->actingAs($player)->postJson('/api/reservations', [
            'courseId' => $palmGolf->id,
            'reservationDate' => $this->firstClosedDate($palmGolf),
            'numberOfPlayers' => 2,
        ])->assertStatus(422);

        $this->assertSame($before, Reservation::count());
    }

    public function test_player_cannot_book_a_time_the_club_never_published(): void
    {
        $player = User::where('email', 'player@teetime.com')->firstOrFail();
        $course = GolfCourse::where('name', 'Parcours Menara')->firstOrFail();
        $date = $course->publishedDates()[0];

        $this->actingAs($player)->postJson('/api/reservations', [
            'courseId' => $course->id,
            'reservationDate' => $date,
            'startTime' => "{$date} 10:00:00",
            'numberOfPlayers' => 2,
        ])->assertStatus(422)
            ->assertJsonPath('message', 'No tee time is published for this course on the selected date');
    }

    public function test_player_cannot_book_a_past_date(): void
    {
        $player = User::where('email', 'player@teetime.com')->firstOrFail();
        $course = GolfCourse::where('name', 'Parcours Menara')->firstOrFail();

        $this->actingAs($player)->postJson('/api/reservations', [
            'courseId' => $course->id,
            'reservationDate' => Carbon::yesterday()->toDateString(),
            'numberOfPlayers' => 2,
        ])->assertStatus(422);
    }

    public function test_player_book_a_published_tee_time_and_the_slot_fills_up(): void
    {
        $player = User::where('email', 'player@teetime.com')->firstOrFail();
        $course = GolfCourse::where('name', 'Parcours Menara')->firstOrFail();
        $slot = $course->timeSlots()
            ->whereBetween('start_time', [GolfCourse::bookingWindowStart(), GolfCourse::bookingWindowEnd()])
            ->orderBy('start_time')
            ->firstOrFail();

        $this->actingAs($player)->postJson('/api/reservations', [
            'courseId' => $course->id,
            'reservationDate' => $slot->start_time->toDateString(),
            'startTime' => $slot->start_time->format('Y-m-d H:i:s'),
            'numberOfPlayers' => 4,
        ])->assertStatus(201)
            ->assertJsonPath('data.startTime', $slot->start_time->format('Y-m-d\TH:i:s'));

        $this->actingAs($this->createPlayer('Nadia', 'El Fassi'))
            ->postJson('/api/reservations', [
                'courseId' => $course->id,
                'reservationDate' => $slot->start_time->toDateString(),
                'startTime' => $slot->start_time->format('Y-m-d H:i:s'),
                'numberOfPlayers' => 1,
            ])->assertStatus(422)
                ->assertJsonPath('message', 'This tee time is fully booked');
    }

    public function test_manager_cannot_publish_a_tee_time_outside_the_schedule(): void
    {
        $manager = User::where('email', 'manager@teetime.com')->firstOrFail();
        $course = GolfCourse::where('name', 'Ancien Parcours')->firstOrFail();
        $before = TimeSlot::count();

        // Past day, day beyond the window and a closure day are all refused.
        foreach ([Carbon::yesterday(), GolfCourse::bookingWindowEnd()->addDay(), Carbon::parse($this->firstClosedDate($course))] as $date) {
            $this->actingAs($manager)->postJson('/api/time-slots/add', [
                'courseId' => $course->id,
                'startTime' => $date->copy()->setTime(9, 30)->format('Y-m-d H:i:s'),
                'endTime' => $date->copy()->setTime(11, 30)->format('Y-m-d H:i:s'),
            ])->assertStatus(422);
        }

        $this->assertSame($before, TimeSlot::count());
    }

    public function test_manager_publishes_a_new_tee_time_inside_the_window(): void
    {
        $manager = User::where('email', 'manager@teetime.com')->firstOrFail();
        $course = GolfCourse::where('name', 'Ancien Parcours')->firstOrFail();
        $date = Carbon::parse($course->openDatesInWindow()[0]);

        $response = $this->actingAs($manager)->postJson('/api/time-slots/add', [
            'courseId' => $course->id,
            'startTime' => $date->copy()->setTime(9, 30)->format('Y-m-d H:i:s'),
            'endTime' => $date->copy()->setTime(11, 30)->format('Y-m-d H:i:s'),
        ]);

        $response->assertStatus(201)->assertJsonPath('data.status', 'OPEN');

        $this->actingAs($manager)->postJson('/api/time-slots/add', [
            'courseId' => $course->id,
            'startTime' => $date->copy()->setTime(9, 30)->format('Y-m-d H:i:s'),
            'endTime' => $date->copy()->setTime(11, 30)->format('Y-m-d H:i:s'),
        ])->assertStatus(422)
            ->assertJsonPath('message', 'A tee time already exists at that time');

        $this->assertContains(
            $date->toDateString(),
            $this->getJson('/api/time-slots/available-dates?courseId=' . $course->id)->json('data.availableDates'),
        );
    }

    /**
     * First day of the booking window the course keeps closed for maintenance.
     */
    private function firstClosedDate(GolfCourse $course): string
    {
        $cursor = GolfCourse::bookingWindowStart();
        $end = GolfCourse::bookingWindowEnd();

        while ($cursor->lte($end)) {
            if ($course->isClosedOn($cursor)) {
                return $cursor->toDateString();
            }
            $cursor->addDay();
        }

        $this->fail("{$course->name} has no closure day inside the booking window");
    }

    private function createPlayer(string $firstName, string $lastName): User
    {
        return User::factory()->create([
            'name' => "{$firstName} {$lastName}",
            'first_name' => $firstName,
            'last_name' => $lastName,
            'role' => 'PLAYER',
            'status' => 'ACTIVE',
        ]);
    }

    private function createReservationFor(User $user, Carbon $start, string $status = 'CONFIRMED'): Reservation
    {
        $course = GolfCourse::firstOrFail();

        $slot = TimeSlot::create([
            'golf_course_id' => $course->id,
            'start_time' => $start,
            'end_time' => $start->copy()->addHours(2),
            'status' => 'OPEN',
            'max_players' => 4,
        ]);

        return Reservation::create([
            'user_id' => $user->id,
            'golf_course_id' => $course->id,
            'time_slot_id' => $slot->id,
            'reservation_date' => $start->toDateString(),
            'number_of_players' => 2,
            'status' => $status,
        ]);
    }

    private function deliveryPayload(): array
    {
        return [
            'deliveryFullName' => 'Player Teetime',
            'deliveryPhone' => '+212600000000',
            'deliveryCity' => 'Rabat',
            'deliveryAddress' => '12 Avenue Hassan II, Appartement 4',
            'deliveryDetails' => 'Ring twice',
        ];
    }

}
