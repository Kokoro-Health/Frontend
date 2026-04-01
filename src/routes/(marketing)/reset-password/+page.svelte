<script lang="ts">
	import { requestPasswordReset, resetPassword, validatePasswordResetCode } from '$api';
	import {
		HouseIcon,
		Loader2Icon,
		AlertCircleIcon,
		ArrowRightIcon,
		LockIcon,
		ShieldCheckIcon
	} from '@lucide/svelte';
	import { onMount } from 'svelte';

	let { data } = $props();

	const STAGE_REQUEST = 'request';
	const STAGE_CODE = 'code';
	const STAGE_PASSWORD = 'password';
	const STAGE_SUCCESS = 'success';

	const MIN_PASSWORD_LENGTH = 8;
	const CODE_LENGTH = 6;

	const ERROR_INVALID_EMAIL = 'Invalid email format';
	const ERROR_INVALID_CODE = 'Invalid verification code';
	const ERROR_PASSWORD_TOO_SHORT = 'Password must be at least 8 characters';
	const ERROR_PASSWORD_MISMATCH = 'Passwords do not match';
	const ERROR_API_GENERIC = 'An unexpected error occurred';

	let stage = $state(STAGE_REQUEST);
	let code = $state('');
	let newPassword = $state('');
	let confirmPassword = $state('');
	let email = $state('');
	let loading = $state(false);
	let error = $state<string | null>(null);

	onMount(() => {
		if (data.profile?.email) {
			email = data.profile.email;
		}
	});

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
			error = ERROR_INVALID_EMAIL;
			return;
		}

		loading = true;
		error = null;

		try {
			await requestPasswordReset({
				query: { email }
			});
			stage = STAGE_CODE;
		} catch (err) {
			error = err instanceof Error ? err.message : ERROR_API_GENERIC;
		} finally {
			loading = false;
		}
	}

	async function handleCodeSubmit(e: Event) {
		e.preventDefault();

		if (!isValidCode(code)) {
			error = ERROR_INVALID_CODE;
			return;
		}

		loading = true;
		error = null;

		try {
			await validatePasswordResetCode({
				query: { code }
			}).then((res) => {
				if (res.error?.message) {
					throw Error(res.error.message);
				}
			});
			stage = STAGE_PASSWORD;
		} catch (err) {
			error = err instanceof Error ? err.message : ERROR_API_GENERIC;
		} finally {
			loading = false;
		}
	}

	async function handlePasswordSubmit(e: Event) {
		e.preventDefault();
		if (!isValidPassword(newPassword)) {
			error = ERROR_PASSWORD_TOO_SHORT;
			return;
		}
		if (newPassword !== confirmPassword) {
			error = ERROR_PASSWORD_MISMATCH;
			return;
		}

		loading = true;
		error = null;

		try {
			await resetPassword({
				body: { code, password: newPassword }
			}).then((res) => {
				if (res.error?.message) throw Error(res.error.message);
			});
			stage = STAGE_SUCCESS;
		} catch (err) {
			error = err instanceof Error ? err.message : ERROR_API_GENERIC;
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

<div class="flex flex-col justify-center gap-6 px-4 pt-safe">
	<div class="flex flex-row items-center justify-between">
		<span class="text-xl font-bold tracking-tight text-base-content sm:text-2xl"
			>Reset Password</span
		>
		<button
			class="btn btn-circle btn-ghost btn-sm"
			onclick={() => (window.location.href = '/')}
			aria-label="Go home"
		>
			<HouseIcon size={18} />
		</button>
	</div>

	{#if error}
		<div role="alert" class="mb-2 alert alert-error shadow-sm">
			<AlertCircleIcon size={18} class="shrink-0" />
			<span class="text-sm">{error}</span>
		</div>
	{/if}

	{#if stage === STAGE_REQUEST}
		<div class="flex flex-col gap-4">
			<p class="text-sm text-base-content/70">
				Enter your email address and we'll send you a verification code.
			</p>
			<form onsubmit={handleRequestSubmit} class="flex flex-col gap-3">
				<div class="form-control w-full">
					<div class="join w-full">
						<input
							id="email-input"
							type="email"
							class="input-bordered input join-item w-full focus:outline-none"
							placeholder="you@example.com"
							bind:value={email}
							required
							autocomplete="email"
							disabled={loading}
						/>
						<button type="submit" class="btn join-item btn-primary" disabled={loading || !email}>
							{#if loading}
								<Loader2Icon class="animate-spin" size={18} />
							{:else}
								<ArrowRightIcon size={18} />
							{/if}
						</button>
					</div>
				</div>
			</form>
		</div>
	{:else if stage === STAGE_CODE}
		<div class="flex flex-col gap-4">
			<p class="text-sm text-base-content/70">
				We sent a code to <strong>{email}</strong>. Enter it below.
			</p>
			<form onsubmit={handleCodeSubmit} class="flex flex-col gap-3">
				<div class="form-control w-full">
					<div class="join w-full">
						<input
							id="code-input"
							type="text"
							inputmode="numeric"
							class="input-bordered input join-item w-full text-center tracking-widest focus:outline-none"
							placeholder="123456"
							bind:value={code}
							required
							autocomplete="one-time-code"
							disabled={loading}
						/>
						<button
							type="submit"
							class="btn join-item btn-primary"
							disabled={loading || code.length != CODE_LENGTH}
						>
							{#if loading}
								<Loader2Icon class="animate-spin" size={18} />
							{:else}
								<ArrowRightIcon size={18} />
							{/if}
						</button>
					</div>
				</div>
				<button type="button" class="btn self-start btn-ghost btn-xs" onclick={resetFlow}>
					Wrong email?
				</button>
			</form>
		</div>
	{:else if stage === STAGE_PASSWORD}
		<div class="flex flex-col gap-4">
			<p class="text-sm text-base-content/70">Choose a strong password for your account.</p>
			<form onsubmit={handlePasswordSubmit} class="flex flex-col gap-3">
				<div class="form-control w-full">
					<label class="label" for="newPassword">
						<span class="label-text-alt">New Password</span>
					</label>
					<div class="join w-full">
						<input
							name="newPassword"
							id="new-password"
							type="password"
							class="input-bordered input join-item w-full focus:outline-none"
							placeholder="Password"
							autocomplete="new-password"
							bind:value={newPassword}
							required
							disabled={loading}
						/>
						<button
							type="submit"
							class="btn join-item btn-primary"
							disabled={loading || !newPassword}
						>
							{#if loading}
								<Loader2Icon class="animate-spin" size={18} />
							{:else}
								<LockIcon size={18} />
							{/if}
						</button>
					</div>
				</div>

				<div class="form-control w-full">
					<label class="label" for="confirmPassword">
						<span class="label-text-alt">Confirm Password</span>
					</label>
					<input
						name="confirmPassword"
						id="confirm-password"
						type="password"
						class="input-bordered input w-full focus:outline-none"
						placeholder="Password"
						autocomplete="current-password"
						bind:value={confirmPassword}
						required
						disabled={loading}
					/>
				</div>
			</form>
		</div>
	{:else if stage === STAGE_SUCCESS}
		<div
			class="animate-in fade-in zoom-in flex flex-col items-center justify-center gap-4 py-6 text-center duration-300"
		>
			<div class="rounded-full bg-success/10 p-4 ring-4 ring-success/20">
				<ShieldCheckIcon class="text-success" size={48} />
			</div>
			<h2 class="text-xl font-bold">Password Updated</h2>
			<p class="max-w-xs text-sm text-base-content/70">
				Your password has been successfully reset. You can now log in with your new credentials.
			</p>
			<a href="/" class="btn mt-2 w-full max-w-xs btn-primary">
				<LockIcon size={16} />
				Back to Login
			</a>
		</div>
	{/if}
</div>
