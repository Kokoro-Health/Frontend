import type { ProfileResponseDto } from '$api';
import { AuthGuardBuilder } from '$security/authGuard.js';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ parent }) => {
	let profile: ProfileResponseDto | null = null;
	await parent().then((res) => {
		profile = res.profile;
	});
	new AuthGuardBuilder(profile).protected('/login').build().validate();
	return {};
};
