import { getJournalById, type JournalEntryDto } from '$lib/api';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params }) => {
	let id = params.id;
	let entry: JournalEntryDto = {
		content: ''
	};
	const res = await getJournalById({
		path: {
			id: id
		}
	});
	if (res.data) entry = res.data;

	return {
		entry: entry
	};
};
