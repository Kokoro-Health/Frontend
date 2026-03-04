import type { ProfileResponseDto } from '$lib/api';
import { AuthGuardBuilder } from '$lib/security/authGuard.js';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ parent, cookies }) => {
	let profile: ProfileResponseDto | null = null;
	await parent().then((res) => {
		profile = res.profile;
	});
	new AuthGuardBuilder(profile).protected('/login').build().validate();
	return {};
};
