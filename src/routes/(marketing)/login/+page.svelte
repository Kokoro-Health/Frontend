<script lang="ts">
	import { signIn, type SignInRequestDto } from '$lib/api';
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
	let loginEnabled = $derived(inputsValid());
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
		if (mfaRequired) return signInData.mfaCode.length === 6;
		if (
			signInData.password.length < 8 ||
			!signInData.email ||
			!emailInput ||
			!emailInput.validity.valid
		)
			return false;
		return true;
	}
</script>

<div class="flex min-h-screen w-full items-center justify-center">
	<form
		onsubmit={(e) => submitForm(e)}
		class="card flex w-full max-w-xl flex-col space-y-5 rounded-box bg-base-200 p-8"
	>
		<div class="mb-3 flex flex-col space-y-3">
			<span class="text-2xl font-semibold">Welcome back!</span>
			<span>Are you new to Kokoro? <a class="link" href="/signup">Sign up here.</a></span>
		</div>
		<div class="flex flex-col space-y-3">
			<label class="input w-full">
				<span class="label"><MailIcon size={iconSize} /></span>
				<input
					type="email"
					bind:this={emailInput}
					bind:value={signInData.email}
					disabled={mfaRequired}
					placeholder="someone@example.com"
				/>
			</label>
			<label class="input w-full">
				<span class="label"><KeyRoundIcon size={iconSize} /></span>
				<input
					type={showPassword ? 'text' : 'password'}
					bind:value={signInData.password}
					disabled={mfaRequired}
					placeholder="Password"
				/>
				<span class="label">
					<button
						type="button"
						class="hover:cursor-pointer"
						onclick={() => (showPassword = !showPassword)}
					>
						{#if showPassword}
							<EyeIcon size={iconSize} />
						{:else}
							<EyeOffIcon size={iconSize} />
						{/if}
					</button>
				</span>
			</label>
		</div>
		{#if mfaRequired}
			<div class="flex flex-col items-center gap-4 py-2">
				<div class="space-y-1 text-center">
					<p class="font-semibold">Two-factor authentication</p>
					<p class="text-sm text-base-content/50">
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
			<div class="card flex flex-row items-center justify-start space-x-3 bg-error p-4">
				<span class="min-w-6"><CircleXIcon /></span>
				<span>{error}</span>
			</div>
		{/if}
		{#if !mfaRequired}
			<div class="flex justify-between">
				<label class="label w-full">
					<input type="checkbox" bind:checked={signInData.rememberMe} class="checkbox" />
					Remember me
				</label>
				<span class="w-full text-end">
					<a class="link link-hover" href="/reset-password">Forgot password</a>
				</span>
			</div>
		{/if}
		<button disabled={!loginEnabled} type="submit" class="btn btn-primary">
			{#if loading}
				<div class="loading loading-sm"></div>
			{/if}
			<span>{mfaRequired ? 'Verify' : 'Login'}</span>
		</button>
	</form>
</div>
