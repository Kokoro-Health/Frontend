<script lang="ts">
	import TwoFaSetup from '$components/app/settings/mfa/TwoFaSetup.svelte';
	import Passkey from '$components/app/settings/mfa/Passkey.svelte';

	let { data } = $props();
</script>

<svelte:head>
	<title>Security</title>
</svelte:head>

<div class="flex w-full flex-col gap-4">
	<div class="mb-2">
		<p class="text-sm font-medium text-base-content/60">Protect your account</p>
	</div>

	<TwoFaSetup mfaEnabled={data.settings.mfaEnabled} />
	<Passkey />
</div>
