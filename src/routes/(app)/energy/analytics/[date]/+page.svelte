<script lang="ts">
	import EnergyBattery from '$lib/components/app/home/energy/EnergyBattery.svelte';
	import { formatInstant } from '$lib/util/dateUtil.js';
	import { toAmPmTime } from '$lib/util/timeUtil.js';
	import { ArrowUp, ArrowDown, Clock, ClockIcon } from '@lucide/svelte';

	let { data } = $props();

	let formattedDate = $derived(formatInstant(data.date, data.profile!!));
</script>

<svelte:head>
	<title>Review - {formattedDate}</title>
</svelte:head>

<div class="flex min-h-screen flex-col space-y-6">
	<div class="card bg-base-200">
		<div class="card-body items-center py-6">
			<EnergyBattery level={data.details.average} />
			<span class="mt-2 text-sm text-base-content/60">Average Energy</span>
		</div>
	</div>

	<div class="grid grid-cols-2 gap-3">
		<div class="card border border-success/20 bg-success/10">
			<div class="card-body gap-2 p-4">
				<div class="flex items-center gap-2 text-success">
					<ArrowUp class="h-4 w-4" />
					<span class="text-sm font-medium">Positive</span>
				</div>
				<p class="line-clamp-2 text-sm">{data.details.influentialPositive.reason || '—'}</p>
				<div class="badge badge-sm badge-success">{data.details.influentialPositive.level}%</div>
			</div>
		</div>

		<div class="card border border-error/20 bg-error/10">
			<div class="card-body gap-2 p-4">
				<div class="flex items-center gap-2 text-error">
					<ArrowDown class="h-4 w-4" />
					<span class="text-sm font-medium">Negative</span>
				</div>
				<p class="line-clamp-2 text-sm">{data.details.influentialNegative.reason || '—'}</p>
				<div class="badge badge-sm badge-error">{data.details.influentialNegative.level}%</div>
			</div>
		</div>
	</div>

	{#if data.details.entries.length > 0}
		<div class="space-y-2">
			<div
				class="flex flex-row items-center space-x-1 px-1 text-sm font-medium text-base-content/70"
			>
				<ClockIcon size={16} /> <span>Timeline</span>
			</div>
			<ul class="menu w-full rounded-lg bg-base-200 p-0">
				{#each data.details.entries as entry}
					<li class="flex flex-row items-center gap-3 p-3">
						<span>{toAmPmTime(entry.date, data.profile!!)}</span>
						<span class="flex-1 text-sm">{entry.reason}</span>
						<div class="badge badge-sm badge-neutral">{entry.amount}%</div>
					</li>
				{/each}
			</ul>
		</div>
	{:else}
		<div class="py-8 text-center text-base-content/50">
			<p>No entries recorded</p>
		</div>
	{/if}
</div>
