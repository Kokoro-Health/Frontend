import type { PageLoad } from './$types';
import {
	getCurrentJournal,
	getRecentJournalsShort,
	type JournalEntryDto,
	type ShortJournalResponseDto
} from '$api';

export const load: PageLoad = async () => {
	let journal: JournalEntryDto = {
		content: '',
		availableUntil: '',
		id: ''
	};

	let recentJournals: ShortJournalResponseDto[] = [];

	await getCurrentJournal().then((res) => {
		if (res.data) journal = res.data;
	});

	await getRecentJournalsShort().then((res) => {
		if (res.data) recentJournals = res.data;
	});

	return {
		journal: journal,
		recentJournals: recentJournals
	};
};
