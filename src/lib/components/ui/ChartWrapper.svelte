<script lang="ts">
	import {
		Chart,
		registerables,
		type ChartConfiguration,
		type ChartData,
		type ChartDataset
	} from 'chart.js';

	Chart.register(...registerables);

	type DatasetData = {
		label?: string;
		data: number[];
		borderColor?: string;
		backgroundColor?: string;
		fill?: boolean;
		tension?: number;
	};

	type ChartDataInput = {
		labels?: (string | undefined)[];
		datasets: DatasetData[];
	};

	type ChartOptionsInput = {
		responsive?: boolean;
		maintainAspectRatio?: boolean;
		plugins?: Record<string, unknown>;
		scales?: Record<string, unknown>;
		elements?: Record<string, unknown>;
	};

	let {
		type,
		data,
		options
	}: {
		type: ChartConfiguration['type'];
		data: ChartDataInput;
		options?: ChartOptionsInput;
	} = $props();

	let canvas = $state<HTMLCanvasElement>();
	let chart: Chart | null = null;

	function buildData(): ChartData<ChartConfiguration['type'], number[], string> {
		return {
			labels: (data.labels ?? []) as string[],
			datasets: (data.datasets ?? []).map((d) => ({
				label: d.label,
				data: d.data,
				borderColor: d.borderColor,
				backgroundColor: d.backgroundColor,
				fill: d.fill,
				tension: d.tension
			})) as ChartDataset<ChartConfiguration['type'], number[]>[]
		};
	}

	function buildOptions(): ChartConfiguration['options'] {
		if (!options) return undefined;
		return {
			responsive: true,
			maintainAspectRatio: false,
			plugins: options.plugins,
			scales: options.scales,
			elements: options.elements
		} as ChartConfiguration['options'];
	}

	$effect(() => {
		if (!canvas) return;

		chart = new Chart(canvas, {
			type,
			data: buildData(),
			options: buildOptions()
		});

		return () => {
			chart?.destroy();
			chart = null;
		};
	});

	$effect(() => {
		if (!chart) return;

		chart.data = buildData();
		chart.options = buildOptions() ?? {};
	});
</script>

<div class="relative h-full w-full">
	<canvas bind:this={canvas}></canvas>
</div>
