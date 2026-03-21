<script lang="ts">
	import { formatInstant } from '$lib/util/dateUtil.js';

	let { data } = $props();
</script>

<svelte:head>
	<title>Day analytics</title>
	<meta
		name="description"
		content="View your energy on the {formatInstant(data.date, data.profile!!)}."
	/>
</svelte:head>

<div></div>
