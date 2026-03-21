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

	let selectedReason = $state<string | null>(null);
	let customReason = $state('');
	let isOpen = $state(true);
	let expanded = $state(false);

	const MAX_VISIBLE_REASONS = 4;

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
		onClose();
	}

	function handleSkip() {
		onSelect(null);
		onClose();
	}

	function handleCloseOverlay() {
		onClose();
	}

	function toggleExpand() {
		expanded = !expanded;
	}

	const displayedReasons = $derived(expanded ? reasons : reasons.slice(0, MAX_VISIBLE_REASONS));
</script>

<svelte:window onkeydown={(e) => e.key === 'Escape' && handleCloseOverlay()} />

{#if isOpen}
	<div class="fixed inset-0 z-50 flex items-end justify-center pb-20">
		<button
			type="button"
			class="absolute inset-0 bg-base-content/30 backdrop-blur-sm transition-opacity duration-300"
			onclick={handleCloseOverlay}
			aria-label="Close"
		></button>

		<div
			class="relative w-full max-w-md translate-y-0 rounded-t-2xl bg-base-200 pb-safe shadow-none transition-transform duration-300 ease-out"
		>
			<div class="flex items-center justify-between border-b border-base-300 p-4">
				<h3 class="font-semibold">Add a reason</h3>
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
					<button class="btn btn-circle shadow-none btn-ghost btn-sm" onclick={handleCloseOverlay}>
						<X size={18} />
					</button>
				</div>
			</div>

			<div class="flex-1 overflow-y-auto p-4">
				{#if displayedReasons.length > 0}
					<div class="mb-4 flex flex-wrap gap-2 {expanded ? 'max-h-64 overflow-y-auto' : ''}">
						{#each displayedReasons as reason}
							<button
								class="btn shadow-none btn-sm {selectedReason === reason
									? 'btn-primary'
									: 'btn-soft'}"
								onclick={() => handleSelect(reason)}
							>
								{reason}
							</button>
						{/each}
					</div>
				{/if}

				<div class="form-control">
					<input
						type="text"
						class="input-bordered input w-full"
						placeholder="Enter a custom reason..."
						bind:value={customReason}
					/>
				</div>
			</div>

			<div class="border-t border-base-300 p-4">
				<div class="flex gap-2">
					<button class="btn flex-1 shadow-none btn-ghost" onclick={handleSkip}>Skip</button>
					<button
						class="btn flex-1 shadow-none btn-primary"
						onclick={handleConfirm}
						disabled={!selectedReason && !customReason.trim()}
					>
						<Plus size={18} />
						Add
					</button>
				</div>
			</div>
		</div>
	</div>
{/if}
