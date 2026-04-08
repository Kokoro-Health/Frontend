<script lang="ts">
	import type { StreakResponseDto } from '$api';
	import { FlameIcon } from '@lucide/svelte';
	import gsap from 'gsap';

	let { streak = $bindable() }: { streak: StreakResponseDto } = $props();

	let flameRef: HTMLDivElement;

	$effect(() => {
		if (streak.streakIncreasedToday && flameRef) {
			gsap.to(flameRef, {
				scale: 1.2,
				rotation: 15,
				duration: 0.3,
				ease: 'back.out(1.7)',
				yoyo: true,
				repeat: 1
			});
		}
	});

	const getProgress = () => {
		const dayInCycle = streak.streak % 7 || 7;
		return (dayInCycle / 7) * 100;
	};
</script>

<div class="flex items-center gap-3">
	<div bind:this={flameRef} class="shrink-0">
		<div
			class="flex h-10 w-10 items-center justify-center rounded-xl {streak.streakIncreasedToday
				? 'bg-orange-500/20'
				: streak.streak > 0
					? 'bg-orange-500/10'
					: 'bg-base-200'}"
		>
			<FlameIcon
				size={20}
				class={streak.streakIncreasedToday
					? 'text-orange-500'
					: streak.streak > 0
						? 'text-orange-400'
						: 'text-base-content/30'}
			/>
		</div>
	</div>

	<div class="flex flex-1 flex-col gap-1.5">
		<div class="flex items-center justify-between">
			<span class="text-sm font-semibold text-base-content">{streak.streak} day streak</span>
			<span class="text-xs text-base-content/50">Day {streak.streak % 7 || 7}</span>
		</div>
		<div class="h-1.5 w-full overflow-hidden rounded-full bg-base-200/60">
			<div
				class="h-full rounded-full bg-gradient-to-r from-orange-400 to-amber-400 transition-all duration-700 ease-out"
				style={`width: ${getProgress()}%`}
			></div>
		</div>
	</div>
</div>
