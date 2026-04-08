<script lang="ts">
	import { requestPasswordReset, resetPassword, validatePasswordResetCode } from '$api';
	import { AlertCircle, ArrowLeft, Lock, ShieldCheck, Mail } from '@lucide/svelte';
	import { resolve } from '$app/paths';
	import { hapticImpact, hapticNotification } from '$util/haptics';

	const STAGE_REQUEST = 'request';
	const STAGE_CODE = 'code';
	const STAGE_PASSWORD = 'password';
	const STAGE_SUCCESS = 'success';

	const MIN_PASSWORD_LENGTH = 8;
	const CODE_LENGTH = 6;

	let stage = $state(STAGE_REQUEST);
	let code = $state('');
	let newPassword = $state('');
	let confirmPassword = $state('');
	let email = $state('');
	let loading = $state(false);
	let error = $state<string | null>(null);

	function isValidEmail(value: string): boolean {
		return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
	}

	function isValidCode(value: string): boolean {
		return value.length == CODE_LENGTH;
	}

	function isValidPassword(value: string): boolean {
		return value.length >= MIN_PASSWORD_LENGTH;
	}

	async function handleRequestSubmit(e: Event) {
		e.preventDefault();
		if (!isValidEmail(email)) {
			error = 'Please enter a valid email address';
			return;
		}

		loading = true;
		error = null;

		try {
			await requestPasswordReset({ query: { email } });
			stage = STAGE_CODE;
			hapticImpact('medium');
		} catch (err) {
			error = err instanceof Error ? err.message : 'Something went wrong';
			await hapticNotification('error');
		} finally {
			loading = false;
		}
	}

	async function handleCodeSubmit(e: Event) {
		e.preventDefault();
		if (!isValidCode(code)) {
			error = 'Please enter the 6-digit code';
			return;
		}

		loading = true;
		error = null;

		try {
			await validatePasswordResetCode({ query: { code } }).then((res) => {
				if (res.error?.message) throw Error(res.error.message);
			});
			stage = STAGE_PASSWORD;
			hapticImpact('medium');
		} catch (err) {
			error = err instanceof Error ? err.message : 'Invalid code';
			await hapticNotification('error');
		} finally {
			loading = false;
		}
	}

	async function handlePasswordSubmit(e: Event) {
		e.preventDefault();
		if (!isValidPassword(newPassword)) {
			error = 'Password must be at least 8 characters';
			return;
		}
		if (newPassword !== confirmPassword) {
			error = 'Passwords do not match';
			return;
		}

		loading = true;
		error = null;

		try {
			await resetPassword({ body: { code, password: newPassword } }).then((res) => {
				if (res.error?.message) throw Error(res.error.message);
			});
			stage = STAGE_SUCCESS;
			await hapticNotification('success');
		} catch (err) {
			error = err instanceof Error ? err.message : 'Something went wrong';
			await hapticNotification('error');
		} finally {
			loading = false;
		}
	}

	function resetFlow() {
		stage = STAGE_REQUEST;
		error = null;
		code = '';
		newPassword = '';
		confirmPassword = '';
	}
</script>

