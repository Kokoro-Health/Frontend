import { getJournalById } from '$lib/api';
import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params }) => {
	let id = params.id;

	const res = await getJournalById({
		path: {
			id: id
		}
	});
	if (!res.data) {
		redirect(300, '/journal');
		return;
	}

	return {
		entry: res.data
	};
};
