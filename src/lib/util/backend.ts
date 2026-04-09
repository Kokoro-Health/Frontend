import { PUBLIC_API_URL } from '$env/static/public';

export function getBackendUrl(): string {
	return PUBLIC_API_URL;
}
