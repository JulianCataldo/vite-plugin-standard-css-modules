import { defineConfig } from 'vite';

import { standardCssModules } from 'vite-plugin-standard-css-modules';

export default defineConfig({
	plugins: [
		standardCssModules({
			transformationMode: 'CSSResult',
		}),
	],
});
