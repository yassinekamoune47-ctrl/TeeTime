<?php

namespace Tests\Feature;

use App\Models\Tournament;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * APEX Network functional corrections: roles, authentication, account
 * creation, profile rules and the tournament lifecycle.
 */
class ApexComplianceTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
    }

    /** APEX tournaments belong to the ADMIN_APEX role, never to the platform ADMIN. */
    private function apexAdmin(): User
    {
        return User::where('role', User::ROLE_ADMIN_APEX)->firstOrFail();
    }

    private function platformAdmin(): User
    {
        return User::where('role', User::ROLE_ADMIN)->firstOrFail();
    }

    private function player(): User
    {
        return User::where('role', 'PLAYER')->firstOrFail();
    }

    private function manager(): User
    {
        return User::where('role', 'MANAGER')->firstOrFail();
    }

    private function tournamentPayload(array $overrides = []): array
    {
        return array_merge([
            'name' => 'Apex Test Tournament',
            'description' => 'Created by the APEX compliance suite.',
            'date' => '2027-03-14',
            'location' => 'Rabat',
            'entryFee' => 900,
            'maxParticipants' => 40,
        ], $overrides);
    }

    private function createAsApexAdmin(array $overrides = []): Tournament
    {
        $response = $this->actingAs($this->apexAdmin())->postJson('/api/tournaments', $this->tournamentPayload($overrides));

        $response->assertStatus(201);

        return Tournament::findOrFail($response->json('data.id'));
    }

    // ─── STEP 2 — Login ──────────────────────────────────────────────────────

    public function test_login_is_email_and_password_only(): void
    {
        $this->postJson('/api/login', ['email' => 'player@teetime.com', 'password' => 'password123'])
            ->assertStatus(200)
            ->assertJsonPath('data.role', 'PLAYER');
    }

    public function test_username_never_authenticates(): void
    {
        // The seeded admin's name is also its historical "username".
        $this->postJson('/api/login', ['email' => 'Admin TeeTime', 'password' => 'password123'])
            ->assertStatus(422);

        $this->postJson('/api/login', ['email' => 'admin', 'password' => 'password123'])
            ->assertStatus(422);
    }

    public function test_invalid_credentials_are_rejected(): void
    {
        $this->postJson('/api/login', ['email' => 'player@teetime.com', 'password' => 'wrong-password'])
            ->assertStatus(401);

        $this->postJson('/api/login', ['email' => 'ghost@teetime.com', 'password' => 'password123'])
            ->assertStatus(401);

        $this->assertNull(auth()->user());
    }

    // ─── STEP 3 — Account creation ───────────────────────────────────────────

    public function test_signup_requires_every_mandatory_field(): void
    {
        $response = $this->postJson('/api/auth/sign-up', [
            'email' => 'newplayer@teetime.com',
            'password' => 'secret123',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['firstName', 'lastName', 'gender', 'countryCallingCode', 'phoneNumber']);

        $this->assertNull(User::where('email', 'newplayer@teetime.com')->first());
    }

    public function test_signup_requires_a_license_or_a_handicap(): void
    {
        $this->postJson('/api/auth/sign-up', $this->signUpPayload())->assertStatus(422)
            ->assertJsonValidationErrors(['frmglLicenseNumber', 'currentHandicap']);

        $this->postJson('/api/auth/sign-up', $this->signUpPayload(['frmglLicenseNumber' => 'FRMG-456']))
            ->assertStatus(201);

        $this->postJson('/api/auth/sign-up', $this->signUpPayload(['email' => 'h@teetime.com', 'currentHandicap' => 12.5]))
            ->assertStatus(201);
    }

    public function test_signup_accepts_only_handicaps_between_zero_and_eighteen(): void
    {
        foreach ([18.5, -0.5, 40] as $handicap) {
            $this->postJson('/api/auth/sign-up', $this->signUpPayload(['currentHandicap' => $handicap]))
                ->assertStatus(422)
                ->assertJsonValidationErrors(['currentHandicap']);
        }

        $this->postJson('/api/auth/sign-up', $this->signUpPayload(['email' => 'edge@teetime.com', 'currentHandicap' => 18.0]))
            ->assertStatus(201);
    }

    public function test_signup_never_assigns_a_gender_on_its_own(): void
    {
        $this->postJson('/api/auth/sign-up', $this->signUpPayload(['gender' => null]))
            ->assertStatus(422)
            ->assertJsonValidationErrors(['gender']);

        $response = $this->postJson('/api/auth/sign-up', $this->signUpPayload(['gender' => 'FEMALE', 'frmglLicenseNumber' => 'FRMG-1']));

        $response->assertStatus(201)->assertJsonPath('data.gender', 'FEMALE');
        $this->assertSame('FEMALE', User::find($response->json('data.id'))->gender);
    }

    private function signUpPayload(array $overrides = []): array
    {
        return array_merge([
            'firstName' => 'Amina',
            'lastName' => 'Chraibi',
            'email' => 'amina@teetime.com',
            'password' => 'secret123',
            'gender' => 'FEMALE',
            'countryCallingCode' => '+212',
            'phoneNumber' => '661223344',
        ], $overrides);
    }

    // ─── STEP 4 — My profile ─────────────────────────────────────────────────

    public function test_profile_update_rejects_incomplete_data(): void
    {
        $this->patchProfile(['firstName' => '', 'lastName' => 'Bennani', 'gender' => 'MALE'])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['firstName']);

        // An unselected gender is never filled in automatically.
        $this->patchProfile(['gender' => ''])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['gender']);

        $this->patchProfile(['countryCallingCode' => ''])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['countryCallingCode']);
    }

    public function test_profile_update_succeeds_with_valid_data(): void
    {
        $response = $this->patchProfile([
            'firstName' => 'Youssef',
            'lastName' => 'Bennani El Fassi',
            'gender' => 'MALE',
            'countryCallingCode' => '+212',
            'phoneNumber' => '662000003',
            'bio' => 'Golfeur amateur',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.lastName', 'Bennani El Fassi')
            ->assertJsonPath('data.bio', 'Golfeur amateur');
    }

    public function test_profile_update_cannot_touch_official_tournament_data(): void
    {
        $player = $this->player();
        $player->update(['frmgl_license_number' => 'FRMG-0001', 'current_handicap' => 12.5]);

        $this->patchProfile([
            'firstName' => 'Youssef',
            'lastName' => 'Bennani',
            'gender' => 'MALE',
            'countryCallingCode' => '+212',
            'phoneNumber' => '662000003',
            'frmglLicenseNumber' => 'FRMG-9999',
            'currentHandicap' => 3.4,
        ])->assertStatus(200);

        $player->refresh();
        $this->assertSame('FRMG-0001', $player->frmgl_license_number);
        $this->assertSame('12.5', (string) $player->current_handicap);
    }

    private function patchProfile(array $overrides): \Illuminate\Testing\TestResponse
    {
        return $this->actingAs($this->player())->patchJson('/api/users/updateMyData', array_merge([
            'firstName' => 'Youssef',
            'lastName' => 'Bennani',
            'gender' => 'MALE',
            'countryCallingCode' => '+212',
            'phoneNumber' => '662000003',
            'bio' => '',
            'birthDate' => null,
        ], $overrides));
    }

    // ─── STEP 1 & 5 — Tournament permissions and lifecycle ───────────────────

    public function test_only_the_apex_admin_lists_every_tournament(): void
    {
        $this->postJson('/api/tournaments/search', [])->assertStatus(401);

        $this->actingAs($this->player())->postJson('/api/tournaments/search', [])->assertStatus(403);
        $this->actingAs($this->manager())->postJson('/api/tournaments/search', [])->assertStatus(403);
        $this->actingAs($this->platformAdmin())->postJson('/api/tournaments/search', [])->assertStatus(403);

        $names = $this->actingAs($this->apexAdmin())
            ->postJson('/api/tournaments/search', ['page' => 0, 'size' => 50])
            ->assertStatus(200)
            ->json('data');

        $this->assertContains('Open de Casablanca 2026', array_column((array) $names, 'name'));
    }

    public function test_public_search_hides_drafts(): void
    {
        $statuses = $this->postJson('/api/tournaments/public-search', ['page' => 0, 'size' => 50])
            ->assertStatus(200)
            ->json('data');

        $this->assertNotContains('BROUILLON', array_column((array) $statuses, 'status'));
        $this->assertContains('Trophée Hassan II Pro-Am', array_column((array) $statuses, 'name'));
    }

    public function test_players_and_managers_cannot_create_edit_or_delete_tournaments(): void
    {
        $draft = Tournament::where('status', Tournament::STATUS_BROUILLON)->firstOrFail();

        $this->actingAs($this->player())->postJson('/api/tournaments', $this->tournamentPayload())->assertStatus(403);
        $this->actingAs($this->manager())->postJson('/api/tournaments', $this->tournamentPayload())->assertStatus(403);

        $this->actingAs($this->player())->putJson('/api/tournaments', ['id' => $draft->id, 'name' => 'Hijacked'])->assertStatus(403);
        $this->actingAs($this->manager())->putJson('/api/tournaments', ['id' => $draft->id, 'name' => 'Hijacked'])->assertStatus(403);

        $this->actingAs($this->player())->deleteJson("/api/tournaments/{$draft->id}")->assertStatus(403);
        $this->actingAs($this->manager())->deleteJson("/api/tournaments/{$draft->id}")->assertStatus(403);

        $this->assertSame('Open de Casablanca 2026', $draft->fresh()->name);
    }

    public function test_platform_admin_cannot_manage_apex_tournaments(): void
    {
        $draft = Tournament::where('status', Tournament::STATUS_BROUILLON)->firstOrFail();
        $admin = $this->platformAdmin();

        $this->actingAs($admin)->postJson('/api/tournaments', $this->tournamentPayload())->assertStatus(403);
        $this->actingAs($admin)->putJson('/api/tournaments', ['id' => $draft->id, 'name' => 'Renamed by ADMIN'])->assertStatus(403);
        $this->actingAs($admin)->deleteJson("/api/tournaments/{$draft->id}")->assertStatus(403);

        $this->assertSame('Open de Casablanca 2026', $draft->fresh()->name);
    }

    public function test_a_hand_written_admin_apex_role_is_recognised(): void
    {
        $user = $this->platformAdmin();
        $user->forceFill(['role' => 'Admin APEX'])->save();

        $data = $this->postJson('/api/login', ['email' => $user->email, 'password' => 'password123'])
            ->assertStatus(200)
            ->assertJsonPath('data.role', User::ROLE_ADMIN_APEX)
            ->json('data');

        $this->actingAs(User::findOrFail($data['id']))
            ->postJson('/api/tournaments', $this->tournamentPayload(['name' => 'Apex Spell Test Tournament']))
            ->assertStatus(201)
            ->assertJsonPath('data.status', Tournament::STATUS_BROUILLON);
    }

    public function test_a_new_tournament_starts_as_a_draft_without_opening_registrations(): void
    {
        $tournament = $this->createAsApexAdmin();

        $this->assertSame(Tournament::STATUS_BROUILLON, $tournament->status);
        $this->assertSame(0, (int) $tournament->current_participants);

        $this->postJson('/api/tournaments/public-search', ['q' => 'Apex Test Tournament', 'page' => 0, 'size' => 10])
            ->assertJsonCount(0, 'data');
    }

    public function test_creation_rejects_invalid_details(): void
    {
        $this->actingAs($this->apexAdmin())->postJson('/api/tournaments', $this->tournamentPayload(['location' => '']))
            ->assertStatus(422)->assertJsonValidationErrors(['location']);

        $this->actingAs($this->apexAdmin())->postJson('/api/tournaments', $this->tournamentPayload(['entryFee' => -50]))
            ->assertStatus(422)->assertJsonValidationErrors(['entryFee']);

        $this->actingAs($this->apexAdmin())->postJson('/api/tournaments', $this->tournamentPayload(['maxParticipants' => 0]))
            ->assertStatus(422)->assertJsonValidationErrors(['maxParticipants']);

        $this->actingAs($this->apexAdmin())->postJson('/api/tournaments', $this->tournamentPayload(['date' => 'not-a-date']))
            ->assertStatus(422)->assertJsonValidationErrors(['date']);
    }

    public function test_lifecycle_only_allows_the_next_official_status(): void
    {
        $tournament = $this->createAsApexAdmin();

        $flow = [
            Tournament::STATUS_INSCRIPTIONS_OUVERTES,
            Tournament::STATUS_INSCRIPTIONS_FERMEES,
            Tournament::STATUS_AVANT_TOURNOI,
            Tournament::STATUS_EN_DIRECT,
            Tournament::STATUS_TERMINE,
            Tournament::STATUS_RESULTATS_PUBLIES,
            Tournament::STATUS_ARCHIVE,
        ];

        foreach ($flow as $status) {
            $this->actingAs($this->apexAdmin())
                ->putJson('/api/tournaments', ['id' => $tournament->id, 'status' => $status])
                ->assertStatus(200);

            $tournament->refresh();
            $this->assertSame($status, $tournament->status);
        }

        // Archived is terminal.
        $this->actingAs($this->apexAdmin())
            ->putJson('/api/tournaments', ['id' => $tournament->id, 'status' => Tournament::STATUS_EN_DIRECT])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['status']);

        $this->assertSame(Tournament::STATUS_ARCHIVE, $tournament->fresh()->status);
    }

    public function test_skipping_ahead_in_the_lifecycle_is_rejected(): void
    {
        $tournament = $this->createAsApexAdmin();

        $this->actingAs($this->apexAdmin())
            ->putJson('/api/tournaments', ['id' => $tournament->id, 'status' => Tournament::STATUS_EN_DIRECT])
            ->assertStatus(422);

        $this->assertSame(Tournament::STATUS_BROUILLON, $tournament->fresh()->status);

        // The admin list exposes the authorised next statuses to the UI.
        $next = $this->actingAs($this->apexAdmin())
            ->postJson('/api/tournaments/search', ['q' => 'Apex Test Tournament', 'page' => 0, 'size' => 10])
            ->json('data.0.nextStatuses');

        $this->assertSame([Tournament::STATUS_INSCRIPTIONS_OUVERTES, Tournament::STATUS_ARCHIVE], $next);
    }

    public function test_admin_search_combines_every_filter(): void
    {
        $this->createAsApexAdmin(['name' => 'Apex Rabat Draft', 'location' => 'Rabat']);
        $this->createAsApexAdmin(['name' => 'Apex Marrakech Draft', 'location' => 'Marrakech']);

        $narrowed = $this->actingAs($this->apexAdmin())->postJson('/api/tournaments/search', [
            'q' => 'Apex',
            'location' => 'Rabat',
            'status' => Tournament::STATUS_BROUILLON,
            'page' => 0,
            'size' => 50,
        ])->assertStatus(200)->json('data');

        $this->assertSame(['Apex Rabat Draft'], array_column((array) $narrowed, 'name'));

        // A filter that contradicts the text search must not widen the result set.
        $contradictory = $this->actingAs($this->apexAdmin())->postJson('/api/tournaments/search', [
            'q' => 'Apex Rabat Draft',
            'status' => Tournament::STATUS_ARCHIVE,
            'page' => 0,
            'size' => 50,
        ])->assertStatus(200)->json('data');

        $this->assertCount(0, $contradictory);
    }

    public function test_admin_can_edit_tournament_details(): void
    {
        $tournament = $this->createAsApexAdmin();

        $this->actingAs($this->apexAdmin())
            ->putJson('/api/tournaments', [
                'id' => $tournament->id,
                'name' => 'Apex Renamed Tournament',
                'entryFee' => 1500,
                'maxParticipants' => 80,
                'date' => '2027-05-02',
            ])
            ->assertStatus(200)
            ->assertJsonPath('data.name', 'Apex Renamed Tournament');

        $tournament->refresh();
        $this->assertSame(1500, (int) $tournament->entry_fee);
        $this->assertSame(80, (int) $tournament->max_participants);
        // Editing details never changes the lifecycle status.
        $this->assertSame(Tournament::STATUS_BROUILLON, $tournament->status);
    }

    public function test_admin_can_delete_a_tournament(): void
    {
        $tournament = $this->createAsApexAdmin();

        $this->actingAs($this->apexAdmin())->deleteJson("/api/tournaments/{$tournament->id}")
            ->assertStatus(200);

        $this->assertNull(Tournament::find($tournament->id));
    }

    public function test_tournament_dto_exposes_no_invented_participant_counter(): void
    {
        $dto = $this->actingAs($this->apexAdmin())
            ->postJson('/api/tournaments/search', ['page' => 0, 'size' => 50])
            ->json('data.0');

        $this->assertIsArray($dto);
        $this->assertArrayNotHasKey('currentParticipants', (array) $dto);
        $this->assertArrayHasKey('maxParticipants', (array) $dto);
    }
}
