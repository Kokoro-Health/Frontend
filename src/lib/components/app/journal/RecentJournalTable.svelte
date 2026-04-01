<script lang="ts">
	import type { ProfileResponseDto, ShortJournalResponseDto } from '$api';
	import { formatInstant } from '$util/dateUtil';
	import { EyeIcon } from '@lucide/svelte';
	import { resolve } from '$app/paths';

	let {
		recentsShort,
		profile
	}: { recentsShort: ShortJournalResponseDto[]; profile: ProfileResponseDto } = $props();
</script>

<div class="card border border-base-200 bg-base-100">
	<div class="card-body gap-4 p-4">
		<div class="flex items-center justify-between">
			<h2 class="card-title text-sm">Recent Journals</h2>
			{#if recentsShort.length > 3}
				<a href={resolve('/journal')} class="btn btn-ghost btn-xs">View All</a>
			{/if}
		</div>

		<div class="divide-y divide-base-200">
			{#if recentsShort.length === 0}
				<div class="py-6 text-center text-base-content/60">No recent journals found</div>
			{:else}
				{#each recentsShort.reverse() as entry (entry.id)}
					<div class="flex items-center justify-between gap-4 py-3">
						<div class="min-w-0 flex-1">
							<div class="mb-1 text-xs opacity-70">
								{formatInstant(entry.lockedSince, profile)}
							</div>
							<div class="truncate text-sm">
								{entry.content}
							</div>
						</div>
						<a
							href={resolve(`/journal/${entry.id}`)}
							class="btn btn-square
						shrink-0 btn-ghost btn-sm"
						>
							<EyeIcon size={16} />
						</a>
					</div>
				{/each}
			{/if}
		</div>
	</div>
</div>
