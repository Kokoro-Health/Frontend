import { client } from '$lib/api/client.gen';
import { getBackendUrl } from '$lib/util/backend';
import type { LayoutLoad } from './$types';

export const prerender = true;

export const load: LayoutLoad = async ({ data }) => {
	client.setConfig({
		baseUrl: getBackendUrl()
	});
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
