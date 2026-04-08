<script lang="ts">
	import { page } from '$app/state';
	import type { Component } from 'svelte';
	import { HouseIcon, MessageCircle, SettingsIcon } from '@lucide/svelte';
	import { resolve } from '$app/paths';
	import { hapticImpact } from '$util/haptics';

	interface Link {
		name: string;
		href: string;
		icon: Component;
	}

	const ROUTES = {
		SETTINGS: '/settings',
		JOURNAL: '/journal',
		HOME: '/app'
	} as const;

	const LABELS = {
		SETTINGS: 'Settings',
		JOURNAL: 'Journal',
		HOME: 'Home'
	} as const;

	const ICON_SIZE = 20;

	const links: Link[] = [
		{ name: LABELS.HOME, href: ROUTES.HOME, icon: HouseIcon },
		{ name: LABELS.JOURNAL, href: ROUTES.JOURNAL, icon: MessageCircle },
		{ name: LABELS.SETTINGS, href: ROUTES.SETTINGS, icon: SettingsIcon }
	];

	const active = $derived(
		links
			.toSorted((a, b) => b.href.length - a.href.length)
			.find((it) => page.url.pathname.startsWith(it.href)) ?? links[0]
	);

	async function handleTap() {
		await hapticImpact('light');
	}
</script>

<div class="h-20"></div>
<div
	class="fixed inset-x-0 bottom-0 z-50 border-t border-base-content/10 bg-base-100/95 pt-2 pb-safe"
>
	<div class="flex h-14 items-center justify-around px-4">
		{#each links as link (link.name)}
			{@const Icon = link.icon}
			{@const isActive = active.name === link.name}
			<a
				href={resolve(link.href as '/app' | '/journal' | '/settings')}
				onclick={handleTap}
				class="group flex flex-1 flex-col items-center justify-center gap-0.5 py-1.5 transition-all duration-200 active:scale-95"
				aria-current={isActive ? 'page' : undefined}
			>
				<Icon
					size={ICON_SIZE}
					strokeWidth={1.75}
					class="transition-colors duration-200 {isActive
						? 'text-primary'
						: 'text-base-content/40 group-hover:text-base-content/60'}"
				/>
				<span
					class="text-2xs transition-colors duration-200 {isActive
						? 'font-medium text-primary'
						: 'text-base-content/40 group-hover:text-base-content/60'}"
				>
					{link.name}
				</span>
			</a>
		{/each}
	</div>
</div>
