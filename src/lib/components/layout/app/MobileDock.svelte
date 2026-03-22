<script lang="ts">
	import { page } from '$app/state';
	import type { Component } from 'svelte';
	import { HouseIcon, MessageCircle, Route, SettingsIcon } from '@lucide/svelte';

	interface Link {
		name: string;
		href: string;
		icon: Component;
	}

	const ROUTES = {
		SETTINGS: '/settings',
		COMMUNITY: '/community',
		HOME: '/app'
	} as const;

	const LABELS = {
		SETTINGS: 'Settings',
		COMMUNITY: 'Community',
		HOME: 'Home'
	} as const;

	const ICON_SIZE = 24;

	const links: Link[] = [
		{ name: LABELS.HOME, href: ROUTES.HOME, icon: HouseIcon },
		{ name: LABELS.COMMUNITY, href: ROUTES.COMMUNITY, icon: MessageCircle },
		{ name: LABELS.SETTINGS, href: ROUTES.SETTINGS, icon: SettingsIcon }
	];

	const active = $derived(
		links
			.toSorted((a, b) => b.href.length - a.href.length)
			.find((it) => page.url.pathname.startsWith(it.href)) ?? links[0]
	);
</script>

<div class="h-28"></div>
<div
	class="dock z-100 rounded-t-3xl bg-linear-to-t from-primary/10 to-secondary/5 pb-safe shadow-lg backdrop-blur-sm"
>
	{#each links as link}
		{@const Icon = link.icon}
		<a
			href={link.href}
			class="dock-item {active.name === link.name
				? 'dock-active'
				: ''} transition-all duration-300 hover:scale-105"
			aria-current={active.name === link.name ? 'page' : undefined}
		>
			<Icon
				size={ICON_SIZE}
				class={active.name === link.name ? 'animate-pulse text-primary' : 'text-base-content/70'}
			/>
			<span class="dock-label text-xs font-medium transition-colors duration-300">{link.name}</span>
		</a>
	{/each}
</div>
