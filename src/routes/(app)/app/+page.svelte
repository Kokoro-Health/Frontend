<script lang="ts">
	import { getCurrentStreak } from '$api';
	import EnergyTracker from '$components/app/home/energy/EnergyTracker.svelte';
	import DailyJournal from '$components/app/home/journal/DailyJournal.svelte';
	import StreakComponent from '$components/app/home/streak/StreakComponent.svelte';
	import { onMount } from 'svelte';
	import gsap from 'gsap';

	let { data } = $props();
	let streak = $derived(data.streak);
	let containerRef: HTMLDivElement;

	function onChange() {
		changedStreak();
	}

	async function changedStreak() {
		await getCurrentStreak().then((res) => {
			if (!res.data) return;
			streak = res.data;
		});
	}

	onMount(() => {
		if (containerRef) {
			gsap.fromTo(
				containerRef.children,
				{ opacity: 0, y: 20 },
				{ opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: 'power3.out' }
			);
		}
	});
</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="Access the core features & track your energy." />
</svelte:head>

<div bind:this={containerRef} class="flex w-full flex-1 flex-col gap-4">
	<div class="mb-1">
		<p class="text-sm font-medium text-base-content/60">Welcome back</p>
	</div>
	<StreakComponent bind:streak />
	{#if data.energyInfo}
		<EnergyTracker {onChange} info={data.energyInfo} />
	{:else}
		<div class="py-8 text-center text-sm text-base-content/60">Loading energy data...</div>
	{/if}
	<DailyJournal profile={data.profile!} />
</div>
