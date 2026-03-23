<script lang="ts">
	import EnergyTracker from '$lib/components/app/home/energy/EnergyTracker.svelte';
	import DailyJournal from '$lib/components/app/home/journal/DailyJournal.svelte';

	let { data } = $props();
</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="Access the core features & track your energy." />
</svelte:head>

<div class="w-full flex-1 space-y-3 overflow-y-auto">
	{#if data.energyInfo}
		<EnergyTracker info={data.energyInfo} />
	{:else}
		<div class="py-8 text-center text-base-content/60">Loading energy data...</div>
	{/if}
	<DailyJournal entry={data.journal} />
</div>
