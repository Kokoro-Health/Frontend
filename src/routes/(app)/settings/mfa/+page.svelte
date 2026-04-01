<script lang="ts">
	import TwoFaSetup from '$components/app/settings/mfa/TwoFaSetup.svelte';
	import Passkey from '$components/app/settings/mfa/Passkey.svelte';

	let { data } = $props();
</script>

<div class="flex flex-col space-y-4">
	<TwoFaSetup mfaEnabled={data.settings.mfaEnabled} />
	<Passkey />
</div>
