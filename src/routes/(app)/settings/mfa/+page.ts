import type { PageLoad } from './$types';
import { getMfaSettings, type MfaSettingsResponseDto } from '$api';

export const load: PageLoad = async () => {
	let mfaSettings: MfaSettingsResponseDto = {
		mfaEnabled: false
	};

	await getMfaSettings().then((res) => {
		if (res.data) mfaSettings = res.data;
	});
	return {
		settings: mfaSettings
	};
};
