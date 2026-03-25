<script lang="ts">
	import type { ProfileResponseDto, ShortJournalResponseDto } from '$lib/api';
	import { formatInstant } from '$lib/util/dateUtil';
	import { EyeIcon } from '@lucide/svelte';

	let {
		recentsShort,
		profile
	}: { recentsShort: ShortJournalResponseDto[]; profile: ProfileResponseDto } = $props();
</script>

<div class="card border border-base-200 p-4">
	<div class="card-header">
		<h2 class="text-sm font-semibold">Recent Journals</h2>
	</div>
	<div class="overflow-x-auto">
		<table class="table table-zebra">
			<thead>
				<tr>
					<th>Date</th>
					<th>Content Preview</th>
					<th></th>
				</tr>
			</thead>
			<tbody>
				{#each recentsShort as entry}
					<tr class="hover">
						<td class="text-sm whitespace-nowrap opacity-70">
							{formatInstant(entry.lockedSince, profile)}
						</td>
						<td class="max-w-md truncate">
							{entry.content}
						</td>
						<td class="text-right">
							<a href="/journal/{entry.id}" class="btn gap-1 opacity-70 btn-ghost btn-sm">
								<EyeIcon size={18} />
							</a>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>
