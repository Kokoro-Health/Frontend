<script lang="ts">
	import { signIn, type SignInRequestDto } from '$api';
	import { Mail, Lock, EyeOff, Eye, CircleX, ArrowRight } from '@lucide/svelte';
	import { resolve } from '$app/paths';
	import { hapticImpact, hapticNotification } from '$util/haptics';

	let signInData: SignInRequestDto = $state({
		email: '',
		password: '',
		rememberMe: false,
		mfaCode: ''
	});
	let showPassword = $state(false);
	let error = $state<string | null>(null);
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
					hapticImpact('medium');
					return;
				}
				location.reload();
			})
			.catch((e: Error) => {
				error = e.message;
				hapticNotification('error');
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

<div class="flex min-h-screen w-full flex-col items-center justify-center px-4">
	<div class="mb-8 w-full max-w-sm text-center">
		<h1 class="text-3xl font-bold tracking-tight text-base-content">Welcome back</h1>
		<p class="mt-2 text-sm text-base-content/60">Sign in to your account</p>
	</div>

	<form onsubmit={(e) => submitForm(e)} class="flex w-full max-w-sm flex-col gap-5">
		{#if error}
			<div class="flex items-center gap-2 rounded-xl border border-error/20 bg-error/5 p-3">
				<CircleX class="h-5 w-5 shrink-0 text-error" />
				<span class="text-sm text-error">{error}</span>
			</div>
		{/if}

		<div class="flex w-full flex-col gap-1">
			<label class="text-xs font-medium text-base-content/60" for="email">Email</label>
			<div class="input-bordered input flex h-12 w-full items-center gap-2 bg-base-100 px-3">
				<Mail class="h-4 w-4 shrink-0 text-base-content/40" />
				<input
					id="email"
					type="email"
					bind:this={emailInput}
					bind:value={signInData.email}
					disabled={mfaRequired}
					placeholder="you@example.com"
					class="grow bg-transparent outline-none"
					autocomplete="email"
				/>
			</div>
		</div>

		<div class="flex w-full flex-col gap-1">
			<label class="text-xs font-medium text-base-content/60" for="password">Password</label>
			<div class="input-bordered input flex h-12 w-full items-center gap-2 bg-base-100 px-3">
				<Lock class="h-4 w-4 shrink-0 text-base-content/40" />
				<input
					id="password"
					type={showPassword ? 'text' : 'password'}
					bind:value={signInData.password}
					disabled={mfaRequired}
					placeholder="Password"
					class="grow bg-transparent outline-none"
					autocomplete="current-password"
				/>
				<button
					type="button"
					onclick={() => (showPassword = !showPassword)}
					class="btn btn-square btn-ghost btn-sm"
				>
					{#if showPassword}
						<EyeOff class="h-4 w-4" />
					{:else}
						<Eye class="h-4 w-4" />
					{/if}
				</button>
			</div>
		</div>

		{#if mfaRequired}
			<div class="flex w-full flex-col gap-3 py-2">
				<div class="text-center">
					<p class="text-sm font-medium">Two-factor authentication</p>
					<p class="mt-1 text-xs text-base-content/50">Enter the 6-digit code from your app</p>
				</div>
				<div class="flex w-full justify-center gap-2">
					{#each mfaDigits as digit, i (i)}
						<input
							type="text"
							inputmode="numeric"
							maxlength="1"
							bind:this={mfaInputs[i]}
							bind:value={mfaDigits[i]}
							oninput={(e) => handleMfaInput(e, i)}
							onkeydown={(e) => handleMfaKeydown(e, i)}
							onpaste={(e) => handleMfaPaste(e)}
							class="input-bordered input h-12 w-10 text-center font-mono text-lg"
						/>
					{/each}
				</div>
			</div>
		{/if}

		{#if !mfaRequired}
			<div class="flex w-full items-center justify-between">
				<label class="flex w-auto items-center gap-2">
					<input
						type="checkbox"
						bind:checked={signInData.rememberMe}
						class="checkbox checkbox-sm checkbox-primary"
						name="rememberMe"
					/>
					<span class="text-sm text-base-content/70">Remember me</span>
				</label>
				<a href={resolve('/reset-password')} class="text-sm text-primary">Forgot password?</a>
			</div>
		{/if}

		<button
			disabled={!loginEnabled}
			type="submit"
			class="btn h-12 w-full gap-2 text-base font-medium btn-primary"
		>
			{#if loading}
				<span class="loading loading-sm loading-spinner"></span>
			{/if}
			{mfaRequired ? 'Verify' : 'Sign in'}
			{#if !loading}
				<ArrowRight class="h-4 w-4" />
			{/if}
		</button>
	</form>

	<p class="mt-6 text-sm text-base-content/60">
		Don't have an account?
		<a href={resolve('/signup')} class="font-medium text-primary">Create one</a>
	</p>
</div>
