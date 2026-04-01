import { invalidateAll } from '$app/navigation';
import { logout, client } from '$api';

function performLogout() {
	logout({
		credentials: 'include'
	}).then(() => {
		client.interceptors.request.clear();
		invalidateAll();
	});
}

export { performLogout };
