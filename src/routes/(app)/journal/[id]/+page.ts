import { getJournalById, type JournalEntryDto } from '$api';
import type { PageLoad } from './$types';

export const prerender = false;

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
