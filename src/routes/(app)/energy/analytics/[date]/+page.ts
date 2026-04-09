import { getEnergyEntriesForDay, type EnergyDetailsResponseDto } from '$api';
import type { PageLoad } from './$types';

export const prerender = false;

export const load: PageLoad = async ({ params }) => {
	const date = params.date;
	let details: EnergyDetailsResponseDto = {
		entries: [],
		average: 0,
		influentialNegative: {
			reason: '',
			level: 0
		},
		influentialPositive: {
			reason: '',
			level: 0
		}
	};
	await getEnergyEntriesForDay({
		path: {
			date
		}
	}).then((res) => {
		if (res.data) details = res.data;
	});

	return {
		date,
		details
	};
};
