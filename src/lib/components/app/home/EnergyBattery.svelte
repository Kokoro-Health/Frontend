<script lang="ts">
	import { Frown, Meh, Smile, Laugh, Zap, Skull } from '@lucide/svelte';

	let { level = 0 }: { level: number } = $props();

	const status = $derived.by(() => {
		if (level === 0) return { icon: Skull, color: 'text-error', msg: 'DEAD', bg: 'bg-error/10' };
		if (level < 20) return { icon: Frown, color: 'text-error', msg: 'LOW', bg: 'bg-error/20' };
		if (level < 50) return { icon: Meh, color: 'text-warning', msg: 'OK', bg: 'bg-warning/20' };
		if (level < 80) return { icon: Smile, color: 'text-success', msg: 'GOOD', bg: 'bg-success/20' };
		return { icon: Laugh, color: 'text-primary', msg: 'FULL', bg: 'bg-primary/20' };
	});
</script>

<div class="card w-40 overflow-hidden">
	<div class="flex flex-col items-center gap-3 p-4">
		<div
			class="relative flex h-16 w-16 items-center justify-center rounded-full {status.bg} transition-colors duration-500"
		>
			<status.icon size={40} class="{status.color} transition-all" strokeWidth={2.5} />
			{#if level > 90}
				<div class="absolute -top-1 -right-1">
					<Zap size={18} class="animate-bounce fill-yellow-400 text-yellow-500" />
				</div>
			{/if}
		</div>

		<div class="w-full space-y-1 text-center">
			<div class="flex items-end justify-between px-1">
				<span class="text-sm lowercase">{status.msg}</span>
				<span class="text-sm font-bold">{level}%</span>
			</div>

			<div class="flex h-4 w-full items-center overflow-hidden rounded-lg p-1">
				<div
					class="h-full rounded-sm transition-all duration-700 ease-out {level < 20
						? 'bg-error'
						: level < 50
							? 'bg-warning'
							: 'bg-success'}"
					style="width: {level}%"
				></div>
			</div>
		</div>
	</div>
</div>
