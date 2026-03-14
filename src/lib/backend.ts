import { Capacitor } from '@capacitor/core';

export function getBackendUrl(): string {
	if (import.meta.env.BACKEND_URL) {
		return import.meta.env.BACKEND_URL;
	}
	if (Capacitor.getPlatform() === 'android') {
		return 'http://10.0.2.2:8080';
	}
	return 'http://localhost:8080';
}
