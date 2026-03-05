<script lang="ts">
	import MobileDock from '$lib/components/layout/app/MobileDock.svelte';

	let { children } = $props();
</script>

{@render children()}
<MobileDock />
