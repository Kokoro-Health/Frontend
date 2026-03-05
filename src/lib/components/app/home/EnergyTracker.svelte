<script>
	import EnergyBattery from './EnergyBattery.svelte';
</script>

<div class="card flex w-full flex-row space-x-2 rounded-box bg-base-200 p-2">
	<div class="flex w-1/2 flex-col items-center justify-center">
		<span class="text-2xl">
			<EnergyBattery level={20} />
		</span>
	</div>
	<div class="w-1/2"></div>
</div>
