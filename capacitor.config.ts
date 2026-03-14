import { CapacitorConfig } from '@capacitor/cli';

const dev = process.env.NODE_ENV !== 'production';

const getDevUrl = () => {
	const lanIp = process.env.DEV_HOST ?? '10.0.2.2';
	return `http://${lanIp}:5173`;
};

const config: CapacitorConfig = {
	appId: 'health.kokoro',
	appName: 'Kokoro',
	webDir: 'build',
	server: dev
		? {
				url: getDevUrl(),
				cleartext: true
			}
		: undefined
};

export default config;
