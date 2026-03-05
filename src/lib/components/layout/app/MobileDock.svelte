<script lang="ts">
	import { page } from '$app/state';
	import { GitGraphIcon, HouseIcon, SettingsIcon } from '@lucide/svelte';

	interface Link {
		name: string;
		href: string;
		icon: any;
	}

	const links: Link[] = [
		{ name: 'Settings', href: '/settings', icon: SettingsIcon },

		{ name: 'Home', href: '/app', icon: HouseIcon },
		{ name: 'Analytics', href: '/app/analytics', icon: GitGraphIcon }
	];

	const active = $derived(links.find((it) => page.url.pathname.startsWith(it.href)) || links[0]);
</script>

<div class="pb-safe dock border-t border-base-300 bg-base-200">
	{#each links as link}
		{@const Icon = link.icon}
		<a href={link.href} class="dock-item {active.name === link.name ? 'dock-active' : ''}">
			<Icon size={20} />
			<span class="dock-label text-xs font-medium">{link.name}</span>
		</a>
	{/each}
</div>
