<script lang="ts">
	import { getCurrentStreak } from '$api';
	import EnergyTracker from '$components/app/home/energy/EnergyTracker.svelte';
	import DailyJournal from '$components/app/home/journal/DailyJournal.svelte';
	import StreakComponent from '$components/app/home/streak/StreakComponent.svelte';

	let { data } = $props();
	let streak = $derived(data.streak);
	function onChange() {
		changedStreak();
	}

	async function changedStreak() {
		await getCurrentStreak().then((res) => {
			if (!res.data) return;
			streak = res.data;
		});
	}
</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="Access the core features & track your energy." />
</svelte:head>

<div class="w-full flex-1 space-y-3 overflow-y-auto">
	<StreakComponent bind:streak />
	{#if data.energyInfo}
		<EnergyTracker {onChange} info={data.energyInfo} />
	{:else}
		<div class="py-8 text-center text-base-content/60">Loading energy data...</div>
	{/if}
	<DailyJournal profile={data.profile!} />
</div>
