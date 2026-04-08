<script lang="ts">
	import type { EnergyInfoDateDto, ProfileResponseDto } from '$api';
	import { formatInstant } from '$util/dateUtil';
	import { ChevronRight } from '@lucide/svelte';
	import { resolve } from '$app/paths';

	let {
		entries,
		loading,
		profile
	}: { entries: EnergyInfoDateDto[]; loading: boolean; profile: ProfileResponseDto } = $props();

	const skeletonCount = 5;
</script>

<div class="flex flex-col gap-2">
	{#if loading}
		{#each { length: skeletonCount }, i (i)}
			<div
				class="flex items-center justify-between rounded-xl border border-base-200/60 bg-base-100/40 p-4"
			>
				<div class="h-4 w-24 skeleton rounded"></div>
				<div class="h-4 w-12 skeleton rounded"></div>
			</div>
		{/each}
	{:else if entries.length === 0}
		<div class="rounded-xl border border-base-200/60 bg-base-100/40 p-8 text-center">
			<p class="text-sm text-base-content/50">No entries yet</p>
		</div>
	{:else}
		{#each entries.toReversed() as entry (entry)}
			<a
				href={resolve(`/energy/analytics/${entry.date}`)}
				class="flex items-center justify-between rounded-xl border border-base-200/60 bg-base-100/60 p-4 transition-all active:scale-[0.99]"
			>
				<div class="flex flex-col gap-0.5">
					<span class="text-sm font-medium">{formatInstant(entry.date, profile)}</span>
				</div>
				<div class="flex items-center gap-3">
					<div
						class="badge {entry.amount >= 50
							? 'badge-success'
							: entry.amount >= 25
								? 'badge-warning'
								: 'badge-error'}"
					>
						{entry.amount}%
					</div>
					<ChevronRight size={18} class="text-base-content/30" />
				</div>
			</a>
		{/each}
	{/if}
</div>
