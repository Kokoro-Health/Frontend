<script lang="ts">
	import type { EnergyInfoDto } from '$lib/api';
	import { addEnergyEntry, getEnergyInfo } from '$lib/api/sdk.gen';
	import { Skull, Frown, Meh, Smile, Laugh } from '@lucide/svelte';
	import EnergyBattery from './EnergyBattery.svelte';

	let { info }: { info: EnergyInfoDto } = $props();

	const presets = [
		{ icon: Skull, label: 'Dead', value: 0, style: 'text-error hover:bg-error/20' },
		{ icon: Frown, label: 'Low', value: 15, style: 'text-error hover:bg-error/10' },
		{ icon: Meh, label: 'Okay', value: 40, style: 'text-warning hover:bg-warning/10' },
		{ icon: Smile, label: 'Good', value: 70, style: 'text-success hover:bg-success/10' },
		{ icon: Laugh, label: 'Full', value: 100, style: 'text-primary hover:bg-primary/10' }
	] as const;

	let loading = $state(false);
	let logged = $state<number | null>(null);
	let cooldown = $state(0);

	function formatCooldown(seconds: number): string {
		const m = Math.floor(seconds / 60);
		const s = seconds % 60;
		if (m > 0 && s > 0) return `${m}m ${s}s`;
		if (m > 0) return `${m}m`;
		return `${s}s`;
	}

	$effect(() => {
		const next = info.nextEntryAllowed;
		if (!next) return;

		const tick = () => {
			cooldown = Math.max(0, Math.ceil((new Date(next).getTime() - Date.now()) / 1000));
		};

		tick();
		if (cooldown <= 0) return;

		const id = setInterval(() => {
			tick();
			if (cooldown <= 0) clearInterval(id);
		}, 1000);

		return () => clearInterval(id);
	});

	async function log(amount: number) {
		if (loading || cooldown > 0) return;
		loading = true;
		logged = amount;
		try {
			await addEnergyEntry({ body: { amount } });
		} finally {
			loading = false;
			const res = await getEnergyInfo();
			if (res.data) info = res.data;
		}
	}
</script>

<div class="card w-full rounded-box bg-base-200">
	<div class="card-body gap-5 p-5">
		<div class="flex items-center justify-between">
			<h2 class="text-sm font-semibold tracking-wide">Energy</h2>
			<span class="text-xs text-base-content/40">Today</span>
		</div>

		<div class="flex justify-center py-2">
			<EnergyBattery level={info.energy} />
		</div>

		<div class="divider my-0 text-xs text-base-content/40">How are you feeling?</div>

		<div class="grid grid-cols-5 gap-1.5">
			{#each presets as preset}
				<button
					class="flex flex-col items-center gap-1.5 rounded-xl py-3 transition-all duration-150 {preset.style} {logged ===
					preset.value
						? 'ring-2 ring-current ring-offset-2 ring-offset-base-200'
						: ''} disabled:opacity-40"
					onclick={() => log(preset.value)}
					disabled={loading || cooldown > 0}
				>
					<preset.icon size={20} strokeWidth={2} />
					<span class="text-[10px] leading-none font-medium">{preset.label}</span>
				</button>
			{/each}
		</div>

		{#if cooldown > 0}
			<p class="text-center text-xs text-base-content/40">
				Next entry in {formatCooldown(cooldown)}
			</p>
		{/if}
	</div>
</div>
