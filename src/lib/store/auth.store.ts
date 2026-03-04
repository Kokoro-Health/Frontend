import { browser } from '$app/environment';

const TOKEN_KEY = 'access_token';

const getCookie = (name: string): string | null => {
	if (!browser) return null;
	const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
	return match ? decodeURIComponent(match[2]) : null;
};

const setCookie = (name: string, value: string | null, expiresAt?: number) => {
	if (!browser) return;
	const expiry = value
		? expiresAt
			? `expires=${new Date(expiresAt).toUTCString()}`
			: 'max-age=31536000'
		: 'expires=Thu, 01 Jan 1970 00:00:00 GMT';
	const cookieValue = value ? encodeURIComponent(value) : '';
	document.cookie = `${name}=${cookieValue}; path=/; SameSite=Strict; Secure; ${expiry}`;
};

export class Auth {
	#token = getCookie(TOKEN_KEY);

	get token() {
		return this.#token;
	}

	setToken(value: string | null, expiresAt?: number) {
		this.#token = value;
		setCookie(TOKEN_KEY, value, expiresAt);
	}

	get isAuthenticated() {
		return !!this.token;
	}
}

export const auth = new Auth();
