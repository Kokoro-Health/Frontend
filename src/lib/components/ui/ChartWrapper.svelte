<script lang="ts">
	import { Chart, registerables, type ChartConfiguration, type ChartOptions } from 'chart.js';

	Chart.register(...registerables);

	let {
		type,
		data,
		options
	}: {
		type: ChartConfiguration['type'];
		data: ChartConfiguration['data'];
		options?: ChartOptions;
	} = $props();

	let canvas = $state<HTMLCanvasElement>();
	let chart: Chart | null = null;

	function buildData() {
		return {
			labels: [...(data.labels ?? [])],
			datasets: (data.datasets ?? []).map((d: any) => ({
				label: d.label,
				data: [...d.data],
				borderColor: d.borderColor,
				backgroundColor: d.backgroundColor,
				fill: d.fill,
				tension: d.tension
			}))
		};
	}

	function buildOptions() {
		if (!options) return {};
		return {
			responsive: true,
			maintainAspectRatio: false,
			plugins: options.plugins,
			scales: options.scales,
			elements: options.elements
		};
	}

	$effect(() => {
		if (!canvas) return;

		chart = new Chart(canvas, {
			type,
			data: buildData() as any,
			options: buildOptions() as any
		});

		return () => {
			chart?.destroy();
			chart = null;
		};
	});

	$effect(() => {
		if (!chart) return;

		chart.data = buildData() as any;
		chart.options = buildOptions() as any;
	});
</script>

<div class="relative h-full w-full">
	<canvas bind:this={canvas}></canvas>
</div>
