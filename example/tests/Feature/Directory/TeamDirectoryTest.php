<?php

use App\Enums\TeamRole;
use App\Models\Team;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

// SPECSFY: US-001 FR-001 FR-002 FR-003 NFR-001 NFR-002 AC-001
test('authenticated people can browse all active teams with member counts', function () {
    $viewer = User::factory()->create(['name' => 'Viewer']);
    $member = User::factory()->create(['name' => 'Member']);
    $alpha = Team::factory()->create(['name' => 'Alpha Shared']);
    $alpha->members()->attach($viewer, ['role' => TeamRole::Owner->value]);
    $alpha->members()->attach($member, ['role' => TeamRole::Member->value]);
    Team::factory()->trashed()->create(['name' => 'Deleted Team']);

    $this
        ->actingAs($viewer)
        ->get(route('directory.teams.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('directory/teams/index')
            ->has('userTeams', 2)
            ->where('teams.data', fn ($teams) => collect($teams)
                ->contains(fn (array $team) => $team['name'] === 'Alpha Shared'
                    && $team['isPersonal'] === false
                    && $team['membersCount'] === 2)
                && collect($teams)->contains(fn (array $team) => $team['isPersonal'] === true
                    && $team['membersCount'] === 1)
                && collect($teams)->doesntContain(fn (array $team) => $team['name'] === 'Deleted Team'))
            ->where('teams.meta.perPage', 15),
        );
});

// SPECSFY: US-001 FR-001 FR-002 FR-003 NFR-001 NFR-002 AC-002
test('team directory presents an explicit empty result', function () {
    $viewer = User::factory()->create(['name' => 'Viewer']);
    $viewer->personalTeam()?->delete();

    $this
        ->actingAs($viewer)
        ->get(route('directory.teams.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('directory/teams/index')
            ->has('teams.data', 0)
            ->where('teams.meta.perPage', 15)
            ->where('teams.meta.total', 0),
        );
});

// SPECSFY: US-001 FR-001 FR-002 FR-003 NFR-001 NFR-002 AC-003
test('team directory paginates with a stable order', function () {
    $viewer = User::factory()->create(['name' => 'Viewer']);

    foreach (range(1, 15) as $number) {
        Team::factory()->create(['name' => sprintf('Shared %02d', $number)]);
    }

    $this
        ->actingAs($viewer)
        ->get(route('directory.teams.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('directory/teams/index')
            ->has('teams.data', 15)
            ->where('teams.data.0.name', 'Shared 01')
            ->where('teams.meta.total', 16)
            ->where('teams.meta.currentPage', 1),
        );

    $this
        ->actingAs($viewer)
        ->get(route('directory.teams.index', ['page' => 2]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('teams.data', 1)
            ->where('teams.data.0.isPersonal', true)
            ->where('teams.data.0.membersCount', 1)
            ->where('teams.meta.currentPage', 2),
        );
});

// SPECSFY: US-001 FR-001 AC-001
test('team directory requires authentication', function () {
    $this
        ->get(route('directory.teams.index'))
        ->assertRedirect(route('login'));
});
