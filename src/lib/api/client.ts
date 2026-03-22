import { client } from './gen/client.gen';
import { getBackendUrl } from '$lib/util/backend';

client.setConfig({
	baseUrl: getBackendUrl()
});

export { client };
