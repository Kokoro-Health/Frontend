<script lang="ts">
	import type { EnergyInfoDto } from '$lib/api';
	import EnergyTracker from '$lib/components/app/home/energy/EnergyTracker.svelte';
	import DailyJournal from '$lib/components/app/home/journal/DailyJournal.svelte';

	interface Props {
		data: {
			energyInfo: EnergyInfoDto | null;
		};
	}

	let { data }: Props = $props();
</script>

<div class="w-full flex-1 space-y-3 overflow-y-auto p-4">
	{#if data.energyInfo}
		<EnergyTracker info={data.energyInfo} />
	{:else}
		<div class="py-8 text-center text-base-content/60">Loading energy data...</div>
	{/if}
	<DailyJournal />
</div>
