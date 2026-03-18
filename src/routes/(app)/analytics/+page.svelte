<script lang="ts">
	import { Calendar, RefreshCw } from '@lucide/svelte';
	import { getEnergyForDateRange } from '$lib/api';
	import { Line } from 'svelte-chartjs';
	import type { ChartOptions } from 'chart.js';
	import { Chart, registerables } from 'chart.js';
	import { onMount } from 'svelte';

	Chart.register(...registerables);

	const DATE_RANGE_PRESETS = ['7d', '14d', '30d'] as const;
	const CHART_MAX_VALUE = 100;
	const CHART_LINE_TENSION = 0.4;
	const CHART_BORDER_WIDTH = 2;
	const CHART_POINT_RADIUS = 4;
	const CHART_POINT_HIT_RADIUS = 10;
	const CHART_POINT_HOVER_RADIUS = 6;
	const DAYS_IN_MS = 86400000;

	let selectedPreset = $state<(typeof DATE_RANGE_PRESETS)[number] | null>(null);
	let fromInput = $state('');
	let toInput = $state('');
	let isLoading = $state(false);
	let entries = $state<{ date: string; amount: number }[]>([]);

	let chartData = $state<{
		labels: string[];
		datasets: Array<{
			label: string;
			data: number[];
			borderColor: string;
			backgroundColor: string;
		}>;
	}>({ labels: [], datasets: [] });

	let chartOptions: ChartOptions<'line'> = $state({
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
				borderRadius: 8,
				padding: 10
			}
		},
		scales: {
			x: {
				grid: { display: false, drawBorder: false },
				ticks: { color: '#9ca3af' }
			},
			y: {
				grid: { color: 'rgba(0, 0, 0, 0.05)', borderDash: [4, 4] },
				ticks: { color: '#9ca3af' },
				beginAtZero: true,
				max: CHART_MAX_VALUE
			}
		},
		elements: {
			line: { tension: CHART_LINE_TENSION, borderWidth: CHART_BORDER_WIDTH },
			point: {
				radius: CHART_POINT_RADIUS,
				hitRadius: CHART_POINT_HIT_RADIUS,
				hoverRadius: CHART_POINT_HOVER_RADIUS
			}
		}
	});

	function formatDate(date: Date): string {
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, '0');
		const day = String(date.getDate()).padStart(2, '0');
		return `${year}-${month}-${day}`;
	}

	function applyPreset(preset: (typeof DATE_RANGE_PRESETS)[number]): void {
		selectedPreset = preset;
		const days = parseInt(preset.replace('d', ''), 10);
		const now = new Date();
		const from = new Date(now.getTime() - (days - 1) * DAYS_IN_MS);

		fromInput = formatDate(from);
		toInput = formatDate(now);
	}

	async function fetchData(): Promise<void> {
		if (!fromInput || !toInput) return;

		const fromDate = new Date(fromInput);
		const toDate = new Date(toInput);

		if (fromDate > toDate) return;

		isLoading = true;
		try {
			const res = await getEnergyForDateRange({
				query: { from: fromDate.toISOString(), to: toDate.toISOString() }
			});
			if (res.data) {
				entries = res.data;
				updateChart(res.data);
			} else {
				entries = [];
				chartData = { labels: [], datasets: [] };
			}
		} catch {
			entries = [];
			chartData = { labels: [], datasets: [] };
		} finally {
			isLoading = false;
		}
	}

	function updateChart(data: { date: string; amount: number }[]): void {
		chartData = {
			labels: data.map((d) => d.date.split('T')[0]),
			datasets: [
				{
					label: 'Energy',
					data: data.map((d) => d.amount),
					borderColor: '#007aff',
					backgroundColor: 'rgba(0, 122, 255, 0.1)'
				}
			]
		};
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

<div class="w-full px-4 pb-24 sm:px-6">
	<div class="mx-auto flex w-full max-w-xl flex-col gap-6">
		<div class="flex flex-col gap-1 pt-4">
			<h1 class="text-2xl font-bold tracking-tight">Review</h1>
			<p class="text-sm text-base-content/70">View your energy consumption over time.</p>
		</div>

		<section class="flex flex-col gap-4">
			<div class="flex items-center justify-between">
				<div class="flex items-center gap-2">
					<Calendar class="h-5 w-5 text-primary" />
					<h2 class="text-lg font-semibold">Energy Overview</h2>
				</div>
				<button class="btn btn-ghost btn-sm" onclick={fetchData} disabled={isLoading}>
					<RefreshCw class="h-4 w-4" />
				</button>
			</div>

			<div class="scrollbar-hide flex w-full gap-2 overflow-x-auto pb-2">
				{#each DATE_RANGE_PRESETS as preset}
					<button
						class="btn shrink-0 text-xs btn-sm"
						class:btn-primary={selectedPreset === preset}
						onclick={() => applyPreset(preset)}
						disabled={isLoading}
					>
						{preset}
					</button>
				{/each}
			</div>

			<div class="grid grid-cols-2 gap-3">
				<label class="form-control">
					<div class="label">
						<span class="label-text text-xs">From</span>
					</div>
					<input
						type="date"
						bind:value={fromInput}
						class="input-bordered input input-sm w-full"
						max={toInput}
					/>
				</label>

				<label class="form-control">
					<div class="label">
						<span class="label-text text-xs">To</span>
					</div>
					<input
						type="date"
						bind:value={toInput}
						class="input-bordered input input-sm w-full"
						min={fromInput}
					/>
				</label>
			</div>

			<div class="h-64 w-full">
				{#if isLoading}
					<div class="flex h-full items-center justify-center">
						<span class="loading loading-md loading-spinner text-primary"></span>
					</div>
				{:else if entries.length > 0}
					<Line data={chartData} options={chartOptions} />
				{:else}
					<div class="flex h-full items-center justify-center">
						<span>No data available</span>
						<span>{JSON.stringify(entries, null, 2)}</span>
					</div>
				{/if}
			</div>

			<div class="overflow-hidden rounded-xl border border-base-200">
				<div class="overflow-x-auto">
					<table class="table w-full table-zebra text-sm">
						<thead>
							<tr>
								<th class="font-medium">Date</th>
								<th class="font-medium">Amount</th>
							</tr>
						</thead>
						<tbody>
							{#each entries as entry}
								<tr>
									<td class="font-medium">{entry.date.split('T')[0]}</td>
									<td class="text-right">{entry.amount}%</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</div>
		</section>
	</div>
</div>
