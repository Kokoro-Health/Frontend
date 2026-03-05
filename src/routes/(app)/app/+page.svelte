<script lang="ts">
	import EnergyTracker from '$lib/components/app/home/energy/EnergyTracker.svelte';
	import DailyJournal from '$lib/components/app/home/journal/DailyJournal.svelte';

	let { data } = $props();
</script>

<div class="min-h-screen w-full flex-2 space-y-3 overflow-y-auto px-3 py-18">
	<EnergyTracker info={data.energyInfo!!} />
	<DailyJournal />
</div>
