<script lang="ts">
	import { signIn, type SignInRequestDto } from '$api';
	import { MailIcon, KeyRoundIcon, EyeOffIcon, EyeIcon, CircleXIcon } from '@lucide/svelte';

	const iconSize = 16;

	let signInData: SignInRequestDto = $state({
		email: '',
		password: '',
		rememberMe: false,
		mfaCode: ''
	});
	let showPassword = $state(false);
	let error: string | null = $state(null);
	let loading = $state(false);
	let emailInput: HTMLInputElement | null = $state(null);
	let mfaRequired = $state(false);
	let mfaDigits = $state(['', '', '', '', '', '']);
	let mfaInputs: (HTMLInputElement | null)[] = $state([null, null, null, null, null, null]);

	$effect(() => {
		signInData.mfaCode = mfaDigits.join('');
	});

	$effect(() => {
		if (mfaRequired) setTimeout(() => mfaInputs[0]?.focus(), 0);
	});

	function handleMfaInput(e: Event, i: number) {
		const val = (e.target as HTMLInputElement).value.replace(/\D/g, '').slice(-1);
		mfaDigits[i] = val;
		if (val && i < 5) mfaInputs[i + 1]?.focus();
	}

	function handleMfaKeydown(e: KeyboardEvent, i: number) {
		if (e.key === 'Backspace' && !mfaDigits[i] && i > 0) mfaInputs[i - 1]?.focus();
	}

	function handleMfaPaste(e: ClipboardEvent) {
		e.preventDefault();
		const text = e.clipboardData?.getData('text').replace(/\D/g, '').slice(0, 6) ?? '';
		for (let i = 0; i < 6; i++) mfaDigits[i] = text[i] ?? '';
		mfaInputs[Math.min(text.length, 5)]?.focus();
	}

	async function submitForm(e: SubmitEvent) {
		e.preventDefault();
		loading = true;
		error = null;
		await signIn({ body: signInData, credentials: 'include' })
			.then((res) => {
				if (res.error) throw Error(res.error.message);
				else if (res.data.mfaRequired) {
					mfaRequired = true;
					return;
				}
				location.reload();
			})
			.catch((e: Error) => {
				error = e.message;
			})
			.finally(() => {
				loading = false;
			});
	}

	function inputsValid(): boolean {
		if (mfaRequired) return signInData.mfaCode?.length === 6;
		if (
			signInData.password.length < 8 ||
			!signInData.email ||
			!emailInput ||
			!emailInput.validity.valid
		)
			return false;
		return true;
	}

	const loginEnabled = $derived(inputsValid() && !loading);
</script>

<div class="flex min-h-screen w-full items-center justify-center py-6">
	<form
		onsubmit={(e) => submitForm(e)}
		class="card flex w-full max-w-lg flex-col gap-6 rounded-xl p-6 sm:p-8"
	>
		<div class="flex flex-col items-center text-center">
			<h1 class="text-2xl font-bold tracking-tight text-base-content sm:text-3xl">Welcome back!</h1>
			<p class="mt-2 text-sm text-base-content/70">Sign in to your account.</p>
		</div>

		<div class="flex flex-col gap-4">
			<label
				class="input-bordered input flex w-full items-center gap-2 focus-within:ring-2 focus-within:ring-primary"
			>
				<MailIcon size={iconSize} class="shrink-0 text-base-content/60" />
				<input
					type="email"
					bind:this={emailInput}
					bind:value={signInData.email}
					disabled={mfaRequired}
					placeholder="someone@example.com"
					class="w-full grow bg-transparent outline-none"
					autocomplete="email"
				/>
			</label>

			<label
				class="input-bordered input flex w-full items-center gap-2 focus-within:ring-2 focus-within:ring-primary"
			>
				<KeyRoundIcon size={iconSize} class="shrink-0 text-base-content/60" />
				<input
					type={showPassword ? 'text' : 'password'}
					bind:value={signInData.password}
					disabled={mfaRequired}
					placeholder="Password"
					class="w-full grow bg-transparent outline-none"
					autocomplete="current-password"
				/>
				<button
					type="button"
					onclick={() => (showPassword = !showPassword)}
					class="btn shrink-0 btn-ghost btn-xs"
					aria-label={showPassword ? 'Hide password' : 'Show password'}
				>
					{#if showPassword}
						<EyeIcon size={iconSize} />
					{:else}
						<EyeOffIcon size={iconSize} />
					{/if}
				</button>
			</label>
		</div>

		{#if mfaRequired}
			<div class="flex flex-col items-center gap-4 py-2">
				<div class="space-y-1 text-center">
					<p class="font-semibold">Two-factor authentication</p>
					<p class="text-sm text-base-content/70">
						Enter the 6-digit code from your authenticator app.
					</p>
				</div>
				<div class="flex gap-2">
					{#each mfaDigits as _, i}
						<input
							type="text"
							inputmode="numeric"
							maxlength="1"
							bind:this={mfaInputs[i]}
							bind:value={mfaDigits[i]}
							oninput={(e) => handleMfaInput(e, i)}
							onkeydown={(e) => handleMfaKeydown(e, i)}
							onpaste={(e) => handleMfaPaste(e)}
							class="input-bordered input h-14 w-12 text-center font-mono text-xl font-semibold"
						/>
					{/each}
				</div>
			</div>
		{/if}

		{#if error}
			<div class="alert flex items-center gap-3 rounded-lg p-4 text-sm alert-error">
				<CircleXIcon size={iconSize} />
				<span>{error}</span>
			</div>
		{/if}

		{#if !mfaRequired}
			<div class="flex justify-between">
				<div class="flex items-center gap-2">
					<input
						type="checkbox"
						bind:checked={signInData.rememberMe}
						class="checkbox h-5 w-5 checkbox-primary"
						name="rememberMe"
					/>
					<label for="rememberMe" class="m-0 label cursor-pointer p-0 text-sm">
						<span class="label-text">Remember me</span>
					</label>
				</div>
				<span class="text-sm">
					<a href="/reset-password" class="link link-primary">Forgot password?</a>
				</span>
			</div>
		{/if}

		<button
			disabled={!loginEnabled}
			type="submit"
			class="btn w-full font-medium transition-opacity btn-primary disabled:cursor-not-allowed disabled:opacity-70"
		>
			{#if loading}
				<span class="loading loading-sm loading-spinner"></span>
				<span>{mfaRequired ? 'Verifying...' : 'Logging in...'}</span>
			{:else}
				<span>{mfaRequired ? 'Verify' : 'Login'}</span>
			{/if}
		</button>

		<div class="divider my-2">OR</div>

		<div>
			<a href="/signup" class="btn w-full btn-outline btn-secondary">Create account</a>
		</div>
	</form>
</div>
