<script lang="ts">
	import EnergyTracker from '$lib/components/app/home/EnergyTracker.svelte';

	let {data} = $props()
</script>

<div class="h-screen w-full px-3 py-16">
	<EnergyTracker info={data.energyInfo!!} />
</div>
