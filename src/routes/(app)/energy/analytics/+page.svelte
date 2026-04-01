<script lang="ts">
	import { getEnergyForDateRange, type EnergyInfoDateDto } from '$api';
	import { onMount } from 'svelte';
	import EnergyGraphDateRange from '$components/app/energy/analytics/EnergyGraphDateRange.svelte';
	import EnergyEntryTable from '$components/app/energy/analytics/EnergyEntryTable.svelte';
	import { toInstant } from '$util/dateUtil.js';
	import { CircleX } from '@lucide/svelte';

	const DATE_RANGE_PRESETS: string[] = ['7d', '14d', '30d'] as const;

	let selectedPreset = $state<(typeof DATE_RANGE_PRESETS)[number] | null>(null);
	let fromInput = $state('');
	let toInput = $state('');
	let loading = $state(false);
	let entries = $state<EnergyInfoDateDto[]>([]);
	let { data } = $props();
	let error: string | null = $state(null);

	function applyPreset(preset: (typeof DATE_RANGE_PRESETS)[number]): void {
		selectedPreset = preset;
		const days = parseInt(preset.replace('d', ''), 10);
		const now = new Date();
		const from = new Date(now.getTime() - (days - 1) * 86400000);

		fromInput = toInstant(from);
		toInput = toInstant(now);
	}

	async function fetchData(): Promise<void> {
		if (!fromInput || !toInput) return;
		error = null;
		const fromDate = new Date(fromInput);
		const toDate = new Date(toInput);

		if (fromDate > toDate) return;

		loading = true;
		try {
			const res = await getEnergyForDateRange({
				query: { from: toInstant(fromDate), to: toInstant(toDate) }
			});
			if (res.data) {
				entries = res.data;
			} else {
				entries = [];
				error = res.error.message;
			}
		} catch {
			entries = [];
			error = 'An unexpected error occured.';
		} finally {
			loading = false;
		}
	}

	$effect(() => {
		if (fromInput && toInput) {
			fetchData();
		}
	});

	onMount(() => {
		applyPreset('7d');
	});
</script>

<svelte:head>
	<title>Review Energy</title>
	<meta name="description" content="View your energy consumption over time." />
</svelte:head>

<div class="flex w-full flex-col">
	{#if error}
		<div
			class="justify-cent card mb-4 flex w-full flex-row items-center space-x-3 bg-error p-3 text-error-content"
		>
			<CircleX size={26} />
			<span>{error}</span>
		</div>
	{/if}
	<section class="flex flex-col gap-4">
		<EnergyGraphDateRange
			bind:fromInput
			bind:toInput
			profile={data.profile!}
			{applyPreset}
			{fetchData}
			{entries}
			{selectedPreset}
			dateRangePresets={DATE_RANGE_PRESETS}
		/>
		<EnergyEntryTable {loading} {entries} profile={data.profile!} />
	</section>
</div>
