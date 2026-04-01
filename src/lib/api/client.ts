import { client } from './gen/client.gen';
import { getBackendUrl } from '$util/backend';

client.setConfig({
	baseUrl: getBackendUrl()
});

export { client };
