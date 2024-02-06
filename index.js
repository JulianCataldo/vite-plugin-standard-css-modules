/**
 * @license
 * Julian Cataldo
 * SPDX-License-Identifier: ISC
 */
/**
 * @typedef {import("vite").Plugin<undefined>} VitePlugin
 */
/**
 * @typedef Options
 *
 * @property {TransformationMode} [transformationMode]
 *
 * **Standard** or **Lit** output.
 *
 * - `CSSStyleSheet` (**default**) is agnostic, might not work with SSR.
 * - `CSSResult` is Lit specific, works with SSR.
 *
 * See also the {@link Options.ssrOnlyLit} option, or
 * use the `?lit` import flag for finer grain control.
 *
 * @property {FilterAction} [filter]
 * @property {boolean} [ssrOnlyLit]
 *
 * Force `CSSResult` if invoked in an SSR context, without the `?lit` flag.
 *
 * @property {boolean} [log]
 *
 * @typedef {'CSSStyleSheet' | 'CSSResult'} TransformationMode
 */
/**
 * @typedef {(params: FilterActionParams) => boolean} FilterAction
 * @typedef FilterActionParams
 * @property {string} id
 * @property {string} [importer]
 * @property {boolean} [ssr]
 */

/**
 * @param {Options} [options]
 * @returns {VitePlugin}
 * */
export function standardCssModules(
	options = {
		transformationMode: 'CSSStyleSheet',
		filter: undefined,
		ssrOnlyLit: false,
		log: false,
	},
) {
	/** @type {import("vite").ViteDevServer | undefined} */
	let server = undefined;

	return {
		name: 'standard-css-modules',

		enforce: 'pre', // NOTE: Doesn't seems to do anything, but just in case.

		// NOTE: Only called with Vite dev. (aka serve) mode, not build.
		configureServer(_server) {
			server = _server;
		},

		async configResolved(config) {
			// NOTE: `transformRequest` isn't available within the Vite/Rollup build.
			if (config.command === 'build')
				// HACK: Maybe? It might not be required to spin-up a server.
				// See https://github.com/vitejs/vite/issues/3798#issuecomment-862185554
				// We could leverage the Rollup cache?
				server = await (
					await import('vite')
				).createServer({
					clearScreen: false,
					server: { middlewareMode: true },
				});
		},

		resolveId(id, importer, rIdOptions) {
			// NOTE: Very naive checks.
			// Could use URLSearchParams, robust Regexes, Vite metadata…
			// User shouldn't be messing around much with query combinations, though,
			// so basic strings manipulations is fine for now.
			const standardMode = id.endsWith('.css');
			const litMode = id.endsWith('.css?lit');
			const ssrAutoLitMode =
				options.ssrOnlyLit &&
				rIdOptions.ssr; /* If entry is requested from an SSR context. */

			if (standardMode === false && litMode === false) return null;

			const filterParams = { id, importer, ssr: rIdOptions.ssr };
			if (options.filter?.(filterParams) === false) return null;

			if (options.log) console.info('CSS Modules (resolved)', filterParams);

			let specialModeParameters = '';
			// NOTE: We could append / switch more derivations in the future.
			if (ssrAutoLitMode || litMode) specialModeParameters = '&lit';

			const idWithQuery = `${id}?raw${specialModeParameters}`;

			// We're doing a re-route to `?raw`, which is the only one we can trick.
			// NOTE: `?inline` is not working, it triggers `postcss`.
			// See also: https://github.com/vitejs/vite/issues/9465#issuecomment-1418629015
			return this.resolve(idWithQuery, importer);
		},

		async load(id) {
			if (server === undefined) return null;

			const standardMode = id.endsWith('.css?raw');
			const litMode = id.endsWith('.css?raw&lit');

			if (standardMode === false && litMode === false) return null;

			if (options.log) console.info('CSS Modules (load)', { id });

			// Get the `inline` result (parsed and minified by the Vite toolchain),
			const requestIdInline = id.replace(/\?(.*)$/, '?inline');

			const transformResult = await server.transformRequest(requestIdInline);
			if (!transformResult) return null;

			// Strips the enclosing ESM bootstrapping code.
			const code = transformResult.code.slice(
				'export default "'.length,
				-'"'.length,
			);

			// Swaps the raw string with our final CSS module

			if (options.transformationMode === 'CSSResult' || litMode) {
				const litCssResultModule =
					`import {css} from 'lit';` + `export default css\`${code}\`;`;

				if (options.log) console.info(litCssResultModule);
				return litCssResultModule;
			}
			const standardStyleSheetModule =
				`const stylesheet = new CSSStyleSheet();` +
				`stylesheet.replaceSync(\`${code}\`);` +
				`export default stylesheet;`;

			if (options.log) console.info(standardStyleSheetModule);
			return standardStyleSheetModule;
		},

		closeBundle() {
			// NOTE: Astro will kill the (extra) dangling dev. server after build, not Vite.
			server?.close();
		},
	};
}
