<script lang="ts">
	import type { EnergyInfoDateDto, ProfileResponseDto } from '$api';
	import { formatInstant } from '$util/dateUtil.js';
	import type { ChartConfiguration } from 'chart.js';
	import { ArrowUp, RefreshCw, Calendar } from '@lucide/svelte';
	import ChartWrapper from '$components/ui/ChartWrapper.svelte';
	import { hapticImpact } from '$util/haptics';

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
			legend: { display: false }
		},
		scales: {
			x: { grid: { display: false } },
			y: { beginAtZero: true }
		}
	};

	let chartData = $derived({
		labels: entries.map((d) => formatInstant(d.date, profile)),
		datasets: [{ label: 'Energy', data: entries.map((d) => d.amount) }]
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

	function handlePresetClick(preset: string) {
		hapticImpact('light');
		applyPreset(preset);
	}
</script>

<div class="flex flex-col gap-3">
	<div class="flex items-center gap-2">
		{#each dateRangePresets as preset (preset)}
			<button
				class="btn btn-sm {selectedPreset === preset ? 'btn-primary' : 'btn-ghost'}"
				onclick={() => handlePresetClick(preset)}
				disabled={loading}
			>
				{preset}
			</button>
		{/each}
		<div class="flex-1"></div>
		<button
			class="btn btn-square btn-ghost btn-sm {showAdvancedDateRange ? 'btn-active' : ''}"
			onclick={() => (showAdvancedDateRange = !showAdvancedDateRange)}
			disabled={loading}
		>
			{#if showAdvancedDateRange}
				<ArrowUp size={18} />
			{:else}
				<Calendar size={18} />
			{/if}
		</button>
		<button class="btn btn-square btn-ghost btn-sm" onclick={() => fetchData()} disabled={loading}>
			<RefreshCw size={18} class={loading ? 'animate-spin' : ''} />
		</button>
	</div>

	{#if showAdvancedDateRange}
		<div class="grid grid-cols-2 gap-2">
			<div class="flex flex-col gap-1">
				<label class="text-xs text-base-content/50" for="from-date">From</label>
				<input
					id="from-date"
					type="date"
					value={fromInputDateString}
					onchange={handleFromDateChange}
					class="input-bordered input input-sm w-full"
					max={toInputDateString}
				/>
			</div>
			<div class="flex flex-col gap-1">
				<label class="text-xs text-base-content/50" for="to-date">To</label>
				<input
					id="to-date"
					type="date"
					value={toInputDateString}
					onchange={handleToDateChange}
					class="input-bordered input input-sm w-full"
					min={fromInputDateString}
				/>
			</div>
		</div>
	{/if}

	<div class="h-48 w-full">
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
				<span class="text-sm text-base-content/50">No data</span>
			</div>
		{/if}
	</div>
</div>
