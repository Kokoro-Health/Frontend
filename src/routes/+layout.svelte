<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { ScreenOrientation } from '@capacitor/screen-orientation';
	import { onMount } from 'svelte';

	let { children } = $props();

	onMount(async () => {
		await ScreenOrientation.lock({ orientation: 'portrait' });
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<meta
		name="viewport"
		content="width=device-width, initial-scale=1, viewport-fit=cover, maximum-scale=1"
	/>
</svelte:head>

<div class="select-none">
	{@render children()}
</div>
