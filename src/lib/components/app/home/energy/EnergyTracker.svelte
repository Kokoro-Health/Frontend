<script lang="ts">
	import type { EnergyInfoDto } from '$api';
	import { addEnergyEntry, getEnergyInfoToday, getEnergyReasons } from '$api';
	import { Skull, Frown, Meh, Smile, Laugh, ChartPie } from '@lucide/svelte';
	import EnergyBattery from './EnergyBattery.svelte';
	import ReasonModal from './ReasonModal.svelte';

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
			label: 'Dead',
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

	let reasonModalInstance: InstanceType<any> | null = null;

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

		try {
			await addEnergyEntry({ body: { amount, reason: reason ?? '' } });
			const response = await getEnergyInfoToday();
			if (response.data) {
				displayInfo = response.data;
				loggedValue = null;
			}
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

<div class="card w-full rounded-box border border-base-200">
	<div class="card-body gap-5 p-5">
		<div class="flex items-center justify-between">
			<h2 class="text-sm font-semibold tracking-wide">Energy</h2>
			<div class="flex flex-row items-center justify-center space-x-3">
				<span class="text-xs text-base-content/40">Today</span>
				<a href="/energy/analytics" class="btn btn-soft btn-sm">
					<ChartPie size={18} />
				</a>
			</div>
		</div>

		<div class="flex justify-center py-2">
			<EnergyBattery level={displayInfo.energy} />
		</div>

		<div class="divider my-0 text-xs text-base-content/40">How are you feeling?</div>

		<div class="grid grid-cols-5 gap-1.5">
			{#each presets as preset}
				<button
					class="flex flex-col items-center gap-1.5 rounded-xl py-3 transition-all duration-150 {preset.style} {loggedValue ===
					preset.value
						? 'ring-2 ring-current ring-offset-2 ring-offset-base-200'
						: ''} disabled:opacity-40"
					onclick={() => handleLog(preset.value)}
					disabled={loading || cooldownSeconds > 0}
				>
					<preset.icon size={20} strokeWidth={2} />
					<span class="text-[10px] leading-none font-medium">{preset.label}</span>
				</button>
			{/each}
		</div>

		{#if cooldownSeconds > 0}
			<p class="text-center text-xs text-base-content/40">
				Next entry in {formatCooldown(cooldownSeconds)}
			</p>
		{/if}
	</div>
</div>

<ReasonModal
	bind:this={reasonModalInstance}
	{reasons}
	onSelect={handleReasonSelect}
	onClose={() => {
		pendingAmount = null;
	}}
/>
