<script lang="ts">
	import { updateCurrentJournal, type JournalEntryDto } from '$lib/api';
	import { toDate } from '$lib/util/dateUtil';
	import { CloudCheck, InfoIcon } from '@lucide/svelte';
	import { onDestroy } from 'svelte';

	const SAVE_DEBOUNCE_MS = 2_000;
	const SAVED_DISPLAY_MS = 2_500;

	type SavingState = 'idle' | 'pending' | 'saving' | 'saved' | 'error';

	let { entry = $bindable() }: { entry: JournalEntryDto } = $props();

	let savingState = $state<SavingState>('idle');
	let savedContent = $state('');
	let content = $state('');
	let availableUntilStr = $state('');
	let availableUntil: Date | null = $state(null);
	let countdownDisplay = $state('');
	let debounceTimer: ReturnType<typeof setTimeout> | null = null;
	let savedDisplayTimer: ReturnType<typeof setTimeout> | null = null;
	let pendingSave = false;
	let countdownInterval: ReturnType<typeof setInterval> | null = null;

	function clearTimers() {
		if (debounceTimer) {
			clearTimeout(debounceTimer);
			debounceTimer = null;
		}
		if (savedDisplayTimer) {
			clearTimeout(savedDisplayTimer);
			savedDisplayTimer = null;
		}
		if (countdownInterval) {
			clearInterval(countdownInterval);
			countdownInterval = null;
		}
	}

	function scheduleTransitionToIdle() {
		if (savedDisplayTimer) clearTimeout(savedDisplayTimer);
		savedDisplayTimer = setTimeout(() => {
			savingState = 'idle';
		}, SAVED_DISPLAY_MS);
	}

	function startCountdown() {
		if (countdownInterval) clearInterval(countdownInterval);

		updateCountdown();

		countdownInterval = setInterval(() => {
			updateCountdown();
		}, 1_000);
	}

	function updateCountdown() {
		if (!availableUntil) {
			countdownDisplay = '';
			return;
		}

		const now = new Date();
		const diffMs = availableUntil.getTime() - now.getTime();

		if (diffMs <= 0) {
			countdownDisplay = '';
			clearCountdown();
			refreshContent();
			return;
		}

		const totalSeconds = Math.floor(diffMs / 1_000);
		const minutes = Math.floor(totalSeconds / 60);
		const seconds = totalSeconds % 60;

		countdownDisplay = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
	}

	function clearCountdown() {
		if (countdownInterval) {
			clearInterval(countdownInterval);
			countdownInterval = null;
		}
	}

	async function refreshContent() {
		try {
			const res = await updateCurrentJournal({
				body: {
					content: content
				}
			});
			const data = res.data;
			if (!data) throw new Error('No response data');

			savedContent = content;
			availableUntil = toDate(data.availableUntil);
			startCountdown();
		} catch {}
	}

	async function save() {
		if (savingState === 'saving') {
			pendingSave = true;
			return;
		}
		if (content === savedContent) {
			savingState = 'saved';
			scheduleTransitionToIdle();
			return;
		}

		savingState = 'saving';
		const snapshot = content;

		try {
			const res = await updateCurrentJournal({
				body: {
					content: snapshot
				}
			});
			const data = res.data;
			if (!data) throw new Error('No response data');

			savedContent = snapshot;
			savingState = 'saved';
			availableUntil = toDate(data.availableUntil);
			startCountdown();
			scheduleTransitionToIdle();
		} catch {
			savingState = 'error';
		} finally {
			if (pendingSave) {
				pendingSave = false;
				scheduleSave();
			}
		}
	}

	function scheduleSave() {
		if (debounceTimer) clearTimeout(debounceTimer);
		savingState = 'pending';
		debounceTimer = setTimeout(save, SAVE_DEBOUNCE_MS);
	}

	function handleInput(e: Event) {
		content = (e.currentTarget as HTMLTextAreaElement).value;
		if (content === savedContent) {
			clearTimers();
			savingState = 'idle';
			return;
		}
		scheduleSave();
	}

	$effect(() => {
		if (content.trim() && availableUntil && availableUntil.getTime() > Date.now()) {
			startCountdown();
		}
	});

	$effect(() => {
		if (entry) {
			content = entry.content;
			savedContent = entry.content;
			availableUntil = toDate(entry.availableUntil);
			availableUntilStr = entry.availableUntil;
		}
	});

	onDestroy(clearTimers);
</script>

<div class="card w-full rounded-box border border-base-200">
	<div class="card-body gap-5 p-5">
		<div class="flex items-center justify-between">
			<div class="flex flex-row items-center space-x-1">
				<h2 class="text-sm font-semibold tracking-wide">Journal</h2>
				<details class="dropdown dropdown-top">
					<summary class="btn text-info btn-ghost btn-xs">
						<InfoIcon size={16} />
					</summary>
					<div
						class="dropdown-content menu z-10 w-80 -translate-x-1/4 rounded-box border border-base-200 bg-base-100 p-3 shadow-sm"
					>
						<span>
							Entries are automatically locked 30 minutes after you stop writing. You can access
							your history via the Journal tab.
						</span>
					</div>
				</details>
			</div>

			<div class="flex items-center gap-2">
				<span class="text-xs text-base-content/40 transition-opacity">
					{#if savingState === 'error'}
						<span class="text-error">Failed to save</span>
					{:else if savingState === 'saving'}
						<span class="loading loading-xs loading-spinner text-secondary"></span>
					{:else if savingState === 'pending'}
						<span class="loading loading-xs loading-dots text-base-content/40"></span>
					{:else if savingState === 'saved'}
						<CloudCheck size={16} class="text-success" />
					{/if}
				</span>
				{#if countdownDisplay}
					<span class="font-mono text-xs text-base-content/60">
						{countdownDisplay}
					</span>
				{/if}
				<span class="text-xs text-base-content/40">Today</span>
			</div>
		</div>

		<textarea
			class="textarea-bordered textarea w-full resize-none"
			placeholder="Write about your day..."
			rows={5}
			value={content}
			oninput={handleInput}
		></textarea>
	</div>
</div>
