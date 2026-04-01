<script lang="ts">
	import { ArrowDown, ArrowUp, RefreshCw } from '@lucide/svelte';
	import type { ChartConfiguration, ChartOptions } from 'chart.js';
	import { Chart, registerables } from 'chart.js';
	import { formatInstant, toIsoDateFromString } from '$util/dateUtil';
	import type { EnergyInfoDateDto, ProfileResponseDto } from '$api';
	import ChartWrapper from '$components/ui/ChartWrapper.svelte';

	Chart.register(...registerables);

	const CHART_CONFIG = {
		maxValue: 100,
		lineTension: 0.4,
		borderWidth: 2,
		pointRadius: 4,
		pointHitRadius: 10,
		pointHoverRadius: 6
	};

	let {
		dateRangePresets,
		fromInput = $bindable(),
		toInput = $bindable(),
		selectedPreset,
		entries,
		fetchData,
		applyPreset,
		profile
	}: {
		dateRangePresets: string[];
		fromInput: string;
		toInput: string;
		selectedPreset: string | null;
		entries: EnergyInfoDateDto[];
		fetchData: () => void;
		applyPreset: (preset: string) => void;
		profile: ProfileResponseDto;
	} = $props();

	let isLoading = $state(false);
	let showAdvancedDateRange = $state(false);

	let fromInputDateString = $derived(fromInput ? toIsoDateFromString(fromInput) : '');
	let toInputDateString = $derived(toInput ? toIsoDateFromString(toInput) : '');

	function handleFromDateChange(e: Event): void {
		const value = (e.target as HTMLInputElement).value;
		if (value) {
			fromInput = new Date(`${value}T00:00:00`).toISOString();
		}
	}

	function handleToDateChange(e: Event): void {
		const value = (e.target as HTMLInputElement).value;
		if (value) {
			toInput = new Date(`${value}T00:00:00`).toISOString();
		}
	}

	let chartData = $state<{
		labels: string[];
		datasets: Array<{
			label: string;
			data: number[];
		}>;
	}>({ labels: [], datasets: [] });

	let chartOptions: ChartOptions<'line'> = {
		responsive: true,
		maintainAspectRatio: false,
		plugins: {
			legend: { display: false },
			tooltip: {
				mode: 'index',
				intersect: false,
				backgroundColor: 'rgba(0, 0, 0, 0.8)',
				titleColor: '#fff',
				bodyColor: '#fff',
				padding: 10
			}
		},
		scales: {
			x: {
				grid: { display: false },
				ticks: { color: '#9ca3af' }
			},
			y: {
				grid: { color: 'rgba(0, 0, 0, 0.05)' },
				ticks: { color: '#9ca3af' },
				beginAtZero: true,
				max: CHART_CONFIG.maxValue
			}
		},
		elements: {
			line: { tension: CHART_CONFIG.lineTension, borderWidth: CHART_CONFIG.borderWidth },
			point: {
				radius: CHART_CONFIG.pointRadius,
				hitRadius: CHART_CONFIG.pointHitRadius,
				hoverRadius: CHART_CONFIG.pointHoverRadius
			}
		}
	};
	function updateChart(data: { date: string; amount: number }[]): void {
		chartData = {
			labels: data.map((d) => formatInstant(d.date, profile)),
			datasets: [
				{
					label: 'Energy',
					data: data.map((d) => d.amount)
				}
			]
		};
	}

	$effect(() => {
		updateChart(entries);
	});

	async function handleFetchData(): Promise<void> {
		isLoading = true;
		try {
			await fetchData();
		} finally {
			isLoading = false;
		}
	}

	async function handleApplyPreset(preset: string): Promise<void> {
		isLoading = true;
		try {
			await applyPreset(preset);
		} finally {
			isLoading = false;
		}
	}
</script>

<div class="scrollbar-hide flex w-full space-x-2 overflow-x-auto pb-2">
	{#each dateRangePresets as preset (preset)}
		<button
			class="btn shrink-0 text-xs btn-sm"
			class:btn-primary={selectedPreset === preset}
			onclick={() => handleApplyPreset(preset)}
			disabled={isLoading}
		>
			{preset}
		</button>
	{/each}
	<button
		class="btn shrink-0 text-xs btn-sm"
		class:btn-primary={showAdvancedDateRange}
		onclick={() => (showAdvancedDateRange = !showAdvancedDateRange)}
		disabled={isLoading}
	>
		{#if showAdvancedDateRange}
			<ArrowUp size={18} />
		{:else}
			<ArrowDown size={18} />
		{/if}
	</button>
	<div class="grow"></div>
	<button class="btn shrink-0 btn-sm" onclick={handleFetchData} disabled={isLoading}>
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
	{#if isLoading}
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
