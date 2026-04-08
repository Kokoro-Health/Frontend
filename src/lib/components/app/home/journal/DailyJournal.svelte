<script lang="ts">
	import {
		getCurrentJournal,
		updateCurrentJournal,
		updateCurrentJournal1,
		type JournalEntryDto,
		type ProfileResponseDto
	} from '$api';
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';
	import { Check, AlertCircle, Loader2, Lock, Save } from '@lucide/svelte';
	import { toAmPmTime } from '$util/timeUtil';
	import { hapticNotification } from '$util/haptics';

	const SAVE_DELAY = 1500;
	let { profile, showTitle = true }: { profile: ProfileResponseDto; showTitle?: boolean } =
		$props();

	let current = $state<JournalEntryDto | null>(null);
	let contentInput = $state('');
	let isLoading = $state(true);
	let isSaving = $state(false);
	let lastSaved = $state<Date | null>(null);
	let error = $state<string | null>(null);
	let saveStatus = $state<'idle' | 'scheduled' | 'saving' | 'error'>('idle');
	let initialLoad = $state(false);

	let saveTimeout: ReturnType<typeof setTimeout> | null = null;

	const isDirty = $derived(contentInput !== (current?.content ?? ''));

	function checkAvailable(): boolean {
		if (!current?.availableUntil) return true;
		return new Date(current.availableUntil) > new Date();
	}

	const canEdit = $derived(!isLoading && checkAvailable());

	async function loadCurrent() {
		isLoading = true;
		error = null;
		saveStatus = 'idle';

		try {
			const res = await getCurrentJournal();
			if (!res.data) {
				throw new Error(res.error?.message ?? 'Failed to load journal');
			}

			const data = res.data;
			initialLoad = true;
			current = data;
			contentInput = data.content ?? '';
			lastSaved = data.id ? new Date() : null;
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to load journal';
			console.error('Journal load error:', e);
		} finally {
			isLoading = false;
		}
	}

	async function save() {
		if (!initialLoad) return;
		if (!isDirty || isSaving || !current) return;

		if (!current.id && !contentInput.trim()) {
			return;
		}

		isSaving = true;
		saveStatus = 'saving';
		error = null;

		try {
			let res;
			if (current.id) {
				res = await updateCurrentJournal1({
					body: { content: contentInput },
					path: { id: current.id }
				});
			} else {
				res = await updateCurrentJournal({
					body: { content: contentInput }
				});
			}

			if (!res.data) {
				throw new Error('Save failed: no response data');
			}

			const returned = res.data;

			if (!returned.id) {
				if (!contentInput.trim()) {
					current = returned;
					saveStatus = 'idle';
				} else {
					error = 'Session expired or conflict. Reloading...';
					saveStatus = 'error';
					await hapticNotification('error');
					await loadCurrent();
				}
				return;
			}

			current = returned;
			lastSaved = new Date();
			saveStatus = 'idle';

			if (returned.content !== contentInput) {
				console.warn('Content divergence detected.');
				contentInput = returned.content ?? '';
			}
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to save';
			saveStatus = 'error';
			await hapticNotification('error');
			console.error('Journal save error:', e);
		} finally {
			isSaving = false;
		}
	}

	function scheduleSave() {
		if (saveTimeout) clearTimeout(saveTimeout);

		if (!isDirty) {
			saveStatus = 'idle';
			return;
		}

		saveStatus = 'scheduled';
		saveTimeout = setTimeout(() => {
			save();
		}, SAVE_DELAY);
	}

	$effect(() => {
		if (current && isDirty) {
			scheduleSave();
		}
	});

	function handleBeforeUnload(e: BeforeUnloadEvent) {
		if (isDirty && saveStatus !== 'saving') {
			e.preventDefault();
			e.returnValue = '';
		}
	}

	onMount(() => {
		loadCurrent();
		if (browser) {
			window.addEventListener('beforeunload', handleBeforeUnload);
		}
	});

	onDestroy(() => {
		if (saveTimeout) clearTimeout(saveTimeout);
		if (browser) {
			window.removeEventListener('beforeunload', handleBeforeUnload);
		}
		if (isDirty && !isSaving && current) {
			save();
		}
	});
</script>

<div
	class="card border border-base-200/80 bg-base-100/80 p-4 backdrop-blur-sm transition-all duration-300"
>
	<div class="mb-3 flex items-center justify-between">
		<div class="flex items-center gap-2">
			{#if showTitle}
				<h2 class="text-sm font-semibold tracking-wide">Journal</h2>
			{/if}
			{#if isLoading}
				<Loader2 class="h-3.5 w-3.5 animate-spin text-primary" />
			{/if}
		</div>

		<div class="flex items-center gap-2 text-xs">
			{#if !checkAvailable()}
				<span class="badge gap-1 badge-sm badge-warning">
					<Lock class="h-3 w-3" />
					Read-only
				</span>
			{:else if saveStatus === 'saving'}
				<span class="flex items-center gap-1.5 text-info">
					<div class="h-1.5 w-1.5 animate-pulse rounded-full bg-info"></div>
					Saving...
				</span>
			{:else if saveStatus === 'scheduled'}
				<span class="flex items-center gap-1.5 text-base-content/50">
					<div class="h-1.5 w-1.5 animate-pulse rounded-full bg-base-content/30"></div>
					Editing...
				</span>
			{:else if saveStatus === 'error'}
				<span class="flex items-center gap-1 text-error">
					<AlertCircle class="h-3 w-3" />
					Save failed
				</span>
			{:else if lastSaved && !isDirty}
				<span class="flex items-center gap-1 text-success/80">
					<Check class="h-3 w-3" />
					Saved {toAmPmTime(lastSaved.toISOString(), profile)}
				</span>
			{/if}
		</div>
	</div>

	{#if error}
		<div class="mb-3 alert py-2 alert-error">
			<AlertCircle class="h-4 w-4 shrink-0" />
			<span class="text-xs">{error}</span>
			<button
				class="btn ml-auto btn-ghost btn-xs"
				onclick={() => {
					error = null;
					loadCurrent();
				}}
			>
				Reload
			</button>
		</div>
	{/if}

	<textarea
		bind:value={contentInput}
		class="textarea-bordered textarea min-h-36 w-full resize-none rounded-xl text-sm transition-all duration-200 focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
		class:textarea-disabled={!canEdit || !initialLoad}
		placeholder={isLoading ? 'Loading...' : "How's your day going?"}
		disabled={!canEdit || !initialLoad}
		aria-label="Journal entry"
	></textarea>

	<div class="mt-2 flex items-center justify-between text-xs text-base-content/50">
		<span class="tabular-nums">{contentInput.length} chars</span>
		<div class="flex items-center gap-3">
			{#if current?.availableUntil}
				<span class:text-error={!checkAvailable()}>
					{#if checkAvailable()}
						Until {toAmPmTime(current.availableUntil, profile)}
					{:else}
						Expired
					{/if}
				</span>
			{/if}
			{#if canEdit && isDirty && saveStatus === 'scheduled'}
				<button
					class="btn gap-1.5 btn-ghost btn-sm"
					onclick={() => {
						if (saveTimeout) clearTimeout(saveTimeout);
						save();
					}}
					disabled={isSaving}
				>
					<Save class="h-3.5 w-3.5" />
					Save
				</button>
			{/if}
		</div>
	</div>
</div>
