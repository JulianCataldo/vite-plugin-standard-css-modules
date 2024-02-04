import { defineConfig } from "astro/config";

import { standardCssModules } from "vite-plugin-standard-css-modules";

// https://astro.build/config
export default defineConfig({
	vite: {
		plugins: [
			standardCssModules({
				/* transformationMode: "CSSResult", */

				filter: (params) => {
					// console.log({ params });

					// if (filePath === "foo") return false;
					// if (params.ssr) return false;

					return true;
				},

				/* log: false, */

				ssrOnlyLit: true, // Removes the need for `?lit`, server-side.
			}),
		],
	},

	devToolbar: { enabled: false },
});
