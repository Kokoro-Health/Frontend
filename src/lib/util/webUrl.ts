function getWebUrl(): string {
	return import.meta.env.VITE_WEB_URL;
}

export const tosUrl = getWebUrl() + '/tos';
