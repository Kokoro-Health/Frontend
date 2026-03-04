import { getMyProfile, type ProfileResponseDto } from '$lib/api';
import { client } from '$lib/api/client.gen';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ data }) => {
	let profile: ProfileResponseDto | null = null;
	if (data.token) {
		client.interceptors.request.use((request) => {
			request.headers.set('Authorization', 'Bearer ' + data.token);
			return request;
		});
		await getMyProfile().then((res) => {
			if (res.data) {
				profile = res.data;
			}
		});
	}
	return {
		token: data.token,
		profile: profile
	};
};
