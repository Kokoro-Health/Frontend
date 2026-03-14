import { defineConfig } from '@hey-api/openapi-ts';

export default defineConfig({
	input: `${process.env.BACKEND_URL ?? 'http://localhost:8080'}/docs`,
	output: 'src/lib/api',
	plugins: [{ auth: true, name: '@hey-api/sdk' }]
});
