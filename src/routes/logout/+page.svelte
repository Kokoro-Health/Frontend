<script lang="ts">
	import { performLogout } from '$lib/security/authUtils';
	import { onMount } from 'svelte';

	onMount(() => {
		setTimeout(async () => {
			performLogout();
		}, 3000);
	});
</script>

<div class="flex h-screen w-full items-center justify-center">
	<div
		class="flex flex-col items-center justify-center space-y-4 rounded-box bg-base-200 p-8 px-16"
	>
		<span class="loading h-32 w-32 loading-infinity"></span>

		<div class="flex flex-col text-center">
			<span class="text-2xl font-semibold">Logging you out.</span>
			<span class="text-base-content/80">You'll get redirected to the login page.</span>
		</div>
	</div>
</div>
