/**
 * @license
 * Julian Cataldo
 * SPDX-License-Identifier: ISC
 */
/**
 * @typedef Options
 *
 * @property {TransformationMode} transformationMode
 *
 * **Standard** or **Lit** output.
 *
 * - `CSSStyleSheet` (**default**) is agnostic, might not work with SSR.
 * - `CSSResult` is Lit specific, works with SSR.
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
 * @param {Options} options
 * @returns {VitePlugin}
 * */
export function standardCssModules(
	options = {
		transformationMode: 'CSSStyleSheet',
		filter: undefined,
		log: false,
	},
) {
	/** @type {import("vite").ViteDevServer} */
	let server;

	return {
		name: 'standard-css-modules',

		enforce: 'pre', // NOTE: Doesn't seems to do anything, but just in case.

		configureServer(s) {
			server = s;
		},

		resolveId(id, importer, rIdOptions) {
			// NOTE: Very naive checks.
			// Could use URLSearchParams, robust Regexes, Vite metadata…
			// User shouldn't be messing around much with query combinations, though,
			// so basic strings manipulations is fine for now.
			const standardMode = id.endsWith('.css');
			const litMode = id.endsWith('.css?lit');
			const ssrAutoMode = options.ssrOnlyLit && rIdOptions.ssr;

			if (standardMode === false && litMode === false) return null;

			const filterParams = { id, importer, ssr: rIdOptions.ssr };
			if (options.filter?.(filterParams) === false) return null;

			if (options.log) console.info('CSS Modules (resolved)', filterParams);

			let specialModeParameters = '';
			if (litMode) specialModeParameters = '&lit';
			if (ssrAutoMode) specialModeParameters = '&ssr_auto';

			const idWithQuery = `${id}?raw${specialModeParameters}`;

			// We're doing a re-route to `?raw`, which is the only one we can trick.
			// NOTE: `?inline` is not working, it triggers `postcss`.
			// See also: https://github.com/vitejs/vite/issues/9465#issuecomment-1418629015
			return this.resolve(idWithQuery, importer);
		},

		async load(id) {
			if (!server) return null;

			const standardMode = id.endsWith('.css?raw');
			const litMode = id.endsWith('.css?raw&lit');
			const ssrAutoMode = id.endsWith('.css?raw&ssr_auto');
			if (standardMode === false && litMode === false && ssrAutoMode === false)
				return null;

			if (options.log) console.info('CSS Modules (load)', { id });

			// Get the `inline` result (parsed and minified by the Vite toolchain),
			const requestId = id.replace(/\?(.*)$/, '?inline');

			const transformResult = await server.transformRequest(requestId);
			if (!transformResult) return null;

			// Strip the enclosing ESM bootstrapping code.
			const code = transformResult.code.slice(
				'export default "'.length,
				-'"'.length,
			);

			// Swaps the raw string with our final CSS module
			if (options.transformationMode === 'CSSResult' || ssrAutoMode) {
				const litCssResultModule =
					`import {css} from 'lit';` + `export default css\`${code}\`;`;
				return litCssResultModule;
			}

			const standardStylesheetModule =
				`const stylesheet = new CSSStyleSheet();` +
				`stylesheet.replaceSync(\`${code}\`);` +
				`export default stylesheet;`;

			if (options.log) console.info(standardStylesheetModule);

			return standardStylesheetModule;
		},
	};
}

/**
 * @typedef {import("vite").Plugin} VitePlugin
 */
