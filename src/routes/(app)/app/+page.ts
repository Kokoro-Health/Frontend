import type { PageLoad } from './$types';
import {
	getCurrentJournal,
	getEnergyInfoToday,
	type EnergyInfoDto,
	type JournalEntryDto
} from '$lib/api';

export const load: PageLoad = async () => {
	let energyInfo: EnergyInfoDto = {
		energy: 0,
		nextEntryAllowed: '',
		reason: ''
	};
	let journal: JournalEntryDto = {
		content: '',
		availableUntil: ''
	};

	await getEnergyInfoToday().then((res) => {
		if (res.data) energyInfo = res.data;
	});

	await getCurrentJournal().then((res) => {
		if (res.data) journal = res.data;
	});

	return {
		energyInfo: energyInfo,
		journal: journal
	};
};
