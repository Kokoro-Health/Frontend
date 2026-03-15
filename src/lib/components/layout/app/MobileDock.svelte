<script lang="ts">
	import { page } from '$app/state';
	import type { Component } from 'svelte';
	import { GitGraphIcon, HouseIcon, SettingsIcon } from '@lucide/svelte';

	interface Link {
		name: string;
		href: string;
		icon: Component;
	}

	const ROUTES = {
		SETTINGS: '/settings',
		HOME: '/app'
	} as const;

	const LABELS = {
		SETTINGS: 'Settings',
		HOME: 'Home'
	} as const;

	const ICON_SIZE = 20;

	const links: Link[] = [
		{ name: LABELS.HOME, href: ROUTES.HOME, icon: HouseIcon },
		{ name: LABELS.SETTINGS, href: ROUTES.SETTINGS, icon: SettingsIcon }
	];

	const active = $derived(
		links
			.toSorted((a, b) => b.href.length - a.href.length)
			.find((it) => page.url.pathname.startsWith(it.href)) ?? links[0]
	);
</script>

<div class="dock z-100 bg-base-200 pb-safe">
	{#each links as link}
		{@const Icon = link.icon}
		<a
			href={link.href}
			class="dock-item {active.name === link.name ? 'dock-active' : ''}"
			aria-current={active.name === link.name ? 'page' : undefined}
		>
			<Icon size={ICON_SIZE} />
			<span class="dock-label text-xs font-medium">{link.name}</span>
		</a>
	{/each}
</div>
