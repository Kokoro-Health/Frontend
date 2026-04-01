import type { PageLoad } from './$types';
import { getSettings, type SettingsResponseDto } from '$api';

export const load: PageLoad = async () => {
	let settings: SettingsResponseDto = {
		theme: 'LIGHT',
		language: 'ENGLISH',
		marketingEmails: true,
		securityAlerts: true,
		reminderEmails: false,
		updatedAt: '',
		timezone: '',
		dateFormat: ''
	};

	await getSettings().then((res) => {
		if (res.data) settings = res.data;
	});
	return {
		settings: settings
	};
};
