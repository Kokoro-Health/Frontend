import { AuthGuardBuilder } from '$lib/security/authGuard';
import type { LayoutLoad } from '../$types';

export const load: LayoutLoad = ({ data }) => {
	let user = data.profile;
	new AuthGuardBuilder(user).protected('/login').build().validate();
	return {};
};
