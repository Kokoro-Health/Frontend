<script lang="ts">
	import { CloudCheck, InfoIcon } from '@lucide/svelte';
	import { onDestroy, onMount } from 'svelte';

	const savingCooldownMs = 3_000;

	let savingState: 'saving' | 'saved' | 'pending' = $state('saved');
	let content: string = $state('');
	let loadedContent: string = $state('');
	let lastChange = $state(0);
	let intervalId: ReturnType<typeof setInterval> | null = null;

	$effect(() => {
		if (loadedContent === content) return;
		lastChange = Date.now();
	});

	function handleSave() {
		if (loadedContent === content || savingState === 'saving') return;
		if (Date.now() - lastChange < savingCooldownMs) {
			savingState = 'pending';
			return;
		}
		savingState = 'saving';
		setTimeout(() => {
			savingState = 'saved';
			loadedContent = content;
		}, 1000);
	}

	onMount(() => {
		intervalId = setInterval(handleSave, 500);
	});

	onDestroy(() => {
		if (intervalId) {
			clearInterval(intervalId);
		}
	});
</script>

<div class="card w-full rounded-box border border-base-200">
	<div class="card-body gap-5 p-5">
		<div class="flex items-center justify-between">
			<div class="flex flex-row items-center space-x-1">
				<h2 class="text-sm font-semibold tracking-wide">Journal</h2>
				<details class="dropdown dropdown-top w-full">
					<summary class="btn text-info btn-ghost btn-xs"><InfoIcon size={16} /></summary>
					<div
						class="dropdown-content menu z-1 w-82 -translate-x-1/5 rounded-box border border-base-200 bg-base-100 p-3 shadow-sm"
					>
						<span
							>Entries are automatically locked 30 minutes after you begin writing. You can access
							your history via the Journal tab."</span
						>
					</div>
				</details>
			</div>
			<div class="flex flex-row items-center justify-center space-x-3">
				{#if savingState == 'saved'}
					<CloudCheck color="var(--color-success)" size={18} />
				{:else if savingState == 'saving'}
					<span class="loading loading-xs loading-spinner text-secondary"></span>
				{:else if savingState == 'pending'}
					<span class="loading loading-xs loading-dots text-base-content/70"></span>
				{/if}
				<span class="text-xs text-base-content/40">Today</span>
			</div>
		</div>

		<div>
			<textarea
				class="textarea-bordered textarea w-full resize-none"
				placeholder="Write about your day..."
				rows={5}
				bind:value={content}
			>
			</textarea>
		</div>
	</div>
</div>
