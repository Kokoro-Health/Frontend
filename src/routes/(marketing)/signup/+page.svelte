<script lang="ts">
	import { signUp, type SignUpRequestDto } from '$api';
	import { tosUrl } from '$util/webUrl';
	import { Mail, Lock, EyeOff, Eye, CircleX, ArrowLeft, ArrowRight, Check } from '@lucide/svelte';
	import { resolve } from '$app/paths';
	import { hapticImpact, hapticNotification } from '$util/haptics';
	import Confetti from 'svelte-confetti';

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
	let error = $state<string | null>(null);
	let loading = $state(false);
	let emailInput: HTMLInputElement | null = $state(null);
	let showConfetti = $state(false);

	const canProceedToCredentials = $derived(
		signUpData.firstName.trim().length > 0 && signUpData.lastName.trim().length > 0 && !loading
	);

	const loginEnabled = $derived(inputsValid() && !loading);

	function inputsValid(): boolean {
		if (!signUpData.email || !signUpData.password || !signUpData.tosAccepted) return false;
		if (signUpData.password.length < 8) return false;
		if (!emailInput || !emailInput.validity.valid) return false;
		return true;
	}

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
			await hapticNotification('success');
			setTimeout(() => {
				location.reload();
			}, 2000);
		} catch (err: unknown) {
			error = err instanceof Error ? err.message : 'An unexpected error occurred';
			await hapticNotification('error');
		} finally {
			loading = false;
		}
	}

	function goToNextStage() {
		if (canProceedToCredentials) {
			currentStage = STAGE_CREDENTIALS;
			error = null;
			hapticImpact('light');
		}
	}

	function goToPreviousStage() {
		currentStage = STAGE_NAMES;
		error = null;
	}
</script>

<div class="flex min-h-screen w-full flex-col items-center justify-center px-4">
	{#if showConfetti}
		<div class="pointer-events-none fixed inset-0 z-50 flex items-center justify-center">
			<Confetti amount={100} xSpread={70} />
		</div>
	{/if}

	<div class="mb-8 w-full max-w-sm text-center">
		<h1 class="text-2xl font-bold tracking-tight text-base-content">Create account</h1>
		<p class="mt-2 text-sm text-base-content/60">Start tracking your energy today</p>
	</div>

	{#if currentStage === STAGE_CREDENTIALS}
		<button onclick={goToPreviousStage} class="btn mb-4 gap-1 btn-ghost btn-sm">
			<ArrowLeft class="h-4 w-4" /> Back
		</button>
	{/if}

	<form onsubmit={(e) => submitForm(e)} class="flex w-full max-w-sm flex-col gap-4">
		{#if currentStage === STAGE_NAMES}
			<div class="flex w-full flex-col gap-3">
				<div class="grid grid-cols-2 gap-3">
					<div class="flex flex-col gap-1">
						<label class="text-xs font-medium text-base-content/60" for="firstName"
							>First name</label
						>
						<div class="input-bordered input flex h-12 w-full items-center gap-2 bg-base-100 px-3">
							<input
								id="firstName"
								type="text"
								bind:value={signUpData.firstName}
								placeholder="John"
								class="grow bg-transparent outline-none"
								autocomplete="given-name"
							/>
						</div>
					</div>
					<div class="flex flex-col gap-1">
						<label class="text-xs font-medium text-base-content/60" for="lastName">Last name</label>
						<div class="input-bordered input flex h-12 w-full items-center gap-2 bg-base-100 px-3">
							<input
								id="lastName"
								type="text"
								bind:value={signUpData.lastName}
								placeholder="Doe"
								class="grow bg-transparent outline-none"
								autocomplete="family-name"
							/>
						</div>
					</div>
				</div>

				<div class="flex flex-col gap-1">
					<label class="text-xs font-medium text-base-content/60" for="middleName">
						Middle name <span class="text-base-content/40">(optional)</span>
					</label>
					<div class="input-bordered input flex h-12 w-full items-center gap-2 bg-base-100 px-3">
						<input
							id="middleName"
							type="text"
							bind:value={signUpData.middleName}
							placeholder="Middle name"
							class="grow bg-transparent outline-none"
						/>
					</div>
				</div>

				<button
					type="button"
					disabled={!canProceedToCredentials}
					onclick={goToNextStage}
					class="btn h-12 w-full gap-2 text-base font-medium btn-primary"
				>
					Continue
					<ArrowRight class="h-4 w-4" />
				</button>
			</div>
		{:else}
			{#if error}
				<div class="flex items-center gap-2 rounded-xl border border-error/20 bg-error/5 p-3">
					<CircleX class="h-5 w-5 shrink-0 text-error" />
					<span class="text-sm text-error">{error}</span>
				</div>
			{/if}

			<div class="flex flex-col gap-1">
				<label class="text-xs font-medium text-base-content/60" for="email">Email</label>
				<div class="input-bordered input flex h-12 w-full items-center gap-2 bg-base-100 px-3">
					<Mail class="h-4 w-4 shrink-0 text-base-content/40" />
					<input
						id="email"
						type="email"
						bind:this={emailInput}
						bind:value={signUpData.email}
						placeholder="you@example.com"
						class="grow bg-transparent outline-none"
						autocomplete="email"
					/>
				</div>
			</div>

			<div class="flex flex-col gap-1">
				<label class="text-xs font-medium text-base-content/60" for="password">Password</label>
				<div class="input-bordered input flex h-12 w-full items-center gap-2 bg-base-100 px-3">
					<Lock class="h-4 w-4 shrink-0 text-base-content/40" />
					<input
						id="password"
						type={showPassword ? 'text' : 'password'}
						bind:value={signUpData.password}
						placeholder="At least 8 characters"
						class="grow bg-transparent outline-none"
						autocomplete="new-password"
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

			<div class="flex items-start gap-2">
				<input
					type="checkbox"
					bind:checked={signUpData.tosAccepted}
					class="checkbox mt-0.5 checkbox-sm checkbox-primary"
					id="tosAccepted"
				/>
				<label for="tosAccepted" class="cursor-pointer text-sm text-base-content/70">
					I agree to the <a
						target="_blank"
						rel="noopener noreferrer"
						href={tosUrl}
						class="text-primary">Terms of Service</a
					>
				</label>
			</div>

			<button
				disabled={!loginEnabled}
				type="submit"
				class="btn h-12 w-full gap-2 text-base font-medium btn-primary"
			>
				{#if loading}
					<span class="loading loading-sm loading-spinner"></span>
				{:else}
					Create Account
					<Check class="h-4 w-4" />
				{/if}
			</button>
		{/if}
	</form>

	<p class="mt-6 text-sm text-base-content/60">
		Already have an account?
		<a href={resolve('/login')} class="font-medium text-primary">Sign in</a>
	</p>
</div>
