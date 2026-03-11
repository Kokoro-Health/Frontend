import { client } from '$lib/api/client.gen';
import type { LayoutLoad } from './$types';
export const prerender = true;

export const load: LayoutLoad = async ({ data }) => {
	if (data.token) {
		client.interceptors.request.use((request) => {
			request.headers.set('Authorization', 'Bearer ' + data.token);
			return request;
		});
	}
	return {
		token: data.token,
		profile: data.profile
	};
};
