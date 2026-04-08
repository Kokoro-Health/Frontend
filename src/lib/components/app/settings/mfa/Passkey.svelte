<script lang="ts">
	import { passkeyList, type PasskeyResponse } from '$api';
	import { onMount } from 'svelte';
	import PasskeyList from './passkey/PasskeyList.svelte';
	import { Info, Plus, KeyRound } from '@lucide/svelte';
	import { checkPasskeySupport } from '$util/passkey';
	import { resolve } from '$app/paths';
	import { hapticImpact } from '$util/haptics';

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

<div class="rounded-2xl border border-base-200/60 bg-base-100/60 p-4">
	<div class="mb-4 flex items-center gap-3">
		<div class="flex h-10 w-10 items-center justify-center rounded-full bg-secondary/10">
			<KeyRound class="h-5 w-5 text-secondary" />
		</div>
		<div class="flex flex-col gap-0.5">
			<span class="text-sm font-semibold">Passkeys</span>
			<span class="text-xs text-base-content/50">Fast, secure login with biometrics</span>
		</div>
	</div>

	{#if passkeyEnabled}
		<div class="mb-3">
			<a
				href={resolve('/settings/mfa/passkey/create')}
				class="btn w-full gap-2 btn-outline btn-sm"
				onclick={() => hapticImpact('light')}
			>
				<Plus size={16} /> Add Passkey
			</a>
		</div>
		<PasskeyList keys={passkeys} />
	{:else}
		<div class="flex items-center gap-2 rounded-xl bg-info/10 p-3">
			<Info class="h-5 w-5 shrink-0 text-info" />
			<p class="text-sm text-info">Passkeys are not supported on this device.</p>
		</div>
	{/if}
</div>
