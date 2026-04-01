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

	const SAVE_DELAY = 1500;
	let { profile }: { profile: ProfileResponseDto } = $props();

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

<div class="card border border-base-200 bg-base-100 p-4">
	<div class="mb-3 flex items-center justify-between">
		<div class="flex items-center gap-2">
			<h2 class="text-sm font-semibold">Journal</h2>
			{#if isLoading}
				<Loader2 class="h-3 w-3 animate-spin text-primary" />
			{/if}
		</div>

		<div class="flex items-center gap-2 text-xs">
			{#if !checkAvailable()}
				<span class="badge gap-1 badge-sm badge-warning">
					<Lock class="h-3 w-3" />
					Read-only
				</span>
			{:else if saveStatus === 'saving'}
				<span class="flex items-center gap-1 text-info">
					<Loader2 class="h-3 w-3 animate-spin" />
					Saving...
				</span>
			{:else if saveStatus === 'scheduled'}
				<span class="text-warning">Unsaved changes</span>
			{:else if saveStatus === 'error'}
				<span class="flex items-center gap-1 text-error">
					<AlertCircle class="h-3 w-3" />
					Save failed
				</span>
			{:else if lastSaved && !isDirty}
				<span class="flex items-center gap-1 text-success">
					<Check class="h-3 w-3" />
					Saved {toAmPmTime(lastSaved.toISOString(), profile)}
				</span>
			{/if}
		</div>
	</div>

	{#if error}
		<div class="mb-3 alert py-2 alert-error">
			<AlertCircle class="h-4 w-4" />
			<span class="text-xs">{error}</span>
			<button
				class="btn btn-ghost btn-xs"
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
		class="textarea-bordered textarea min-h-32 w-full text-sm"
		class:textarea-disabled={!canEdit || !initialLoad}
		placeholder={isLoading ? 'Loading...' : "How's your day going?"}
		disabled={!canEdit || !initialLoad}
		aria-label="Journal entry"
	></textarea>

	<div class="mt-2 flex items-center justify-between text-xs text-base-content/60">
		<span>{contentInput.length} characters</span>
		<div class="flex items-center gap-2">
			{#if current?.availableUntil}
				<span class:text-error={!checkAvailable()}>
					{#if checkAvailable()}
						Until {toAmPmTime(current.availableUntil, profile)}
					{:else}
						Expired
					{/if}
				</span>
			{/if}
			{#if canEdit && isDirty}
				<button
					class="btn gap-1 btn-ghost btn-xs"
					onclick={() => {
						if (saveTimeout) clearTimeout(saveTimeout);
						save();
					}}
					disabled={isSaving}
				>
					<Save class="h-3 w-3" />
					Save
				</button>
			{/if}
		</div>
	</div>
</div>
