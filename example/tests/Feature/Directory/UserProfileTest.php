<?php

use App\Enums\TeamRole;
use App\Models\Team;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

// SPECSFY: US-001 FR-001 FR-002 FR-003 NFR-001 NFR-002 AC-001
test('authenticated people can inspect a user profile without receiving email', function () {
    $viewer = User::factory()->create(['name' => 'Viewer']);
    $target = User::factory()->unverified()->create([
        'name' => 'Target User',
        'email' => 'target@example.test',
    ]);
    $alpha = Team::factory()->create(['name' => 'Alpha Team']);
    $beta = Team::factory()->create(['name' => 'Beta Team']);
    $alpha->members()->attach($target, ['role' => TeamRole::Admin->value]);
    $beta->members()->attach($target, ['role' => TeamRole::Member->value]);

    $this
        ->actingAs($viewer)
        ->get(route('directory.users.show', $target))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('directory/users/show')
            ->where('user.id', $target->id)
            ->where('user.name', 'Target User')
            ->where('user.isVerified', false)
            ->where('user.joinedAt', $target->created_at->toDateString())
            ->missing('user.email')
            ->where('user.teams', fn ($teams) => collect($teams)
                ->contains(fn (array $team) => $team['name'] === 'Alpha Team'
                    && $team['role'] === TeamRole::Admin->value)
                && collect($teams)->contains(fn (array $team) => $team['name'] === 'Beta Team'
                    && $team['role'] === TeamRole::Member->value)),
        );
});

// SPECSFY: US-001 FR-001 FR-002 FR-003 NFR-001 NFR-002 AC-002
test('user profile presents an explicit empty team list', function () {
    $viewer = User::factory()->create(['name' => 'Viewer']);
    $target = User::factory()->create(['name' => 'User Without Teams']);
    $target->personalTeam()?->delete();

    $this
        ->actingAs($viewer)
        ->get(route('directory.users.show', $target))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('directory/users/show')
            ->where('user.name', $target->name)
            ->where('user.isVerified', true)
            ->where('user.joinedAt', $target->created_at->toDateString())
            ->has('user.teams', 0)
            ->missing('user.email'),
        );
});

// SPECSFY: US-001 FR-001 FR-002 FR-003 NFR-001 NFR-002 AC-003
test('the profile shows the personal team and its owner role', function () {
    $viewer = User::factory()->create();
    $target = User::factory()->create();
    $team = $target->personalTeam();

    $this
        ->actingAs($viewer)
        ->get(route('directory.users.show', $target))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('directory/users/show')
            ->where('user.name', $target->name)
            ->where('user.isVerified', true)
            ->where('user.joinedAt', $target->created_at->toDateString())
            ->has('user.teams', 1)
            ->where('user.teams.0.name', $team->name)
            ->where('user.teams.0.isPersonal', true)
            ->where('user.teams.0.role', TeamRole::Owner->value)
            ->where('user.teams.0.roleLabel', TeamRole::Owner->label())
            ->missing('user.email'),
        );
});

// SPECSFY: US-001 FR-001 AC-001
test('user profile requires authentication', function () {
    $target = User::factory()->create();

    $this
        ->get(route('directory.users.show', $target))
        ->assertRedirect(route('login'));
});

// SPECSFY: US-001 FR-001 AC-001
test('missing user profiles return not found', function () {
    $viewer = User::factory()->create();

    $this
        ->actingAs($viewer)
        ->get(route('directory.users.show', 999999))
        ->assertNotFound();
});
