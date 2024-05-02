import { defineConfig } from 'vite';
import { standardCssModules } from 'vite-plugin-standard-css-modules';

// https://vitejs.dev/config/

export default defineConfig({
	plugins: [
		standardCssModules({
			include: ['/**/my-element.css'],
		}),
	],
});
