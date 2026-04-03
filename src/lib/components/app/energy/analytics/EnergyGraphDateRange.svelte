<script lang="ts">
	import type { EnergyInfoDateDto, ProfileResponseDto } from '$api';
	import { formatInstant } from '$util/dateUtil.js';
	import type { ChartConfiguration, ChartData } from 'chart.js';
	import { ArrowUp, ArrowDown, RefreshCw } from '@lucide/svelte';
	import ChartWrapper from '$components/ui/ChartWrapper.svelte';

	let {
		fromInput = $bindable(),
		toInput = $bindable(),
		profile,
		applyPreset,
		fetchData,
		entries,
		loading,
		selectedPreset,
		dateRangePresets
	}: {
		fromInput: string;
		toInput: string;
		profile: ProfileResponseDto;
		applyPreset: (preset: string) => void;
		fetchData: (from?: string, to?: string) => Promise<void>;
		entries: EnergyInfoDateDto[];
		loading: boolean;
		selectedPreset: string | null;
		dateRangePresets: string[];
	} = $props();

	let showAdvancedDateRange = $state(false);

	const chartOptions: ChartConfiguration['options'] = {
		responsive: true,
		maintainAspectRatio: false,
		plugins: {
			legend: {
				display: false
			}
		},
		scales: {
			x: {
				grid: { display: false }
			},
			y: {
				beginAtZero: true
			}
		}
	};

	let chartData = $derived<ChartData>({
		labels: entries.map((d) => formatInstant(d.date, profile)),
		datasets: [
			{
				label: 'Energy',
				data: entries.map((d) => d.amount)
			}
		]
	});

	let fromInputDateString = $derived(fromInput ? fromInput.slice(0, 10) : '');
	let toInputDateString = $derived(toInput ? toInput.slice(0, 10) : '');

	function handleFromDateChange(e: Event): void {
		const value = (e.target as HTMLInputElement).value;
		if (value) {
			fromInput = new Date(`${value}T00:00:00`).toISOString();
			fetchData(fromInput, toInput);
		}
	}

	function handleToDateChange(e: Event): void {
		const value = (e.target as HTMLInputElement).value;
		if (value) {
			toInput = new Date(`${value}T00:00:00`).toISOString();
			fetchData(fromInput, toInput);
		}
	}
</script>

<div class="scrollbar-hide flex w-full space-x-2 overflow-x-auto pb-2">
	{#each dateRangePresets as preset (preset)}
		<button
			class="btn shrink-0 text-xs btn-sm"
			class:btn-primary={selectedPreset === preset}
			onclick={() => applyPreset(preset)}
			disabled={loading}
		>
			{preset}
		</button>
	{/each}
	<button
		class="btn shrink-0 text-xs btn-sm"
		class:btn-primary={showAdvancedDateRange}
		onclick={() => (showAdvancedDateRange = !showAdvancedDateRange)}
		disabled={loading}
	>
		{#if showAdvancedDateRange}
			<ArrowUp size={18} />
		{:else}
			<ArrowDown size={18} />
		{/if}
	</button>
	<div class="grow"></div>
	<button class="btn shrink-0 btn-sm" onclick={() => fetchData()} disabled={loading}>
		<RefreshCw class="h-4 w-4" />
	</button>
</div>

{#if showAdvancedDateRange}
	<div class="grid grid-cols-2 gap-3">
		<label class="form-control">
			<div class="label">
				<span class="label-text text-xs">From</span>
			</div>
			<input
				type="date"
				value={fromInputDateString}
				onchange={handleFromDateChange}
				class="input-bordered input input-sm w-full"
				max={toInputDateString}
			/>
		</label>

		<label class="form-control">
			<div class="label">
				<span class="label-text text-xs">To</span>
			</div>
			<input
				type="date"
				value={toInputDateString}
				onchange={handleToDateChange}
				class="input-bordered input input-sm w-full"
				min={fromInputDateString}
			/>
		</label>
	</div>
{/if}

<div class="h-64 w-full">
	{#if loading}
		<div class="flex h-full items-center justify-center">
			<span class="loading loading-md loading-spinner text-primary"></span>
		</div>
	{:else if entries.length > 0}
		<ChartWrapper
			type="line"
			data={chartData}
			options={chartOptions as ChartConfiguration['options']}
		/>
	{:else}
		<div class="flex h-full items-center justify-center">
			<span>No data available</span>
		</div>
	{/if}
</div>
