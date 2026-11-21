<?php

use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

// SPECSFY: US-001 FR-001 FR-002 FR-003 NFR-001 NFR-002 AC-001
test('authenticated people can browse a private paginated user directory', function () {
    $viewer = User::factory()->create(['name' => 'Viewer']);

    foreach (range(1, 15) as $number) {
        User::factory()->create([
            'name' => sprintf('User %02d', $number),
            'email' => sprintf('user-%02d@example.test', $number),
        ]);
    }

    $this
        ->actingAs($viewer)
        ->get(route('directory.users.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('directory/users/index')
            ->has('users.data', 15)
            ->where('users.data.0.name', 'User 01')
            ->where('users.data.0.isVerified', true)
            ->where('users.data.0.teamsCount', 1)
            ->where('users.data.0.joinedAt', fn ($date) => is_string($date))
            ->missing('users.data.0.email')
            ->where('users.meta.total', 16)
            ->where('users.meta.perPage', 15)
            ->where('users.meta.currentPage', 1)
            ->where('users.links.previous', null)
            ->where('filters.q', ''),
        );
});

// SPECSFY: US-001 FR-001 FR-002 FR-003 NFR-001 NFR-002 AC-002
test('the user directory exposes verification and team counts without exposing email', function () {
    $viewer = User::factory()->create(['name' => 'Viewer']);
    $target = User::factory()->unverified()->create(['name' => 'Ana']);

    $this
        ->actingAs($viewer)
        ->get(route('directory.users.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('directory/users/index')
            ->has('users.data', 2)
            ->where('users.meta.perPage', 15)
            ->where('users.data.0.name', $target->name)
            ->where('users.data.0.isVerified', false)
            ->where('users.data.0.teamsCount', 1)
            ->where('users.data.0.joinedAt', $target->created_at->toDateString())
            ->missing('users.data.0.email'),
        );
});

// SPECSFY: US-001 FR-001 FR-002 FR-003 NFR-001 NFR-002 AC-003
test('the second page contains the remaining user with the same public fields', function () {
    $viewer = User::factory()->create(['name' => 'Viewer']);
    foreach (range(1, 15) as $number) {
        User::factory()->create(['name' => sprintf('User %02d', $number)]);
    }

    $this
        ->actingAs($viewer)
        ->get(route('directory.users.index', ['page' => 2]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('directory/users/index')
            ->has('users.data', 1)
            ->where('users.data.0.name', 'Viewer')
            ->where('users.data.0.isVerified', true)
            ->where('users.data.0.teamsCount', 1)
            ->where('users.data.0.joinedAt', $viewer->created_at->toDateString())
            ->where('users.meta.currentPage', 2)
            ->missing('users.data.0.email'),
        );
});

// SPECSFY: US-001 FR-001 AC-001
test('guests cannot browse the user directory', function () {
    $this
        ->get(route('directory.users.index'))
        ->assertRedirect(route('login'));
});
