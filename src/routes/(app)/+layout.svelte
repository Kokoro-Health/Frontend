<script lang="ts">
	import ThemeLoader from '$components/app/util/ThemeLoader.svelte';
	import MobileDock from '$components/layout/app/MobileDock.svelte';
	import MobileHeader from '$components/layout/app/MobileHeader.svelte';
	import Verification from '$components/layout/app/Verification.svelte';
	import { Chart } from 'chart.js';
	import { onMount } from 'svelte';
	import gsap from 'gsap';

	let { children, data } = $props();

	function onVerificationSuccess() {
		if (!window) return;
		window.location.reload();
	}

	onMount(() => {
		setupChartJs();
		setupPageAnimations();
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

	function setupPageAnimations() {
		const main = document.querySelector('main');
		if (main) {
			gsap.fromTo(main, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: 'power2.out' });
		}
	}
</script>

<MobileHeader />

<main
	class="relative flex flex-1 flex-col overflow-x-hidden overflow-y-auto px-4 transition-all duration-300 ease-out"
>
	{#if data.profile && !data.profile.verified}
		<div class="-mx-4 mb-4 px-4">
			<Verification onSuccess={() => onVerificationSuccess()} email={data.profile.email} />
		</div>
	{/if}
	<div class="flex flex-1 flex-col pb-20">
		{@render children()}
	</div>
</main>

<MobileDock />
<ThemeLoader theme={data.profile!.theme} />
