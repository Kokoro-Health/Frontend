<script lang="ts">
	import type { PasskeyResponse } from '$lib/api';

	let { keys }: { keys: PasskeyResponse[] } = $props();
</script>

<div class="card border border-base-200 p-4">
	{#if keys.length === 0}
		<span>No passkeys available</span>
	{:else}
		{#each keys as key}
			<div>
				<span>{key.deviceName}</span>
				<span>{key.createdAt}</span>
				<span>{key.id}</span>
			</div>
		{/each}
	{/if}
</div>
