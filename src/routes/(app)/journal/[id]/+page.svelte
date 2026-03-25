<script lang="ts">
	import { formatInstant } from '$lib/util/dateUtil';
	import { toAmPmTime } from '$lib/util/timeUtil.js';
	import { onMount } from 'svelte';

	let { data } = $props();

	onMount(() => {});
</script>

<svelte:head>
	<title
		>Journal - {formatInstant(data.entry!.availableUntil!, data.profile!)} - {toAmPmTime(
			data.entry!.availableUntil!,
			data.profile!
		)}</title
	>
</svelte:head>

<span>{data.entry?.content}</span>
