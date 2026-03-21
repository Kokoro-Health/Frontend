<script lang="ts">
	import ThemeLoader from '$lib/components/app/util/ThemeLoader.svelte';
	import MobileDock from '$lib/components/layout/app/MobileDock.svelte';
	import MobileHeader from '$lib/components/layout/app/MobileHeader.svelte';
	import Verification from '$lib/components/layout/app/Verification.svelte';
	import { Chart } from 'chart.js';
	import { onMount } from 'svelte';

	let { children, data } = $props();

	function onVerificationSuccess() {
		if (!window) return;

		window.location.reload();
	}

	onMount(() => {
		setupChartJs();
	});

	function setupChartJs() {
		let lineColor = resolveCssVar('--color-neutral');
		let backgroundColor = resolveCssVar('--color-accent');

		Chart.defaults.borderColor = lineColor;
		Chart.defaults.backgroundColor = backgroundColor;
	}

	function resolveCssVar(name: string): string {
		return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
	}
</script>

<MobileHeader />
<div class="overflow-x-hidden overflow-y-auto px-4">
	{#if data.profile && !data.profile.verified}
		<Verification onSuccess={() => onVerificationSuccess()} email={data.profile.email} />
	{/if}
	{@render children()}
</div>
<MobileDock />
<ThemeLoader theme={data.profile!!.theme} />
