<script lang="ts">
	import ThemeLoader from '$lib/components/app/util/ThemeLoader.svelte';
	import MobileDock from '$lib/components/layout/app/MobileDock.svelte';

	let { children, data } = $props();
</script>

<div class="overflow-x-hidden overflow-y-auto p-safe">
	{@render children()}
</div>
<MobileDock />
<ThemeLoader theme={data.profile!!.theme} />
