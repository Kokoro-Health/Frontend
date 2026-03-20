<script lang="ts">
	import ThemeLoader from '$lib/components/app/util/ThemeLoader.svelte';
	import MobileDock from '$lib/components/layout/app/MobileDock.svelte';
	import MobileHeader from '$lib/components/layout/app/MobileHeader.svelte';
	import Verification from '$lib/components/layout/app/Verification.svelte';

	let { children, data } = $props();

	function onVerificationSuccess() {
		if (!window) return;

		window.location.reload();
	}
</script>

<MobileHeader />
<div class="overflow-x-hidden overflow-y-auto px-4">
	{#if data.profile && !data.profile.verified}
		<Verification onSuccess={() => onVerificationSuccess()} email={data.profile.email} />
	{/if}
	{@render children()}
</div>
<MobileDock />
<ThemeLoader theme={data.profile!!.theme} />
