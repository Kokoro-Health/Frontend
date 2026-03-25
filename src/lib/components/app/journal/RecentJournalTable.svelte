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
	<div class="w-full">
		<table class="table table-zebra text-xs">
			<thead>
				<tr>
					<th class="text-xs">Date</th>
					<th class="text-xs">Content Preview</th>
					<th class="text-xs"></th>
				</tr>
			</thead>
			<tbody class="w-full">
				{#each recentsShort as entry}
					<tr class="hover w-full">
						<td class="whitespace-nowrap opacity-70">
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
