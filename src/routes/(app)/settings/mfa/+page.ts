import type { PageLoad } from './$types';
import { getMfaSettings, getSettings, type MfaSettings, type SettingsResponseDto } from '$lib/api';

export const load: PageLoad = async () => {
	let mfaSettings: MfaSettings = {
		mfaEnabled: false
	};

	await getMfaSettings().then((res) => {
		if (res.data) mfaSettings = res.data;
	});
	return {
		settings: mfaSettings
	};
};
