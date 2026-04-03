<script lang="ts">
	import { passkeyList, type PasskeyResponse } from '$api';
	import { onMount } from 'svelte';
	import PasskeyList from './passkey/PasskeyList.svelte';
	import { InfoIcon, PlusIcon } from '@lucide/svelte';
	import { checkPasskeySupport } from '$util/passkey';
	import { resolve } from '$app/paths';

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
				<a href={resolve('/settings/mfa/passkey/create')} class="btn btn-primary"
					><PlusIcon /> Add Passkey</a
				>
			</div>
			<PasskeyList keys={passkeys} />
		</div>
	{:else}
		<div class="card flex flex-row items-center space-x-3 bg-info p-4">
			<InfoIcon />
			<span> Passkeys are not supported on your device. </span>
		</div>
	{/if}
</div>
