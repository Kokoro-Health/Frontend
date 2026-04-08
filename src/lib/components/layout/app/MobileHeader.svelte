<script lang="ts">
	import { afterNavigate } from '$app/navigation';
	import { page } from '$app/state';
	import { ArrowLeftIcon } from '@lucide/svelte';
	import { onMount } from 'svelte';

	const baseRoute = '/app';

	let title = $state('');
	let isHomePage = $derived(page.url.pathname === baseRoute);
	let isTransitioning = $state(false);

	afterNavigate(() => {
		isTransitioning = true;
		setTimeout(() => (isTransitioning = false), 300);
		updateHeaderState();
	});
	onMount(updateHeaderState);

	function updateHeaderState() {
		title = document.title;
	}

	function navigateBack() {
		if (page.url.pathname === baseRoute) {
			window.location.href = baseRoute;
		} else {
			window.history.back();
		}
	}
</script>

<div class="h-24 pt-safe"></div>

<header
	class="fixed inset-x-0 top-0 z-40 flex h-20 items-center px-4 pt-safe backdrop-blur-lg"
	style="background: linear-gradient(to bottom, oklch(var(--b1)/0.95) 60%, oklch(var(--b1)/0.80));"
>
	<div class="flex w-full items-center justify-between">
		<h1
			class="max-w-[80%] truncate text-xl font-semibold tracking-tight transition-all duration-300 {isTransitioning
				? 'translate-x-1 opacity-60'
				: 'translate-x-0 opacity-100'} text-base-content"
		>
			{title}
		</h1>

		{#if !isHomePage}
			<button
				class="btn btn-circle btn-ghost transition-all btn-sm hover:bg-base-content/10 active:scale-95"
				onclick={navigateBack}
				aria-label="Go back"
			>
				<ArrowLeftIcon size={20} class="text-base-content/70" />
			</button>
		{/if}
	</div>
</header>
