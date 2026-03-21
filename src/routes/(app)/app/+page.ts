import type { PageLoad } from './$types';
import { getEnergyInfoToday, type EnergyInfoDto } from '$lib/api';

export const load: PageLoad = async () => {
	let energyInfo: EnergyInfoDto = {
		energy: 0,
		nextEntryAllowed: '',
		reason: ''
	};

	await getEnergyInfoToday().then((res) => {
		if (res.data) energyInfo = res.data;
	});
	return {
		energyInfo: energyInfo
	};
};
