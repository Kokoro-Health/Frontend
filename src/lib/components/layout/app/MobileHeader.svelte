<script lang="ts">
	import { afterNavigate } from '$app/navigation';
	import { page } from '$app/state';
	import { ArrowLeftIcon } from '@lucide/svelte';
	import { onMount } from 'svelte';

	const baseRoute = '/app';

	let title = $state('');
	let description = $state('');
	let isHomePage = $derived(page.url.pathname === baseRoute);

	afterNavigate(updateHeaderState);

	onMount(updateHeaderState);

	function updateHeaderState() {
		title = document.title;
		const meta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
		description = meta?.content ?? '';
	}

	function navigateBack() {
		if (page.url.pathname === baseRoute) {
			window.location.href = baseRoute;
		} else {
			window.history.back();
		}
	}
</script>

<div class="h-32 pt-safe"></div>

<header class="fixed inset-x-0 top-0 z-50 flex h-32 flex-col space-y-3 bg-base-100">
	<div class="flex h-16 items-center justify-between px-4 pt-safe">
		<h1 class="max-w-[70%] truncate text-xl leading-tight font-bold text-base-content">
			{title}
		</h1>

		{#if !isHomePage}
			<button class="btn btn-circle btn-ghost btn-sm" onclick={navigateBack} aria-label="Go back">
				<ArrowLeftIcon size={20} />
			</button>
		{/if}
	</div>

	{#if description}
		<div class="px-4 pt-0 pb-3">
			<p class="line-clamp-2 text-base-content/60">
				{description}
			</p>
		</div>
	{/if}
</header>
