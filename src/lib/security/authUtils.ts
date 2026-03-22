import { invalidateAll } from '$app/navigation';
import { logout, client } from '$lib/api';

function performLogout() {
	logout({
		credentials: 'include'
	}).then(() => {
		client.interceptors.request.clear();
		invalidateAll();
	});
}

export { performLogout };
