<script lang="ts">
	import type { StreakResponseDto } from '$lib/api';
	import { FlameIcon } from '@lucide/svelte';

	let { streak = $bindable() }: { streak: StreakResponseDto } = $props();

	let isAnimating = $state(false);

	$effect(() => {
		if (streak.streakIncreasedToday) {
			isAnimating = true;
			setTimeout(() => (isAnimating = false), 1000);
		}
	});

	const getProgress = () => {
		return Math.min(100, ((streak.streak % 7) / 7) * 100 || (streak.streak > 0 ? 100 : 0));
	};
</script>

<div class="w-full rounded-xl border border-base-200 px-4 py-2">
	<div class="flex items-center gap-3">
		<div class="relative shrink-0">
			<FlameIcon
				class="h-5 w-5 transition-all duration-300
        {isAnimating ? 'scale-125' : ''}
        {streak.streakIncreasedToday ? 'fill-orange-500 text-orange-500' : 'text-base-content/40'}"
				style={streak.streakIncreasedToday
					? 'filter: drop-shadow(0 0 6px rgb(249 115 22 / 0.7))'
					: ''}
			/>

			{#if isAnimating}
				<div class="absolute inset-0 animate-ping rounded-full bg-orange-400/20"></div>
			{/if}
		</div>

		<div class="flex min-w-0 flex-1 flex-col gap-1">
			<div class="flex items-center justify-between">
				<span class="text-xs text-base-content/50">Daily streak</span>
				<div class="flex items-baseline gap-1">
					<span class="text-sm font-bold tabular-nums">{streak.streak}</span>
					<span class="text-xs text-base-content/50">days</span>
					{#if streak.streakIncreasedToday}
						<span class="text-xs font-semibold text-success">+1</span>
					{/if}
				</div>
			</div>

			<div class="h-1 w-full overflow-hidden rounded-full bg-base-200">
				<div
					class="h-full rounded-full bg-orange-400 transition-all duration-500"
					style={`width: ${getProgress()}%`}
				></div>
			</div>
		</div>
	</div>
</div>
