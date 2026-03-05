import type { PageLoad } from './$types';
import { getEnergyInfo, type EnergyInfoDto } from '$lib/api';

export const load: PageLoad = async () => {
	let energyInfo: EnergyInfoDto = {
		energy: 0
	};

	await getEnergyInfo().then((res) => {
		if (res.data) energyInfo = res.data;
	});
	return {
		energyInfo: energyInfo
	};
};
