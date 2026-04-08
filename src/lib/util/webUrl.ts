function getWebUrl(): string {
	return import.meta.env.PUBLIC_WEB_URL;
}

export const tosUrl = getWebUrl() + '/tos';
