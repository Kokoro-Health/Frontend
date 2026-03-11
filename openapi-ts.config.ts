import { defineConfig } from '@hey-api/openapi-ts';

export default defineConfig({
	input: 'http://10.238.69.191:8080/docs',
	output: 'src/lib/api',
	plugins: [
		{
			auth: true,
			name: '@hey-api/sdk'
		}
	]
});
