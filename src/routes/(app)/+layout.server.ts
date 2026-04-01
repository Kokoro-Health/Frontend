import { getMyProfile, type ProfileResponseDto } from '$api';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ cookies }) => {
	const token = cookies.get('access_token');
	let profile: ProfileResponseDto | null = null;

	if (token) {
		try {
			const res = await getMyProfile({
				headers: {
					Authorization: `Bearer ${token}`
				}
			});
			profile = res.data ?? null;
		} catch (e) {
			profile = null;
		}
	}

	return {
		token,
		profile
	};
};
