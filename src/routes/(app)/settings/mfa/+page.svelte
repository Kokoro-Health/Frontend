<script lang="ts">
	import Passkey from '$lib/components/app/settings/mfa/Passkey.svelte';
	import TwoFaSetup from '$lib/components/app/settings/mfa/TwoFaSetup.svelte';

	let { data } = $props();
</script>

<div class="flex flex-col space-y-4">
	<TwoFaSetup mfaEnabled={data.settings.mfaEnabled} />
	<Passkey />
</div>
