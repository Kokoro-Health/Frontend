<script lang="ts">
	import EnergyBattery from '$components/app/home/energy/EnergyBattery.svelte';
	import { formatInstant } from '$util/dateUtil.js';
	import { toAmPmTime } from '$util/timeUtil.js';
	import { ArrowUp, ArrowDown, Clock, Calendar } from '@lucide/svelte';

	let { data } = $props();

	let formattedDate = $derived(formatInstant(data.date, data.profile!));
</script>

<svelte:head>
	<title>{formattedDate}</title>
</svelte:head>

<div class="flex w-full flex-col gap-4">
	<div class="flex items-center gap-2">
		<Calendar class="h-5 w-5 text-primary" />
		<h2 class="text-sm font-semibold text-base-content/70">Daily Summary</h2>
	</div>

	<div class="rounded-2xl border border-base-200/60 bg-base-100/60 p-6">
		<div class="flex flex-col items-center gap-3">
			<EnergyBattery level={data.details.average} />
			<span class="text-sm font-medium text-base-content/60">Average Energy</span>
		</div>
	</div>

	<div class="flex items-center gap-2">
		<ArrowUp class="h-5 w-5 text-success" />
		<h2 class="text-sm font-semibold text-base-content/70">Top Influences</h2>
	</div>

	<div class="grid grid-cols-2 gap-3">
		<div class="rounded-xl border border-success/20 bg-success/5 p-4">
			<div class="mb-2 flex items-center gap-1.5 text-success">
				<ArrowUp class="h-4 w-4" />
				<span class="text-xs font-semibold">Positive</span>
			</div>
			<p class="mb-2 text-sm text-base-content/70">
				{data.details.influentialPositive.reason || '—'}
			</p>
			<div class="badge badge-sm badge-success">{data.details.influentialPositive.level}%</div>
		</div>

		<div class="rounded-xl border border-error/20 bg-error/5 p-4">
			<div class="mb-2 flex items-center gap-1.5 text-error">
				<ArrowDown class="h-4 w-4" />
				<span class="text-xs font-semibold">Negative</span>
			</div>
			<p class="mb-2 text-sm text-base-content/70">
				{data.details.influentialNegative.reason || '—'}
			</p>
			<div class="badge badge-sm badge-error">{data.details.influentialNegative.level}%</div>
		</div>
	</div>

	{#if data.details.entries.length > 0}
		<div class="flex items-center gap-2">
			<Clock class="h-5 w-5 text-base-content/50" />
			<h2 class="text-sm font-semibold text-base-content/70">Timeline</h2>
		</div>

		<div class="rounded-2xl border border-base-200/60 bg-base-100/60 p-4">
			<div class="divide-y divide-base-200/60">
				{#each data.details.entries as entry (entry.date)}
					<div class="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
						<span class="w-16 text-sm font-medium text-base-content/60">
							{toAmPmTime(entry.date, data.profile!)}
						</span>
						<span
							class="flex-1 text-sm {entry.reason ? 'text-base-content' : 'text-base-content/40'}"
						>
							{entry.reason || 'No reason logged'}
						</span>
						<div
							class="badge badge-sm {entry.amount >= 50
								? 'badge-success'
								: entry.amount >= 25
									? 'badge-warning'
									: 'badge-error'}"
						>
							{entry.amount}%
						</div>
					</div>
				{/each}
			</div>
		</div>
	{:else}
		<div class="rounded-2xl border border-base-200/60 bg-base-100/60 p-8 text-center">
			<p class="text-sm text-base-content/50">No entries recorded</p>
		</div>
	{/if}
</div>
