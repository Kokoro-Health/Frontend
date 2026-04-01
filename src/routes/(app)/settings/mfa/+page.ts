import type { PageLoad } from './$types';
import { getMfaSettings, type MfaSettings } from '$api';

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
