<?php

use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

// SPECSFY: US-001 FR-001 FR-002 FR-003 NFR-001 NFR-002 AC-001
test('user search matches names case insensitively and normalizes the query', function () {
    $viewer = User::factory()->create(['name' => 'Viewer']);
    User::factory()->create(['name' => 'Ana Clara']);
    User::factory()->create(['name' => 'ANABEL']);
    User::factory()->create(['name' => 'Bruno']);

    $this
        ->actingAs($viewer)
        ->get(route('directory.users.index', ['q' => '  ana  ']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('users.data', 2)
            ->where('users.data.0.name', 'Ana Clara')
            ->where('users.data.1.name', 'ANABEL')
            ->where('filters.q', 'ana'),
        );
});

// SPECSFY: US-001 FR-001 FR-002 FR-003 NFR-001 NFR-002 AC-002
test('user search preserves its query while paginating', function () {
    $viewer = User::factory()->create(['name' => 'Viewer']);

    foreach (range(1, 16) as $number) {
        User::factory()->create(['name' => sprintf('Target %02d', $number)]);
    }

    $this
        ->actingAs($viewer)
        ->get(route('directory.users.index', ['q' => 'target']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('users.data', 15)
            ->where('users.meta.total', 16)
            ->where('users.links.next', fn (string $url) => str_contains($url, 'q=target')),
        );
});

// SPECSFY: US-001 FR-001 FR-002 FR-003 NFR-001 NFR-002 AC-003
test('user search returns an explicit empty result', function () {
    $viewer = User::factory()->create(['name' => 'Viewer']);

    $this
        ->actingAs($viewer)
        ->get(route('directory.users.index', ['q' => 'missing person']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('users.data', 0)
            ->where('users.meta.total', 0)
            ->where('filters.q', 'missing person'),
        );
});

test('user search caps the normalized query at one hundred characters', function () {
    $viewer = User::factory()->create(['name' => 'Viewer']);

    $this
        ->actingAs($viewer)
        ->get(route('directory.users.index', ['q' => str_repeat('a', 101)]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('filters.q', str_repeat('a', 100)),
        );
});
