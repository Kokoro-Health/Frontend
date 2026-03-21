<script lang="ts">
	import { afterNavigate } from '$app/navigation';
	import { page } from '$app/state';
	import { ArrowLeftIcon } from '@lucide/svelte';
	import { onMount } from 'svelte';

	const baseRoute = '/app';

	let title = $state('');
	let isHomePage = $derived(page.url.pathname === baseRoute);

	afterNavigate(updateHeaderState);
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

<div class="h-32 pt-safe"></div>

<header
	class="fixed inset-x-0 top-0 z-50 flex h-28 flex-col rounded-b-2xl bg-linear-to-r from-primary/10 to-secondary/10 pt-safe shadow-sm backdrop-blur-sm"
>
	<div class="flex h-16 items-center justify-between px-4">
		<h1 class="max-w-[75%] truncate text-lg font-bold text-base-content">
			{title}
		</h1>

		{#if !isHomePage}
			<button
				class="btn btn-circle transition-transform btn-md hover:scale-105"
				onclick={navigateBack}
				aria-label="Go back"
			>
				<ArrowLeftIcon size={24} class="text-primary" />
			</button>
		{/if}
	</div>
</header>
