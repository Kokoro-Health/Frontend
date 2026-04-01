import type { PageLoad } from './$types';
import {
	getCurrentJournal,
	getCurrentStreak,
	getEnergyInfoToday,
	type EnergyInfoDto,
	type JournalEntryDto,
	type StreakResponseDto
} from '$api';

export const load: PageLoad = async () => {
	let energyInfo: EnergyInfoDto = {
		energy: 0,
		nextEntryAllowed: '',
		reason: ''
	};
	let journal: JournalEntryDto = {
		id: '',
		content: '',
		availableUntil: ''
	};
	let streak: StreakResponseDto = {
		streak: 0,
		streakIncreasedToday: false
	};

	await getEnergyInfoToday().then((res) => {
		if (res.data) energyInfo = res.data;
	});

	await getCurrentJournal().then((res) => {
		if (res.data) journal = res.data;
	});
	await getCurrentStreak().then((res) => {
		if (res.data) streak = res.data;
	});

	return {
		energyInfo: energyInfo,
		journal: journal,
		streak: streak
	};
};
