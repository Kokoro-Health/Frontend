<script lang="ts">
	import { onMount } from 'svelte';
	import {
		Download,
		Trash2,
		AlertTriangle,
		CheckCircle,
		XCircle,
		Clock,
		Mail
	} from '@lucide/svelte';
	import {
		abortDataDeletion,
		confirmDataDeletion,
		requestDataDeletion,
		requestDataExport
	} from '$api';

	type Interval = ReturnType<typeof setInterval>;

	let isExporting: boolean = $state(false);
	let isDeleting: boolean = $state(false);
	let isConfirmingDeletion: boolean = $state(false);
	let deletionCode: string = $state('');
	let deletionError: string = $state('');
	let countdown: any = $state();
	let countdownInterval: Interval | undefined;
	let deletionModal: HTMLDialogElement | undefined;

	async function showAlert(title: string, message: string): Promise<void> {
		alert(`${title}\n${message}`);
	}

	async function exportData(): Promise<void> {
		try {
			isExporting = true;
			await requestDataExport();
			await showAlert('Success', 'Data export initiated! You will receive an email shortly.');
		} catch (error) {
			await showAlert('Error', 'Failed to initiate data export. Please try again.');
			console.error('Export error:', error);
		} finally {
			isExporting = false;
		}
	}

	async function initiateDeletion(): Promise<void> {
		try {
			isDeleting = true;
			deletionError = '';
			await requestDataDeletion();

			countdown = 300;
			countdownInterval = window.setInterval(() => {
				countdown--;
				if (countdown <= 0) {
					clearInterval(countdownInterval);
					isConfirmingDeletion = false;
					if (deletionModal) deletionModal.close();
					showAlert('Timeout', 'Deletion confirmation timed out. Please start over.');
				}
			}, 1000);

			isConfirmingDeletion = true;
			if (deletionModal) deletionModal.showModal();
			await showAlert('Check Email', 'A 6-digit confirmation code has been sent to your email.');
		} catch (error) {
			await showAlert('Error', 'Failed to initiate account deletion. Please try again.');
			console.error('Deletion initiation error:', error);
		} finally {
			isDeleting = false;
		}
	}

	async function confirmDeletion(): Promise<void> {
		if (!deletionCode || deletionCode.length !== 6) {
			deletionError = 'Please enter a valid 6-digit code';
			return;
		}

		try {
			isDeleting = true;
			deletionError = '';
			await confirmDataDeletion({ body: { code: deletionCode } });

			clearInterval(countdownInterval);
			if (deletionModal) deletionModal.close();
			await showAlert('Account Deletion', 'Your account has been scheduled for deletion.');
		} catch (error) {
			deletionError =
				error instanceof Error && error.message.includes('invalid')
					? 'Invalid confirmation code'
					: 'Failed to confirm deletion. Please try again.';
			console.error('Deletion confirmation error:', error);
		} finally {
			isDeleting = false;
		}
	}

	async function cancelDeletion(): Promise<void> {
		try {
			await abortDataDeletion();
			clearInterval(countdownInterval);
			if (deletionModal) deletionModal.close();
			deletionCode = '';
			await showAlert('Cancelled', 'Account deletion has been cancelled.');
		} catch (error) {
			await showAlert('Error', 'Failed to cancel deletion. Please try again.');
			console.error('Deletion cancellation error:', error);
		}
	}

	function closeModal(): void {
		if (!isDeleting) {
			cancelDeletion();
		}
	}

	onMount(() => {
		return () => {
			if (countdownInterval) clearInterval(countdownInterval);
		};
	});
</script>

<div class="grid gap-4 bg-base-100">
	<div class="divider font-medium text-base-content/60">Data Management</div>

	<button onclick={exportData} class="btn w-full btn-primary" disabled={isExporting}>
		{#if isExporting}
			<span class="loading loading-sm loading-spinner"></span>
			Processing...
		{:else}
			<Download class="size-5" />
			Export Data
		{/if}
	</button>

	<button
		onclick={initiateDeletion}
		class="btn w-full btn-error"
		disabled={isDeleting || isConfirmingDeletion}
	>
		{#if isDeleting}
			<span class="loading loading-sm loading-spinner"></span>
			Processing...
		{:else}
			<Trash2 class="size-5" />
			Delete Account
		{/if}
	</button>
</div>

<dialog bind:this={deletionModal} class="modal modal-bottom sm:modal-middle">
	<div class="modal-box w-full p-6">
		<form method="dialog">
			<button
				onclick={closeModal}
				class="btn absolute top-2 right-2 btn-circle btn-ghost btn-sm"
				disabled={isDeleting}
			>
				<XCircle class="size-5" />
			</button>
		</form>

		<div class="mb-4 flex items-center gap-3">
			<AlertTriangle class="size-6 text-error" />
			<h3 class="text-lg font-bold">Confirm Account Deletion</h3>
		</div>

		<p class="mb-4 text-sm text-base-content/80">
			Enter the 6-digit code sent to your email.
			{#if countdown > 0}
				<span class="mt-2 flex items-center gap-2">
					<Clock class="size-4" />
					Time remaining: {Math.floor(countdown / 60)}:{String(countdown % 60).padStart(2, '0')}
				</span>
			{/if}
		</p>

		<div class="form-control mb-4 w-full">
			<label class="label">
				<span class="label-text flex items-center gap-2">
					<Mail class="size-4" />
					Confirmation Code
				</span>
			</label>
			<input
				type="text"
				bind:value={deletionCode}
				class="input-bordered input w-full text-center tracking-widest"
				placeholder="123456"
				maxlength={6}
				oninput={() => (deletionError = '')}
				inputmode="numeric"
			/>
			{#if deletionError}
				<label class="label">
					<span class="label-text-alt flex items-center gap-1 text-error">
						<XCircle class="size-4" />
						{deletionError}
					</span>
				</label>
			{/if}
		</div>

		<div class="mt-6 flex gap-2">
			<button
				onclick={confirmDeletion}
				class="btn flex-1 btn-error"
				disabled={isDeleting || deletionCode.length !== 6}
			>
				{#if isDeleting}
					<span class="loading loading-sm loading-spinner"></span>
				{:else}
					<CheckCircle class="size-5" />
				{/if}
				Confirm
			</button>
			<button onclick={closeModal} class="btn flex-1 btn-ghost" disabled={isDeleting}>
				<XCircle class="size-5" />
				Cancel
			</button>
		</div>
	</div>

	<form method="dialog" class="modal-backdrop">
		<button onclick={closeModal} disabled={isDeleting}>Close</button>
	</form>
</dialog>
