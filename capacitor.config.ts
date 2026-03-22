import { CapacitorConfig } from '@capacitor/cli';
import { KeyboardResize } from '@capacitor/keyboard';

const dev = process.env.NODE_ENV !== 'production';

const config: CapacitorConfig = {
	appId: 'health.kokoro',
	appName: 'Kokoro',
	webDir: 'build',
	server: dev
		? {
				url: process.env.DEV_HOST,
				cleartext: true
			}
		: undefined,
	plugins: {
		Keyboard: {
			resize: KeyboardResize.Native,
			resizeOnFullScreen: true
		}
	}
};

export default config;
