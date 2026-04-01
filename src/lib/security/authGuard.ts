import type { ProfileResponseDto } from '$api';
import { redirect } from '@sveltejs/kit';

export class AuthGuard {
	#requireAuth = false;
	#requireNoAuth = false;
	#redirectUrl = '/login';

	constructor(private user: ProfileResponseDto | null) {}

	set requireAuth(value: boolean) {
		this.#requireAuth = value;
	}

	set requireNoAuth(value: boolean) {
		this.#requireNoAuth = value;
	}

	set redirectUrl(url: string) {
		this.#redirectUrl = url;
	}

	validate() {
		if (this.#requireAuth && !this.user) {
			throw redirect(303, this.#redirectUrl);
		}
		if (this.#requireNoAuth && this.user) {
			throw redirect(303, this.#redirectUrl);
		}
	}
}

export class AuthGuardBuilder {
	#guard: AuthGuard;

	constructor(user: ProfileResponseDto | null) {
		this.#guard = new AuthGuard(user);
	}

	protected(url = '/login') {
		this.#guard.requireAuth = true;
		this.#guard.redirectUrl = url;
		return this;
	}

	guestOnly(url = '/dashboard') {
		this.#guard.requireNoAuth = true;
		this.#guard.redirectUrl = url;
		return this;
	}

	build() {
		return this.#guard;
	}
}
