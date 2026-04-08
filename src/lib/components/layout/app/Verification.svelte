<script lang="ts">
	import { requestVerificationCode, verifyCode } from '$api';
	import { Code, X, RefreshCw, CheckCircle } from '@lucide/svelte';

	const CODE_LENGTH = 6;
	const PLACEHOLDER_CODE = '000000';

	let { email, onSuccess }: { email: string; onSuccess: () => void } = $props();

	let verificationModal: HTMLDialogElement | null = $state(null);
	let codeInput: HTMLInputElement | null = $state(null);
	let code = $state('');
	let nextCodeAvailableAt = $state<number | null>(null);
	let isLoading = $state(false);
	let isVerifying = $state(false);
	let errorMessage = $state<string | null>(null);
	let successMessage = $state<string | null>(null);
	let resendSeconds = $state(0);
	let intervalId: ReturnType<typeof setInterval> | null = $state(null);

	let codeInputValid = $derived(code.length === CODE_LENGTH);
	let canResend = $derived(nextCodeAvailableAt !== null && Date.now() >= nextCodeAvailableAt);

	$effect(() => {
		if (intervalId) {
			clearInterval(intervalId);
			intervalId = null;
		}

		if (nextCodeAvailableAt === null || Date.now() >= nextCodeAvailableAt) {
			resendSeconds = 0;
			return;
		}

		intervalId = setInterval(() => {
			if (nextCodeAvailableAt == null) return;
			const remaining = nextCodeAvailableAt - Date.now();

			if (remaining <= 0) {
				resendSeconds = 0;
				clearInterval(intervalId!);
				intervalId = null;
				nextCodeAvailableAt = null;
			} else {
				resendSeconds = Math.ceil(remaining / 1000);
			}
		}, 1000);

		return () => {
			if (intervalId) {
				clearInterval(intervalId);
				intervalId = null;
			}
		};
	});

	function showModal() {
		if (!verificationModal) return;

		errorMessage = null;
		successMessage = null;
		code = '';

		if (!nextCodeAvailableAt) {
			requestCode();
		}

		verificationModal.showModal();

		$effect(() => {
			codeInput?.focus();
			return () => {};
		});
	}

	function closeModal() {
		verificationModal?.close();
		errorMessage = null;
		successMessage = null;
		code = '';
	}

	async function requestCode() {
		if (isLoading) return;

		errorMessage = null;
		isLoading = true;

		try {
			const res = await requestVerificationCode();
			if (res.data?.nextCodeAllowedAt) {
				nextCodeAvailableAt = Date.parse(res.data.nextCodeAllowedAt);
				resendSeconds = Math.ceil((nextCodeAvailableAt - Date.now()) / 1000);
			}
		} catch {
			errorMessage = 'Failed to send verification code';
		} finally {
			isLoading = false;
		}
	}

	async function handleVerify() {
		if (!codeInputValid || isVerifying) return;

		isVerifying = true;
		errorMessage = null;

		try {
			const res = await verifyCode({
				query: { code }
			});

			if (res.error?.message) {
				errorMessage = res.error.message;
			} else {
				successMessage = 'Email verified successfully!';
				setTimeout(() => {
					closeModal();
					onSuccess();
				}, 1000);
			}
		} catch {
			errorMessage = 'Network error occurred';
		} finally {
			isVerifying = false;
		}
	}

	function handleInput(event: Event) {
		const target = event.target as HTMLInputElement;
		target.value = target.value.replace(/[^0-9]/g, '').slice(0, CODE_LENGTH);
		code = target.value;
	}

	function handleKeyDown(event: KeyboardEvent) {
		if (event.key === 'Enter' && codeInputValid && !isVerifying) {
			handleVerify();
		}
	}
</script>

<div
	class="card flex h-auto w-full flex-row items-center justify-between gap-3 rounded-xl border border-warning/30 bg-warning/10 px-4 py-3 backdrop-blur-sm transition-all duration-300"
>
	<div class="flex min-w-0 items-center gap-2">
		<div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-warning/20">
			<Code size={16} class="text-warning" />
		</div>
		<span class="truncate text-sm font-medium text-warning-content/90">Verify your email</span>
	</div>
	<button
		class="btn shrink-0 gap-1.5 shadow-sm btn-sm btn-warning"
		onclick={showModal}
		aria-label="Open verification modal"
	>
		Verify
	</button>
</div>

<dialog
	id="verificationModal"
	bind:this={verificationModal}
	class="modal modal-bottom sm:modal-middle"
	onclose={() => {
		errorMessage = null;
		successMessage = null;
		code = '';
	}}
>
	<div class="modal-box w-full px-6 pt-6 pb-safe">
		<div class="flex items-center justify-between">
			<h3 class="text-xl font-bold">Verify your account</h3>
			<button
				class="btn btn-circle btn-ghost btn-sm"
				onclick={closeModal}
				aria-label="Close verification modal"
			>
				<X size={18} />
			</button>
		</div>
		<p class="py-4 text-sm">
			A code has been sent to <code class="code break-all">{email}</code>.
		</p>

		{#if errorMessage}
			<div class="mb-4 alert alert-error" role="alert">
				<span>{errorMessage}</span>
			</div>
		{/if}

		{#if successMessage}
			<div class="mb-4 alert alert-success" role="alert">
				<CheckCircle size={16} class="mr-2" />
				<span>{successMessage}</span>
			</div>
		{/if}

		<div class="form-control w-full">
			<label class="label" for="code">
				<span class="label-text">Verification Code</span>
			</label>
			<input
				bind:this={codeInput}
				name="code"
				bind:value={code}
				type="tel"
				inputmode="numeric"
				placeholder={PLACEHOLDER_CODE}
				class="input-bordered input w-full"
				maxlength={CODE_LENGTH}
				disabled={isLoading || isVerifying}
				oninput={handleInput}
				onkeydown={handleKeyDown}
				aria-describedby="code-help"
			/>
			<span id="code-help" class="label-text-alt text-muted">
				Enter the 6-digit code sent to your email
			</span>
		</div>

		<div class="modal-action flex-col-reverse gap-2 sm:flex-row sm:justify-end">
			<button class="btn btn-ghost" onclick={closeModal} disabled={isLoading || isVerifying}>
				Close
			</button>

			<button
				class="btn btn-secondary"
				disabled={!canResend || isLoading}
				onclick={requestCode}
				aria-disabled={!canResend}
			>
				{#if isLoading}
					<RefreshCw class="animate-spin" size={16} />
				{:else if !canResend && nextCodeAvailableAt}
					Resend in {resendSeconds}s
				{:else}
					Resend
				{/if}
			</button>

			<button
				class="btn btn-primary"
				disabled={!codeInputValid || isVerifying}
				onclick={handleVerify}
				aria-label="Verify code"
			>
				{#if isVerifying}
					<RefreshCw class="animate-spin" size={16} />
				{:else}
					Verify
				{/if}
			</button>
		</div>
	</div>
</dialog>