<div class="flex min-h-screen w-full flex-col items-center justify-center px-4">
	{#if stage === STAGE_SUCCESS}
		<div class="flex w-full max-w-sm flex-col items-center gap-4 text-center">
			<div class="flex h-20 w-20 items-center justify-center rounded-full bg-success/10">
				<ShieldCheck class="h-10 w-10 text-success" />
			</div>
			<h1 class="text-2xl font-bold">Password Reset</h1>
			<p class="text-sm text-base-content/60">
				Your password has been successfully reset. You can now sign in with your new password.
			</p>
			<a href={resolve('/login')} class="btn mt-4 w-full max-w-sm gap-2 btn-primary">
				<Lock class="h-4 w-4" />
				Back to Sign in
			</a>
		</div>
	{:else}
		<div class="mb-8 w-full max-w-sm text-center">
			<div class="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
				<Lock class="h-8 w-8 text-primary" />
			</div>
			<h1 class="text-2xl font-bold tracking-tight">Reset Password</h1>
			<p class="mt-2 text-sm text-base-content/60">
				{#if stage === STAGE_REQUEST}
					Enter your email and we'll send you a code
				{:else if stage === STAGE_CODE}
					Check your email for the code
				{:else}
					Create a new strong password
				{/if}
			</p>
		</div>

		{#if error}
			<div
				class="mb-4 flex w-full max-w-sm items-center gap-2 rounded-xl border border-error/20 bg-error/5 p-3"
			>
				<AlertCircle class="h-5 w-5 shrink-0 text-error" />
				<span class="text-sm text-error">{error}</span>
			</div>
		{/if}

		<form
			class="flex w-full max-w-sm flex-col gap-4"
			onsubmit={(e) => {
				if (stage === STAGE_REQUEST) handleRequestSubmit(e);
				else if (stage === STAGE_CODE) handleCodeSubmit(e);
				else handlePasswordSubmit(e);
			}}
		>
			{#if stage === STAGE_REQUEST}
				<div class="flex w-full flex-col gap-1">
					<label class="text-xs font-medium text-base-content/60" for="reset-email">Email</label>
					<div class="input-bordered input flex h-12 w-full items-center gap-2 bg-base-100 px-3">
						<Mail class="h-4 w-4 shrink-0 text-base-content/40" />
						<input
							id="reset-email"
							type="email"
							class="grow bg-transparent outline-none"
							placeholder="you@example.com"
							bind:value={email}
							autocomplete="email"
							disabled={loading}
						/>
					</div>
				</div>
				<button
					type="submit"
					class="btn h-12 gap-2 text-base font-medium btn-primary"
					disabled={loading || !email}
				>
					{#if loading}
						<span class="loading loading-sm loading-spinner"></span>
					{/if}
					Send Code
				</button>
			{:else if stage === STAGE_CODE}
				<div class="flex flex-col gap-1">
					<label class="text-xs font-medium text-base-content/60" for="reset-code"
						>Verification Code</label
					>
					<input
						id="reset-code"
						type="text"
						inputmode="numeric"
						class="input-bordered input h-12 w-full text-center font-mono text-lg tracking-widest"
						placeholder="123456"
						bind:value={code}
						autocomplete="one-time-code"
						disabled={loading}
					/>
				</div>
				<div class="flex items-center justify-between text-sm">
					<button type="button" class="btn btn-ghost btn-sm" onclick={resetFlow}>
						<ArrowLeft class="h-4 w-4" /> Back
					</button>
					<span class="text-xs text-base-content/50">Sent to {email}</span>
				</div>
				<button
					type="submit"
					class="btn h-12 gap-2 text-base font-medium btn-primary"
					disabled={loading || code.length !== 6}
				>
					{#if loading}
						<span class="loading loading-sm loading-spinner"></span>
					{/if}
					Verify Code
				</button>
			{:else}
				<div class="flex flex-col gap-3">
					<div class="flex flex-col gap-1">
						<label class="text-xs font-medium text-base-content/60" for="new-password"
							>New Password</label
						>
						<input
							id="new-password"
							type="password"
							class="input-bordered input h-12 bg-base-100"
							placeholder="At least 8 characters"
							bind:value={newPassword}
							autocomplete="new-password"
							disabled={loading}
						/>
					</div>
					<div class="flex flex-col gap-1">
						<label class="text-xs font-medium text-base-content/60" for="confirm-password"
							>Confirm Password</label
						>
						<input
							id="confirm-password"
							type="password"
							class="input-bordered input h-12 bg-base-100"
							placeholder="Confirm password"
							bind:value={confirmPassword}
							autocomplete="new-password"
							disabled={loading}
						/>
					</div>
				</div>
				<button
					type="submit"
					class="btn h-12 gap-2 text-base font-medium btn-primary"
					disabled={loading}
				>
					{#if loading}
						<span class="loading loading-sm loading-spinner"></span>
					{/if}
					Reset Password
				</button>
			{/if}
		</form>

		<p class="mt-6 text-sm text-base-content/60">
			Remember your password?
			<a href={resolve('/login')} class="font-medium text-primary">Sign in</a>
		</p>
	{/if}
</div>
