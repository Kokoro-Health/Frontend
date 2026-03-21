<script lang="ts">
	import { Frown, Meh, Smile, Laugh, Zap, Skull } from '@lucide/svelte';

	let { level = 0 }: { level: number } = $props();

	const status = $derived.by(() => {
		if (level === 0) return { icon: Skull, color: 'text-error', label: 'Dead', bg: 'bg-error/10' };
		if (level < 20) return { icon: Frown, color: 'text-error', label: 'Low', bg: 'bg-error/15' };
		if (level < 50) return { icon: Meh, color: 'text-warning', label: 'Okay', bg: 'bg-warning/15' };
		if (level < 80)
			return { icon: Smile, color: 'text-success', label: 'Good', bg: 'bg-success/15' };
		return { icon: Laugh, color: 'text-primary', label: 'Full', bg: 'bg-primary/15' };
	});

	const barColor = $derived(
		level < 20 ? 'bg-error' : level < 50 ? 'bg-warning' : level < 80 ? 'bg-success' : 'bg-primary'
	);
</script>

<div class="flex w-28 flex-col items-center gap-3">
	<div
		class="relative flex h-20 w-20 items-center justify-center rounded-full transition-colors duration-500 {status.bg} {status.color}"
	>
		<status.icon size={44} strokeWidth={2} class="transition-all duration-300" />
		{#if level > 90}
			<div class="absolute -top-1 -right-1">
				<Zap size={16} class="animate-bounce fill-yellow-400 text-yellow-500" />
			</div>
		{/if}
	</div>

	<div class="w-full space-y-1.5">
		<div class="flex items-center justify-between">
			<span class="text-xs font-medium tracking-widest text-base-content/50 uppercase">
				{status.label}
			</span>
			<span class="text-sm font-bold">{level}%</span>
		</div>
		<div class="h-2 w-full overflow-hidden rounded-full bg-base-300">
			<div
				class="h-full rounded-full transition-all duration-700 ease-out {barColor}"
				style="width: {level}%"
			></div>
		</div>
	</div>
</div>
