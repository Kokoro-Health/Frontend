<script lang="ts">
	import { setupMfa, verifyMfaCodeAndEnable } from '$api';
	import { Clipboard } from '@capacitor/clipboard';
	import { Copy, Shield, Check, Smartphone } from '@lucide/svelte';
	import { hapticImpact, hapticNotification } from '$util/haptics';

	let { mfaEnabled }: { mfaEnabled: boolean } = $props();

	let qrCode: string | null = $state(null);
	let secret: string | null = $state(null);
	let digits = $state(['', '', '', '', '', '']);
	let inputs: (HTMLInputElement | null)[] = $state([null, null, null, null, null, null]);
	let error = $state<string | null>(null);
	let success = $state(false);
	let loading = $state(false);

	let code = $derived(digits.join(''));
	let codeComplete = $derived(code.length === 6);

	async function copySecret() {
		if (!secret) return;
		await Clipboard.write({ string: secret });
		hapticImpact('light');
	}

	async function generateQRCode() {
		loading = true;
		error = null;

		try {
			const res = await setupMfa();
			if (res.data) {
				qrCode = res.data.qrCodeBase64;
				secret = res.data.secret;
			} else if ((res as { error?: unknown }).error) {
				const errObj = (res as { error?: unknown }).error;
				const errMsg =
					typeof errObj === 'string'
						? errObj
						: ((errObj as { message?: string })?.message ?? 'Failed to setup 2FA');
				error = errMsg;
			}
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to setup 2FA';
		} finally {
			loading = false;
		}
	}

	async function verifyMfaCode() {
		if (!codeComplete) return;
		error = null;
		loading = true;

		try {
			const res = await verifyMfaCodeAndEnable({ body: { code } });
			if (res.data) {
				success = true;
				await hapticNotification('success');
			} else if ((res as { error?: unknown }).error) {
				const errObj = (res as { error?: unknown }).error;
				const errMsg =
					typeof errObj === 'string'
						? errObj
						: ((errObj as { message?: string })?.message ?? 'Invalid code');
				error = errMsg;
				await hapticNotification('error');
				digits = ['', '', '', '', '', ''];
				setTimeout(() => inputs[0]?.focus(), 0);
			}
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to verify code';
			await hapticNotification('error');
			digits = ['', '', '', '', '', ''];
			setTimeout(() => inputs[0]?.focus(), 0);
		} finally {
			loading = false;
		}
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

<div class="rounded-2xl border border-base-200/60 bg-base-100/60 p-4">
	<div class="mb-4 flex items-center gap-3">
		<div class="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
			<Shield class="h-5 w-5 text-primary" />
		</div>
		<div class="flex flex-col gap-0.5">
			<span class="text-sm font-semibold">Two-Factor Authentication</span>
			<span class="text-xs text-base-content/50">Secure your account with an authenticator app</span
			>
		</div>
	</div>

	{#if mfaEnabled}
		<div class="flex items-center gap-2 rounded-xl bg-success/10 p-3">
			<Check class="h-5 w-5 text-success" />
			<span class="text-sm font-medium text-success">2FA is enabled</span>
		</div>
	{:else if !qrCode}
		<div class="flex flex-col gap-3">
			<div class="flex items-start gap-3 rounded-xl bg-base-200/30 p-3">
				<Smartphone class="mt-0.5 h-5 w-5 shrink-0 text-base-content/50" />
				<p class="text-sm text-base-content/70">
					Use an authenticator app like Google Authenticator or Authy to scan the QR code.
				</p>
			</div>
			<button
				class="btn btn-sm btn-primary"
				type="button"
				onclick={() => generateQRCode()}
				disabled={loading}
			>
				{#if loading}
					<span class="loading loading-xs loading-spinner"></span>
				{/if}
				Set up 2FA
			</button>
		</div>
	{:else if success}
		<div class="flex flex-col items-center gap-3 py-4 text-center">
			<div class="flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
				<Check class="h-8 w-8 text-success" />
			</div>
			<div>
				<p class="font-semibold text-success">2FA Enabled!</p>
				<p class="mt-1 text-sm text-base-content/60">Your account is now more secure.</p>
			</div>
		</div>
	{:else}
		<div class="flex flex-col items-center gap-4">
			<div class="space-y-2 text-center">
				<p class="text-sm font-medium">Scan this QR code</p>
				<p class="text-xs text-base-content/50">Then enter the 6-digit code below</p>
			</div>

			<img
				src={'data:image/png;base64,' + qrCode}
				alt="MFA QR Code"
				class="rounded-xl border border-base-200 shadow-sm"
			/>

			<div class="flex w-full items-center gap-2">
				<input
					type="text"
					bind:value={secret}
					disabled={true}
					class="input-bordered input input-sm flex-1 bg-base-200/30 text-xs"
					placeholder="Secret key"
				/>
				<button class="btn btn-square btn-ghost btn-sm" onclick={copySecret}>
					<Copy size={16} />
				</button>
			</div>

			<div class="flex gap-1.5">
				<!-- eslint-disable-next-line @typescript-eslint/no-unused-vars -->
				{#each digits as _, i (i)}
					<input
						type="text"
						inputmode="numeric"
						maxlength="1"
						bind:this={inputs[i]}
						bind:value={digits[i]}
						oninput={(e) => handleInput(e, i)}
						onkeydown={(e) => handleKeydown(e, i)}
						onpaste={(e) => handlePaste(e)}
						class="input-bordered input input-sm h-10 w-10 text-center font-mono text-lg"
					/>
				{/each}
			</div>

			{#if error}
				<p class="text-sm text-error">{error}</p>
			{/if}

			<button
				class="btn w-full btn-sm btn-primary"
				type="button"
				disabled={!codeComplete || loading}
				onclick={() => verifyMfaCode()}
			>
				{#if loading}
					<span class="loading loading-xs loading-spinner"></span>
				{/if}
				Verify & Enable
			</button>
		</div>
	{/if}
</div>
