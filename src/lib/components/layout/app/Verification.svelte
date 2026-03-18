<script lang="ts">
	import { requestVerificationCode, verifyCode } from '$lib/api';
	import { Code, X, RefreshCw } from '@lucide/svelte';

	const CODE_LENGTH = 6;
	const PLACEHOLDER_CODE = '000000';

	let { email, onSuccess }: { email: string; onSuccess: () => void } = $props();

	let verificationModal: HTMLDialogElement | null = $state(null);
	let code = $state('');
	let nextCodeAvailableAt = $state(Date.now());
	let isLoading = $state(false);
	let errorMessage = $state<string | null>(null);
	let resendSeconds = $state(0);

	let codeInputValid = $derived(code.length === CODE_LENGTH);
	let canResend = $derived(Date.now() >= nextCodeAvailableAt);

	$effect(() => {
		resendSeconds = Math.max(0, Math.ceil((nextCodeAvailableAt - Date.now()) / 1000));

		if (canResend) return;

		const intervalId = setInterval(() => {
			const remaining = nextCodeAvailableAt - Date.now();

			if (remaining <= 0) {
				resendSeconds = 0;
				clearInterval(intervalId);
			} else {
				resendSeconds = Math.ceil(remaining / 1000);
			}
		}, 1000);

		return () => clearInterval(intervalId);
	});

	function showModal() {
		requestCode();
		verificationModal?.showModal();
		errorMessage = null;
	}

	function closeModal() {
		verificationModal?.close();
		errorMessage = null;
		code = '';
	}

	async function requestCode() {
		errorMessage = null;
		isLoading = true;
		try {
			const res = await requestVerificationCode();
			if (res.data) {
				nextCodeAvailableAt = Date.parse(res.data.nextCodeAllowedAt);
				resendSeconds = Math.ceil((nextCodeAvailableAt - Date.now()) / 1000);
			}
		} finally {
			isLoading = false;
		}
	}

	async function handleVerify() {
		isLoading = true;
		try {
			await verifyCode({
				query: {
					code: code
				}
			}).then((res) => {
				if (res.error?.message) {
					errorMessage = res.error.message;
				} else {
					closeModal();
					onSuccess();
				}
			});
		} catch {
			errorMessage = 'Network error occurred';
		} finally {
			isLoading = false;
		}
	}
</script>

<div
	class="flex h-16 w-full flex-row items-center justify-between bg-warning/30 px-4 text-warning-content/40 md:static md:h-auto md:bg-transparent md:p-0 md:text-inherit"
>
	<span class="truncate text-sm font-medium md:text-base">Please verify your email address.</span>
	<button onclick={showModal} class="btn btn-sm btn-warning md:hidden">
		<Code size={16} />
		Verify
	</button>
</div>

<dialog
	id="verificationModal"
	bind:this={verificationModal}
	class="modal modal-bottom sm:modal-middle"
>
	<div class="modal-box w-full px-6 pt-6 pb-safe">
		<div class="flex items-center justify-between">
			<h3 class="text-xl font-bold">Verify your account</h3>
			<button class="btn btn-circle btn-ghost btn-sm" onclick={closeModal}>
				<X size={18} />
			</button>
		</div>
		<p class="py-4 text-sm">
			A code has been sent to <code class="code break-all">{email}</code>.
		</p>

		{#if errorMessage}
			<div class="mb-4 alert alert-error">
				<span>{errorMessage}</span>
			</div>
		{/if}

		<div class="form-control w-full">
			<label class="label" for="code">
				<span class="label-text">Verification Code</span>
			</label>
			<input
				name="code"
				bind:value={code}
				type="text"
				pattern="[0-9]{6}"
				inputmode="numeric"
				placeholder={PLACEHOLDER_CODE}
				class="input-bordered input w-full"
				maxlength={CODE_LENGTH}
				disabled={isLoading}
			/>
		</div>

		<div class="modal-action flex-col-reverse gap-2 sm:flex-row sm:justify-end">
			<button class="btn btn-ghost" onclick={closeModal} disabled={isLoading}> Close </button>

			<button class="btn btn-secondary" disabled={!canResend || isLoading} onclick={requestCode}>
				{#if isLoading && !canResend}
					<RefreshCw class="animate-spin" size={16} />
				{:else if !canResend}
					Resend in {resendSeconds}s
				{:else}
					Resend
				{/if}
			</button>

			<button
				class="btn btn-primary"
				disabled={!codeInputValid || isLoading}
				onclick={handleVerify}
			>
				{#if isLoading}
					<RefreshCw class="animate-spin" size={16} />
				{:else}
					Verify
				{/if}
			</button>
		</div>
	</div>
</dialog>
