import { defineConfig } from 'vite';
import { standardCssModules } from 'vite-plugin-standard-css-modules';

// https://vitejs.dev/config/

export default defineConfig({
	plugins: [
		standardCssModules({
			transformationMode: 'CSSResult',
			log: true,
			filter: ({ id }) => {
				console.log(id);
				if (id === './src/index.css') return false;
				return true;
			},
		}),
	],
});
