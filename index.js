/**
 * @license
 * Julian Cataldo
 * SPDX-License-Identifier: ISC
 */

import { createFilter, createServer, searchForWorkspaceRoot } from 'vite';

/**
 * @typedef {import("vite").Plugin} VitePlugin
 */
/**
 * @typedef Options
 *
 * **Standard** or **Lit** target.
 *
 * - `CSSStyleSheet` (**default**) is agnostic, might not work with SSR.
 * - `CSSResult` is Lit specific, works with SSR.
 *
 * See also the {@link Options.targetSsr}/{@link Options.targetClient} options,
 * or use the `?lit` import flag for finer grain control.
 *
 * You can also chain this plugin multiple times with different
 * \`include\`/\`exclude\` filters (resolves against absolute path module IDs).
 *
 * @property {TransformationTarget} [targetSsr]
 * @property {TransformationTarget} [targetClient]
 *
 * @property {boolean} [emptySsr]
 * @property {boolean} [emptyClient]
 *
 * @property {string[]} [include]
 * @property {string[]} [exclude]
 *
 * @property {boolean} [log]
 *
 * @typedef {'CSSStyleSheet' | 'CSSResult' | 'empty'} TransformationTarget
 */

const SUPPORTED_EXTENSIONS = [
	'css',
	'scss',
	'sass',
	'less',
	'styl',
	'stylus',
	'pcss',
	'sss',
];

/** @type {Options} */
export const defaultOptions = {
	targetSsr: 'CSSResult',
	targetClient: 'CSSStyleSheet',

	include: [`/**/*.{${SUPPORTED_EXTENSIONS.join(',')}}`],
	exclude: [],

	emptySsr: false,
	emptyClient: false,

	log: false,
};

/**
 * @param {Options} [options]
 * @returns {VitePlugin}
 * */
export function standardCssModules(options) {
	/** @type {import("vite").ViteDevServer | undefined} */
	let server = undefined;

	const root = searchForWorkspaceRoot(process.cwd());

	console.log(root);
	const filter = createFilter(
		options?.include ?? defaultOptions.include,
		options?.exclude ?? defaultOptions.exclude,
	);

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
				server = await createServer({
					clearScreen: false,
					server: { middlewareMode: true },
				});
		},

		async resolveId(id, importer, rIdOptions) {
			const modulePath = await this.resolve(id, importer);

			const [idNoParams, params] = modulePath?.id.split('?') ?? [];

			// const idRelative = idNoParams.replace(process.cwd(), '');
			if (!modulePath?.id || filter(idNoParams) === false) return null;

			console.log({ modulePath });
			const searchParams = new URLSearchParams(params);
			searchParams.set('raw', '');
			searchParams.set('cssStandardModule', '');

			const target = rIdOptions.ssr
				? options?.targetSsr || defaultOptions.targetSsr
				: options?.targetClient || defaultOptions.targetClient;

			const empty = rIdOptions.ssr
				? options?.emptySsr || defaultOptions.emptySsr
				: options?.emptyClient || defaultOptions.emptyClient;

			if (target === 'CSSResult') searchParams.set('lit', '');
			if (empty) searchParams.set('empty', '');

			modulePath.id = `${idNoParams}?${searchParams}`;

			if (options?.log)
				console.info('CSS Modules (resolved)', {
					modulePath,
					importer,
					rIdOptions,
				});

			console.log({ modulePath });
			return modulePath;
		},

		async load(id) {
			if (server === undefined) return null;

			const [idNoParams, params] = id.split('?') ?? [];

			const searchParams = new URLSearchParams(params);

			// NOTE: `direct` or `inline`? Seems to do the same.
			if (searchParams.has('direct')) return;
			if (searchParams.has('cssStandardModule') === false) return;

			const litMode = searchParams.has('lit');
			const emptyMode = searchParams.has('empty');

			if (options?.log) console.info('CSS Modules (load)', { id });

			const requestIdInline = idNoParams + '?direct';
			const transformResult = await server.transformRequest(requestIdInline);

			if (!transformResult) return null;

			// NOTE: NOT NEEDED ANYMORE?
			// // Strips the enclosing ESM bootstrapping code.
			// const code = transformResult.code.slice(
			// 	'export default "'.length,
			// 	-'"'.length,
			// );
			const code = transformResult.code;

			// Swaps the raw string with our final CSS module

			if (litMode) {
				if (emptyMode) {
					const litCssResultModule =
						`import {css} from 'lit';` +
						`export default css\`${'/* emptied */'}\`;`;

					if (options?.log) console.info(litCssResultModule);
					return litCssResultModule;
				}
				const litCssResultModule =
					`import {css} from 'lit';` + `export default css\`${code}\`;`;

				return litCssResultModule;
			}

			if (emptyMode) {
				const litCssResultModule =
					`const stylesheet = new CSSStyleSheet();` +
					`export default stylesheet;`;

				if (options?.log) console.info(litCssResultModule);
				return litCssResultModule;
			}
			const standardStyleSheetModule =
				`const stylesheet = new CSSStyleSheet();` +
				`stylesheet.replaceSync(\`${code}\`);` +
				`export default stylesheet;`;
			if (options?.log) console.info(standardStyleSheetModule);

			console.log({ transformResult, code });

			return standardStyleSheetModule;
		},

		closeBundle() {
			// NOTE: Astro will kill the (extra) dangling dev. server after build, not Vite.
			server?.close();
		},
	};
}
