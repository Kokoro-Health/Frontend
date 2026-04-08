<script lang="ts">
	import { getEnergyForDateRange, type EnergyInfoDateDto } from '$api';
	import { onMount } from 'svelte';
	import EnergyGraphDateRange from '$components/app/energy/analytics/EnergyGraphDateRange.svelte';
	import EnergyEntryTable from '$components/app/energy/analytics/EnergyEntryTable.svelte';
	import { toInstant } from '$util/dateUtil.js';
	import { CircleX, TrendingUp } from '@lucide/svelte';

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
		fetchData(fromInput, toInput);
	}

	async function fetchData(from = fromInput, to = toInput) {
		if (!from || !to) return;
		error = null;
		const fromDate = new Date(from);
		const toDate = new Date(to);
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
		} catch (e) {
			console.error(e);
			entries = [];
			error = 'Something went wrong';
		} finally {
			loading = false;
		}
	}

	onMount(() => {
		applyPreset('7d');
	});
</script>

<svelte:head>
	<title>Energy Analytics</title>
</svelte:head>

<div class="flex w-full flex-col gap-4">
	{#if error}
		<div class="flex items-center gap-2 rounded-xl border border-error/20 bg-error/5 p-3">
			<CircleX class="h-5 w-5 shrink-0 text-error" />
			<span class="text-sm text-error">{error}</span>
		</div>
	{/if}

	<div class="flex items-center gap-2">
		<TrendingUp class="h-5 w-5 text-primary" />
		<h2 class="text-sm font-semibold text-base-content/70">Energy Trends</h2>
	</div>

	<div class="rounded-2xl border border-base-200/60 bg-base-100/60 p-4">
		<EnergyGraphDateRange
			bind:fromInput
			bind:toInput
			profile={data.profile!}
			{applyPreset}
			fetchData={(from, to) => fetchData(from, to)}
			{entries}
			{loading}
			{selectedPreset}
			dateRangePresets={DATE_RANGE_PRESETS}
		/>
	</div>

	<div class="flex items-center gap-2">
		<span class="text-sm font-semibold text-base-content/70">Daily Breakdown</span>
	</div>

	<EnergyEntryTable {loading} {entries} profile={data.profile!} />
</div>
