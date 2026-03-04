import { invalidateAll } from '$app/navigation';
import { logout } from '$lib/api';
import { client } from '$lib/api/client.gen';

function performLogout() {
	logout({
		credentials: 'include'
	}).then(() => {
		client.interceptors.request.clear();
		invalidateAll();
	});
}

export { performLogout };
