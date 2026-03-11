<script lang="ts">
	import MobileDock from '$lib/components/layout/app/MobileDock.svelte';

	let { children } = $props();
</script>

<div class="overflow-x-hidden overflow-y-auto p-safe">
	{@render children()}
</div>
<MobileDock />
