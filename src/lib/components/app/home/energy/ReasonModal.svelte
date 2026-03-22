<script lang="ts">
	import { X, Plus, Eye } from '@lucide/svelte';

	let {
		reasons,
		onSelect,
		onClose
	}: {
		reasons: string[];
		onSelect: (reason: string | null) => void;
		onClose: () => void;
	} = $props();

	const MAX_VISIBLE_REASONS = 4;

	let reasonModal: HTMLDialogElement | null = $state(null);
	let selectedReason = $state<string | null>(null);
	let customReason = $state('');
	let expanded = $state(false);
	let isLoading = $state(false);
	let errorMessage = $state<string | null>(null);

	const displayedReasons = $derived(expanded ? reasons : reasons.slice(0, MAX_VISIBLE_REASONS));

	export function showModal() {
		if (!reasonModal) return;

		errorMessage = null;
		selectedReason = null;
		customReason = '';

		reasonModal.showModal();
	}

	function closeModal() {
		reasonModal?.close();
		errorMessage = null;
		selectedReason = null;
		customReason = '';
	}

	function handleSelect(reason: string) {
		selectedReason = reason;
	}

	function handleConfirm() {
		if (customReason.trim()) {
			onSelect(customReason.trim());
		} else if (selectedReason) {
			onSelect(selectedReason);
		} else {
			onSelect(null);
		}
		closeModal();
	}

	function handleSkip() {
		onSelect(null);
		closeModal();
	}

	function toggleExpand() {
		expanded = !expanded;
	}
</script>

<dialog
	id="reasonModal"
	bind:this={reasonModal}
	class="modal modal-bottom sm:modal-middle"
	onclose={() => {
		errorMessage = null;
		selectedReason = null;
		customReason = '';
	}}
>
	<div class="modal-box w-full max-w-md px-6 pt-6 pb-safe">
		<div class="flex items-center justify-between">
			<h3 class="text-xl font-bold">Add a reason</h3>
			<div class="flex gap-2">
				{#if reasons.length > MAX_VISIBLE_REASONS}
					<button
						class="btn btn-circle shadow-none btn-ghost btn-sm"
						onclick={toggleExpand}
						aria-label={expanded ? 'Show fewer reasons' : 'View all reasons'}
					>
						<Eye size={18} />
					</button>
				{/if}
				<button
					class="btn btn-circle shadow-none btn-ghost btn-sm"
					onclick={closeModal}
					aria-label="Close reason modal"
				>
					<X size={18} />
				</button>
			</div>
		</div>

		{#if errorMessage}
			<div class="mb-4 alert alert-error" role="alert">
				<span>{errorMessage}</span>
			</div>
		{/if}

		<div class="flex-1 overflow-y-auto py-4">
			{#if displayedReasons.length > 0}
				<div class="mb-4 flex flex-wrap gap-2 {expanded ? 'max-h-64 overflow-y-auto' : ''}">
					{#each displayedReasons as reason}
						<button
							class="btn shadow-none btn-sm {selectedReason === reason
								? 'btn-primary'
								: 'btn-soft'}"
							onclick={() => handleSelect(reason)}
							disabled={isLoading}
						>
							{reason}
						</button>
					{/each}
				</div>
			{/if}

			<div class="form-control">
				<label class="label" for="customReason">
					<span class="label-text">Custom Reason</span>
				</label>
				<input
					type="text"
					id="customReason"
					class="input-bordered input w-full"
					placeholder="Enter a custom reason..."
					bind:value={customReason}
					disabled={isLoading}
				/>
			</div>
		</div>

		<div class="modal-action flex-col-reverse gap-2 sm:flex-row sm:justify-end">
			<button class="btn btn-ghost" onclick={handleSkip} disabled={isLoading}> Skip </button>
			<button
				class="btn btn-primary"
				onclick={handleConfirm}
				disabled={(!selectedReason && !customReason.trim()) || isLoading}
				aria-label="Add reason"
			>
				{#if isLoading}
					<svg class="animate-spin" width="16" height="16" viewBox="0 0 24 24">
						<circle
							class="opacity-25"
							cx="12"
							cy="12"
							r="10"
							stroke="currentColor"
							stroke-width="4"
							fill="none"
						/>
						<path
							class="opacity-75"
							fill="currentColor"
							d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
						/>
					</svg>
				{:else}
					<Plus size={18} />
					Add
				{/if}
			</button>
		</div>
	</div>
</dialog>
