<script lang="ts">
	import ThemeLoader from '$lib/components/app/util/ThemeLoader.svelte';
	import MobileDock from '$lib/components/layout/app/MobileDock.svelte';
	import Verification from '$lib/components/layout/app/Verification.svelte';

	let { children, data } = $props();

	function onVerificationSuccess() {
		if (!window) return;

		window.location.reload();
	}
</script>

<div class="overflow-x-hidden overflow-y-auto p-safe">
	{#if data.profile && !data.profile.verified}
		<Verification onSuccess={() => onVerificationSuccess()} email={data.profile.email} />
	{/if}
	{@render children()}
</div>
<MobileDock />
<ThemeLoader theme={data.profile!!.theme} />
