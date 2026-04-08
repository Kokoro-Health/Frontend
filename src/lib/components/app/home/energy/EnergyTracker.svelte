<script lang="ts">
	import type { EnergyInfoDto } from '$api';
	import { addEnergyEntry, getEnergyInfoToday, getEnergyReasons } from '$api';
	import { Skull, Frown, Meh, Smile, Laugh, ChartPie } from '@lucide/svelte';
	import EnergyBattery from './EnergyBattery.svelte';
	import ReasonModal from './ReasonModal.svelte';
	import { resolve } from '$app/paths';
	import { hapticImpact, hapticNotification } from '$util/haptics';

	interface Preset {
		icon: typeof Skull;
		label: string;
		value: number;
		style: string;
	}

	const PRESET_VALUES = {
		DEAD: 0,
		LOW: 15,
		OKAY: 40,
		GOOD: 70,
		FULL: 100
	} as const;

	const COOLDOWN_MS = 1000;
	const SECONDS_IN_MINUTE = 60;

	const presets: Preset[] = [
		{
			icon: Skull,
			label: 'Drained',
			value: PRESET_VALUES.DEAD,
			style: 'text-error hover:bg-error/20'
		},
		{ icon: Frown, label: 'Low', value: PRESET_VALUES.LOW, style: 'text-error hover:bg-error/10' },
		{
			icon: Meh,
			label: 'Okay',
			value: PRESET_VALUES.OKAY,
			style: 'text-warning hover:bg-warning/10'
		},
		{
			icon: Smile,
			label: 'Good',
			value: PRESET_VALUES.GOOD,
			style: 'text-success hover:bg-success/10'
		},
		{
			icon: Laugh,
			label: 'Full',
			value: PRESET_VALUES.FULL,
			style: 'text-primary hover:bg-primary/10'
		}
	];

	let { info, onChange }: { info: EnergyInfoDto; onChange: () => void } = $props();

	let displayInfo = $derived(info);
	let loading = $state(false);
	let loggedValue = $state<number | null>(null);
	let cooldownSeconds = $state(0);
	let pendingAmount = $state<number | null>(null);
	let reasons = $state<string[]>([]);

	let reasonModalInstance: ReasonModal | null = null;

	function formatCooldown(seconds: number): string {
		const minutes = Math.floor(seconds / SECONDS_IN_MINUTE);
		const remainingSeconds = seconds % SECONDS_IN_MINUTE;

		if (minutes > 0 && remainingSeconds > 0) return `${minutes}m ${remainingSeconds}s`;
		if (minutes > 0) return `${minutes}m`;
		return `${remainingSeconds}s`;
	}

	$effect(() => {
		const nextAllowed = displayInfo.nextEntryAllowed;
		if (!nextAllowed) {
			cooldownSeconds = 0;
			return;
		}

		const targetTime = new Date(nextAllowed).getTime();

		const tick = () => {
			const now = Date.now();
			const diff = Math.ceil((targetTime - now) / COOLDOWN_MS);
			cooldownSeconds = Math.max(0, diff);
		};

		tick();
		if (cooldownSeconds <= 0) return;

		const intervalId = setInterval(tick, COOLDOWN_MS);

		return () => clearInterval(intervalId);
	});

	$effect(() => {
		displayInfo = info;
	});

	async function openReasonModal(amount: number) {
		pendingAmount = amount;
		const loadedReasons = await loadReasons();
		reasons = loadedReasons;

		if (reasonModalInstance) {
			reasonModalInstance.showModal();
		}
	}

	async function loadReasons(): Promise<string[]> {
		let loadedReasons: string[] = [];
		await getEnergyReasons().then((res) => {
			if (!res.data) return;
			loadedReasons = res.data.reasons;
		});
		return loadedReasons;
	}

	async function handleLog(amount: number, reason?: string | null) {
		if (loading || cooldownSeconds > 0) return;
		if (reason === undefined) {
			openReasonModal(amount);
			return;
		}

		loading = true;
		loggedValue = amount;
		await hapticImpact('medium');

		try {
			await addEnergyEntry({ body: { amount, reason: reason ?? '' } });
			const response = await getEnergyInfoToday();
			if (response.data) {
				displayInfo = response.data;
				loggedValue = null;
				await hapticNotification('success');
			}
		} catch {
			await hapticNotification('error');
		} finally {
			loading = false;
			onChange();
		}
	}

	function handleReasonSelect(reason: string | null) {
		if (pendingAmount !== null) {
			handleLog(pendingAmount, reason);
		}
		pendingAmount = null;
	}
</script>

<div class="card w-full rounded-2xl border border-base-200/60 bg-base-100/80 p-5 backdrop-blur-sm">
	<div class="mb-4 flex items-center justify-between">
		<h2 class="text-base font-semibold text-base-content">Energy</h2>
		<div class="flex items-center gap-3">
			<span class="text-xs font-medium text-base-content/50">Today</span>
			<a href={resolve('/energy/analytics')} class="btn btn-square btn-ghost btn-sm">
				<ChartPie size={18} class="text-base-content/60" />
			</a>
		</div>
	</div>

	<div class="flex justify-center py-3">
		<EnergyBattery level={displayInfo.energy} />
	</div>

	<div class="mb-4 text-center">
		<p class="text-xs font-medium tracking-wider text-base-content/40 uppercase">
			How are you feeling?
		</p>
	</div>

	<div class="grid grid-cols-5 gap-1">
		{#each presets as preset (preset.value)}
			<button
				class="group relative flex flex-col items-center gap-1 rounded-xl py-2 transition-all duration-200 active:scale-90 {preset.style} {loggedValue ===
				preset.value
					? 'bg-base-200/50 ring-2 ring-current ring-offset-2 ring-offset-base-100'
					: 'hover:bg-base-200/30'} disabled:cursor-not-allowed disabled:opacity-40"
				onclick={() => handleLog(preset.value)}
				disabled={loading || cooldownSeconds > 0}
			>
				<preset.icon
					size={18}
					strokeWidth={loggedValue === preset.value ? 2.5 : 2}
					class="transition-transform duration-200 group-hover:scale-110"
				/>
				<span class="text-xs font-medium">{preset.label}</span>
			</button>
		{/each}
	</div>

	{#if cooldownSeconds > 0}
		<div class="mt-4 flex items-center justify-center gap-2 rounded-lg bg-base-200/40 py-2">
			<div class="h-1.5 w-1.5 animate-pulse rounded-full bg-base-content/40"></div>
			<p class="text-xs font-medium text-base-content/50">
				Next entry in {formatCooldown(cooldownSeconds)}
			</p>
		</div>
	{/if}
</div>

<ReasonModal bind:this={reasonModalInstance} {reasons} onSelect={handleReasonSelect} />
