import { defineConfig } from "astro/config";

import { standardCssModules } from "vite-plugin-standard-css-modules";

// https://astro.build/config
export default defineConfig({
	vite: {
		plugins: [
			standardCssModules({
				include: ["**/src/*.css"],
			}),
		],
	},

	devToolbar: { enabled: false },
});
