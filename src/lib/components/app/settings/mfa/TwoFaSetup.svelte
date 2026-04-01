<script lang="ts">
	import { setupMfa, verifyMfaCodeAndEnable } from '$api';
	import { Clipboard } from '@capacitor/clipboard';
	import { CopyIcon } from '@lucide/svelte';

	let { mfaEnabled } = $props();
	let qrCode: string | null = $state(null);
	let secret: string | null = $state(null);
	let digits = $state(['', '', '', '', '', '']);
	let inputs: (HTMLInputElement | null)[] = $state([null, null, null, null, null, null]);
	let error: string | null = $state(null);
	let success = $state(false);

	let code = $derived(digits.join(''));
	let codeComplete = $derived(code.length === 6);

	async function copySecret() {
		if (!secret) return;
		await Clipboard.write({
			string: secret
		});
	}

	async function generateQRCode() {
		await setupMfa()
			.then((res) => {
				if (res.error) throw Error(res.error.message);
				qrCode = res.data.qrCodeBase64;
				secret = res.data.secret;
			})
			.catch((e: Error) => {
				error = e.message;
			});
	}

	async function verifyMfaCode() {
		error = null;
		await verifyMfaCodeAndEnable({ body: { code } })
			.then(() => {
				success = true;
			})
			.catch((e: Error) => {
				error = e.message;
				digits = ['', '', '', '', '', ''];
				setTimeout(() => inputs[0]?.focus(), 0);
			});
	}

	function handleInput(e: Event, i: number) {
		const val = (e.target as HTMLInputElement).value.replace(/\D/g, '').slice(-1);
		digits[i] = val;
		if (val && i < 5) inputs[i + 1]?.focus();
	}

	function handleKeydown(e: KeyboardEvent, i: number) {
		if (e.key === 'Backspace' && !digits[i] && i > 0) inputs[i - 1]?.focus();
	}

	function handlePaste(e: ClipboardEvent) {
		e.preventDefault();
		const text = e.clipboardData?.getData('text').replace(/\D/g, '').slice(0, 6) ?? '';
		for (let i = 0; i < 6; i++) digits[i] = text[i] ?? '';
		inputs[Math.min(text.length, 5)]?.focus();
	}
</script>

<svelte:head>
	<title>MFA Settings</title>
	<meta
		name="description"
		content="Manage your multi-factor authentication settings to secure your account."
	/>
</svelte:head>

<div class="flex flex-col">
	{#if !mfaEnabled}
		{#if !qrCode}
			<div class="flex flex-col gap-2">
				<p class="font-semibold">Authenticator App</p>
				<p class="text-sm text-base-content/50">
					Scan a QR code with your authenticator app to get started.
				</p>
				<button class="btn w-fit btn-primary" type="button" onclick={() => generateQRCode()}>
					Set up 2FA
				</button>
			</div>
		{:else if success}
			<div class="alert alert-success">2FA has been enabled on your account.</div>
		{:else}
			<div class="flex flex-col items-center gap-6">
				<div class="space-y-1 text-center">
					<p class="font-semibold">Scan this QR code</p>
					<p class="text-sm text-base-content/50">
						Use your authenticator app, then enter the 6-digit code below.
					</p>
				</div>
				<img
					src={'data:image/png;base64,' + qrCode}
					alt="MFA QR Code"
					class="rounded-xl border border-base-300"
				/>
				<div class="flex w-full flex-col items-center gap-1">
					<span class="text-xs text-base-content/40">Manual entry key</span>
					<label class="input w-full">
						<input
							type="text"
							bind:value={secret}
							disabled={true}
							placeholder="secret"
							class="w-full"
						/>
						<span class="label">
							<button class="btn btn-sm" disabled={false} onclick={copySecret}><CopyIcon /></button>
						</span>
					</label>
				</div>
				<div class="flex gap-2">
					{#each digits as digit, i (digit)}
						<input
							type="text"
							inputmode="numeric"
							maxlength="1"
							bind:this={inputs[i]}
							bind:value={digits[i]}
							oninput={(e) => handleInput(e, i)}
							onkeydown={(e) => handleKeydown(e, i)}
							onpaste={(e) => handlePaste(e)}
							class="input-bordered input h-14 w-12 text-center font-mono text-xl font-semibold"
						/>
					{/each}
				</div>
				{#if error}
					<p class="text-sm text-error">{error}</p>
				{/if}
				<button
					class="btn w-full btn-success"
					type="button"
					disabled={!codeComplete}
					onclick={() => verifyMfaCode()}
				>
					Verify & enable 2FA
				</button>
			</div>
		{/if}
	{:else}
		<div class="alert alert-info">2FA is already enabled on your account.</div>
	{/if}
</div>
