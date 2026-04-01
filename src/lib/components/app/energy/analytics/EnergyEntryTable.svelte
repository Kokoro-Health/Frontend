<script lang="ts">
	import type { EnergyInfoDateDto, ProfileResponseDto } from '$api';
	import { formatInstant } from '$util/dateUtil';
	import { EyeIcon } from '@lucide/svelte';
	import { resolve } from '$app/paths';

	let {
		entries,
		loading,
		profile
	}: { entries: EnergyInfoDateDto[]; loading: boolean; profile: ProfileResponseDto } = $props();

	const skeletonRows = Array(5).fill(null);
</script>

<div class="rounded-xl border border-base-200">
	<div>
		<table class="table w-full table-zebra text-sm">
			<thead>
				<tr>
					<th class="font-medium">Date</th>
					<th class="text-right font-medium">Average</th>
					<th class="w-fit text-center font-medium">View</th>
				</tr>
			</thead>
			<tbody class="max-h-32 overflow-y-auto">
				{#if loading}
					{#each skeletonRows as row (row)}
						<tr>
							<td><div class="h-4 w-24 skeleton"></div></td>
							<td class="text-right"><div class="ml-auto h-4 w-12 skeleton"></div></td>
							<td class="w-fit text-center"
								><div class="rounded-btn mx-auto h-8 w-8 skeleton"></div></td
							>
						</tr>
					{/each}
				{:else}
					{#each entries.toReversed() as entry (entry.date)}
						<tr>
							<td class="font-medium">{formatInstant(entry.date, profile)}</td>
							<td class="text-right">{entry.amount}%</td>
							<td class="w-fit text-center">
								<a
									href={resolve(`/energy/analytics/${entry.date}`)}
									class="btn opacity-70 btn-ghost btn-sm"
								>
									<EyeIcon size={18} />
								</a>
							</td>
						</tr>
					{/each}
				{/if}
			</tbody>
		</table>
	</div>
</div>
