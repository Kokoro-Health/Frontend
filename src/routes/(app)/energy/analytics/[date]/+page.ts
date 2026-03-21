import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params }) => {
	let date = params.date;

	return {
		date
	};
};
