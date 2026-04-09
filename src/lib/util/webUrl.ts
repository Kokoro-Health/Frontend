import { PUBLIC_WEB_URL } from '$env/static/public';

function getWebUrl(): string {
	return PUBLIC_WEB_URL;
}

export const tosUrl = getWebUrl() + '/tos';
