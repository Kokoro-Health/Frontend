<script lang="ts">
	import { formatInstant } from '$util/dateUtil';
	import { toAmPmTime } from '$util/timeUtil.js';

	let { data } = $props();
</script>

<svelte:head>
	<title>
		Journal - {formatInstant(data.entry!.availableUntil!, data.profile!)} -
		{toAmPmTime(data.entry!.availableUntil!, data.profile!)}
	</title>
</svelte:head>

<div class="flex flex-col">
	<main class="flex-1 pb-4">
		<div class="prose max-w-none">
			{data.entry.content}
		</div>
	</main>

	<footer class="border-t border-base-200 py-4 text-xs text-base-content/70">
		<div class="flex items-center justify-between">
			<span>Locked since {toAmPmTime(data.entry!.availableUntil!, data.profile!)}</span>
			{#if data.entry?.availableUntil}
				<span>{formatInstant(data.entry.availableUntil, data.profile!)}</span>
			{/if}
		</div>
	</footer>
</div>
