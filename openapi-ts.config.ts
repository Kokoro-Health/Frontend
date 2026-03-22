import { defineConfig } from '@hey-api/openapi-ts';

export default defineConfig({
	input: `./openapi.json`,
	output: {
		path: 'src/lib/api/gen'
	},
	plugins: [{ auth: true, name: '@hey-api/sdk' }],
	parser: {
		patch: {
			input: (spec) => {
				if ('servers' in spec && Array.isArray(spec.servers)) {
					delete spec.servers;
				}

				if ('host' in spec) {
					delete spec.host;
					delete spec.basePath;
				}
			}
		}
	}
});
