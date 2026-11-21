<?php

use App\Enums\TeamRole;
use App\Models\Team;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

// SPECSFY: US-001 FR-001 FR-002 FR-003 NFR-001 NFR-002 AC-001
test('authenticated people can inspect a team roster without member emails', function () {
    $viewer = User::factory()->create(['name' => 'Viewer']);
    $owner = User::factory()->create(['name' => 'Charlie Owner']);
    $admin = User::factory()->create(['name' => 'Alpha Admin']);
    $member = User::factory()->create(['name' => 'Beta Member']);
    $team = Team::factory()->create(['name' => 'Example Team']);
    $team->members()->attach($owner, ['role' => TeamRole::Owner->value]);
    $team->members()->attach($admin, ['role' => TeamRole::Admin->value]);
    $team->members()->attach($member, ['role' => TeamRole::Member->value]);

    $this
        ->actingAs($viewer)
        ->get(route('directory.teams.show', $team))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('directory/teams/show')
            ->where('team.name', 'Example Team')
            ->where('team.membersCount', 3)
            ->has('team.members', 3)
            ->where('team.members.0.name', 'Alpha Admin')
            ->where('team.members.0.role', TeamRole::Admin->value)
            ->where('team.members.1.name', 'Beta Member')
            ->where('team.members.2.name', 'Charlie Owner')
            ->missing('team.members.0.email'),
        );
});

// SPECSFY: US-001 FR-001 FR-002 FR-003 NFR-001 NFR-002 AC-002
test('empty teams expose an explicit empty roster', function () {
    $viewer = User::factory()->create();
    $team = Team::factory()->create(['name' => 'Empty Team']);

    $this
        ->actingAs($viewer)
        ->get(route('directory.teams.show', $team))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('directory/teams/show')
            ->where('team.name', $team->name)
            ->where('team.membersCount', 0)
            ->has('team.members', 0),
        );
});

// SPECSFY: US-001 FR-001 FR-002 FR-003 NFR-001 NFR-002 AC-003
test('a personal team shows only its owner without exposing email', function () {
    $viewer = User::factory()->create();
    $owner = User::factory()->create();
    $team = $owner->personalTeam();

    $this
        ->actingAs($viewer)
        ->get(route('directory.teams.show', $team))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('directory/teams/show')
            ->where('team.name', $team->name)
            ->where('team.isPersonal', true)
            ->where('team.membersCount', 1)
            ->has('team.members', 1)
            ->where('team.members.0.name', $owner->name)
            ->where('team.members.0.role', TeamRole::Owner->value)
            ->where('team.members.0.roleLabel', TeamRole::Owner->label())
            ->missing('team.members.0.email'),
        );
});

// SPECSFY: US-001 FR-001 AC-001
test('missing team details return not found', function () {
    $viewer = User::factory()->create();

    $this
        ->actingAs($viewer)
        ->get(route('directory.teams.show', 'missing-team'))
        ->assertNotFound();
});

// SPECSFY: US-001 FR-001 AC-001
test('team details require authentication', function () {
    $team = Team::factory()->create();

    $this
        ->get(route('directory.teams.show', $team))
        ->assertRedirect(route('login'));
});
