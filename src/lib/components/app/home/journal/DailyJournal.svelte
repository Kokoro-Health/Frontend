<script lang="ts">
	import { Send } from '@lucide/svelte';

	let entry = $state('');
	let loading = $state(false);
	let saved = $state(false);

	const today = new Date().toLocaleDateString('en-US', {
		weekday: 'long',
		month: 'long',
		day: 'numeric'
	});

	const prompts = ['Grateful for…', 'Struggled with…', 'Win today…', 'Tomorrow…'];

	async function submit() {
		if (!entry.trim() || loading) return;
		loading = true;
		try {
			// await addJournalEntry({ body: { content: entry } });
			saved = true;
			entry = '';
			setTimeout(() => (saved = false), 3000);
		} finally {
			loading = false;
		}
	}
</script>

<div class="card w-full rounded-box bg-base-200">
	<div class="card-body gap-5 p-5">
		<div class="flex items-center justify-between">
			<h2 class="text-sm font-semibold tracking-wide">Journal</h2>
			<span class="text-xs text-base-content/40">{today}</span>
		</div>

		<div class="flex flex-wrap gap-1.5">
			{#each prompts as prompt}
				<button
					class="rounded-lg bg-base-300 px-2.5 py-1 text-[11px] text-base-content/50 transition hover:bg-base-content/10 hover:text-base-content"
					onclick={() => (entry = entry ? entry + ' ' + prompt : prompt)}
				>
					{prompt}
				</button>
			{/each}
		</div>

		<div class="divider my-0 text-xs text-base-content/40">What's on your mind?</div>

		<textarea
			bind:value={entry}
			rows={4}
			placeholder="Write anything…"
			class="textarea w-full resize-none textarea-ghost bg-base-300 text-sm leading-relaxed focus:outline-none"
		></textarea>

		<div class="flex items-center justify-between">
			<span class="text-[11px] text-base-content/30">{entry.length} chars</span>
			<button
				class="btn gap-2 btn-sm btn-primary"
				onclick={submit}
				disabled={!entry.trim() || loading}
			>
				{#if saved}
					Saved ✓
				{:else}
					<Send size={14} />
					Save
				{/if}
			</button>
		</div>
	</div>
</div>
