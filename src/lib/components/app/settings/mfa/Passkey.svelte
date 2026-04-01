<script lang="ts">
	import { passkeyList, type PasskeyResponse } from '$api';
	import { onMount } from 'svelte';
	import PasskeyList from './passkey/PasskeyList.svelte';
	import { PlusIcon } from '@lucide/svelte';
	import { checkPasskeySupport } from '$util/passkey';

	let passkeys: PasskeyResponse[] = $state([]);
	let passkeyEnabled = $state(true);

	onMount(async () => {
		await passkeyList().then((res) => {
			if (!res.data) return;
			passkeys = res.data;
		});
		await checkPasskeySupport().then((res) => {
			passkeyEnabled = res;
		});
	});
</script>

<div class="flex flex-col space-y-4">
	<span class="text-lg font-semibold">Passkey</span>
	{#if passkeyEnabled}
		<div class="flex flex-col space-y-4">
			<div class="flex flex-row justify-between">
				<a href="/settings/mfa/passkey/create" class="btn btn-primary"><PlusIcon /> Add Passkey</a>
			</div>
			<PasskeyList keys={passkeys} />
		</div>
	{:else}
		<div class="card bg-error p-4">Passkeys are not supported on your device.</div>
	{/if}
</div>
