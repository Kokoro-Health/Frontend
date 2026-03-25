<script lang="ts">
	import { signUp, type SignUpRequestDto } from '$lib/api';
	import {
		MailIcon,
		KeyRoundIcon,
		EyeOffIcon,
		EyeIcon,
		CircleXIcon,
		ArrowLeftIcon
	} from '@lucide/svelte';
	import Confetti from 'svelte-confetti';

	const iconSize = 16;
	const STAGE_NAMES = 1;
	const STAGE_CREDENTIALS = 2;

	let signUpData: SignUpRequestDto = $state({
		email: '',
		password: '',
		firstName: '',
		middleName: '',
		lastName: '',
		tosAccepted: false
	});
	let currentStage = $state(STAGE_NAMES);
	let showPassword = $state(false);
	let error: string | null = $state(null);
	let loading = $state(false);
	let emailInput: HTMLInputElement | null = $state(null);
	let showConfetti = $state(false);

	const canProceedToCredentials = $derived(
		signUpData.firstName.trim().length > 0 && signUpData.lastName.trim().length > 0 && !loading
	);

	const loginEnabled = $derived(inputsValid() && !loading);

	async function submitForm(e: SubmitEvent) {
		e.preventDefault();
		loading = true;
		error = null;
		try {
			const res = await signUp({
				body: signUpData,
				credentials: 'include'
			});
			if (res.error) {
				throw new Error(res.error.message);
			}
			showConfetti = true;
			setTimeout(() => {
				location.reload();
			}, 2000);
		} catch (err: unknown) {
			error = err instanceof Error ? err.message : 'An unexpected error occurred';
		} finally {
			loading = false;
		}
	}

	function goToNextStage() {
		if (canProceedToCredentials) {
			currentStage = STAGE_CREDENTIALS;
			error = null;
		}
	}

	function goToPreviousStage() {
		currentStage = STAGE_NAMES;
		error = null;
	}

	function inputsValid(): boolean {
		if (!signUpData.email || !signUpData.password || !signUpData.tosAccepted) return false;
		if (signUpData.password.length < 8) return false;
		if (!emailInput || !emailInput.validity.valid) return false;
		return true;
	}
</script>

<div class="flex min-h-screen w-full items-center justify-center py-6">
	{#if showConfetti}
		<div class="pointer-events-none fixed inset-0 z-50 flex items-center justify-center">
			<Confetti amount={150} xSpread={70} />
		</div>
	{/if}

	<form
		onsubmit={(e) => submitForm(e)}
		class="card flex w-full max-w-lg flex-col gap-6 rounded-xl p-6 sm:p-8"
	>
		<div class="flex flex-col items-center text-center">
			<h1 class="text-2xl font-bold tracking-tight text-base-content sm:text-3xl">
				Welcome to Kokoro!
			</h1>
			<p class="mt-2 text-sm text-base-content/70">Create your secure account</p>
		</div>

		{#if currentStage === STAGE_CREDENTIALS}
			<button
				type="button"
				onclick={goToPreviousStage}
				class="btn gap-1 self-start btn-ghost btn-sm"
			>
				<ArrowLeftIcon size={iconSize} />
				<span>Back</span>
			</button>
		{/if}

		<div class="flex flex-col gap-4">
			{#if currentStage === STAGE_NAMES}
				<div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
					<label class="input-bordered input flex w-full items-center gap-2">
						<input
							type="text"
							bind:value={signUpData.firstName}
							placeholder="First name"
							class="grow"
							autocomplete="name"
						/>
					</label>
					<label class="input-bordered input flex w-full items-center gap-2">
						<input
							type="text"
							bind:value={signUpData.middleName}
							placeholder="Middle name"
							class="grow"
						/>
					</label>
					<label class="input-bordered input flex w-full items-center gap-2">
						<input
							type="text"
							bind:value={signUpData.lastName}
							placeholder="Last name"
							class="grow"
							autocomplete="family-name"
						/>
					</label>
				</div>

				<button
					type="button"
					disabled={!canProceedToCredentials}
					onclick={goToNextStage}
					class="btn w-full font-medium transition-opacity btn-primary disabled:cursor-not-allowed disabled:opacity-70"
				>
					Continue
				</button>
			{:else}
				<label
					class="input-bordered input flex w-full items-center gap-2 focus-within:ring-2 focus-within:ring-primary"
				>
					<MailIcon size={iconSize} class="shrink-0 text-base-content/60" />
					<input
						type="email"
						bind:this={emailInput}
						bind:value={signUpData.email}
						placeholder="someone@example.com"
						class="grow bg-transparent outline-none"
						autocomplete="email"
					/>
				</label>

				<label
					class="input-bordered input flex w-full items-center gap-2 focus-within:ring-2 focus-within:ring-primary"
				>
					<KeyRoundIcon size={iconSize} class="shrink-0 text-base-content/60" />
					<input
						type={showPassword ? 'text' : 'password'}
						bind:value={signUpData.password}
						placeholder="Password"
						class="grow bg-transparent outline-none"
						autocomplete="new-password"
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

				{#if error}
					<div class="alert flex items-center gap-3 rounded-lg p-4 text-sm alert-error">
						<CircleXIcon size={iconSize} />
						<span>{error}</span>
					</div>
				{/if}

				<div class="flex items-center gap-2">
					<input
						type="checkbox"
						bind:checked={signUpData.tosAccepted}
						class="checkbox h-5 w-5 checkbox-primary"
						name="tosAccepted"
					/>
					<label for="tosAccepted" class="m-0 label cursor-pointer p-0 text-sm">
						<span class="label-text">
							I accept the <a href="#" class="link link-primary">Terms of Service</a>.
						</span>
					</label>
				</div>

				<button
					disabled={!loginEnabled}
					type="submit"
					class="btn w-full font-medium transition-opacity btn-primary disabled:cursor-not-allowed disabled:opacity-70"
				>
					{#if loading}
						<span class="loading loading-sm loading-spinner"></span>
						<span>Creating Account...</span>
					{:else}
						<span>Sign Up</span>
					{/if}
				</button>
			{/if}
		</div>

		<div class="divider my-2">OR</div>

		<div>
			<a href="/login" class="btn w-full btn-outline btn-secondary">Login instead</a>
		</div>
	</form>
</div>
