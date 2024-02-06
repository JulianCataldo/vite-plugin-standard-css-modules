import fs from 'fs';
import path from 'path';
import { Readable } from 'stream';
import { fileURLToPath } from 'url';
import express from 'express';
import { createServer as createViteServer } from 'vite';

const SSR_OUTLET_MARKER = '<!--ssr-outlet-->';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const isTest = process.env.NODE_ENV === 'test' || !!process.env.VITE_TEST_BUILD;

async function* concatStreams(...readables) {
	for (const readable of readables) {
		for await (const chunk of readable) {
			yield chunk;
		}
	}
}

async function createServer(
	root = process.cwd(),
	isProd = process.env.NODE_ENV === 'production',
	hmrPort,
) {
	const resolve = (p) => path.resolve(__dirname, p);
	const indexProd = isProd
		? fs.readFileSync(resolve('dist/client/index.html'), 'utf-8')
		: '';

	const app = express();

	// Create Vite server in middleware mode and configure the app type as
	// 'custom', disabling Vite's own HTML serving logic so parent server
	// can take control
	let vite;

	if (!isProd) {
		vite = await createViteServer({
			root,
			logLevel: isTest ? 'error' : 'info',
			server: {
				middlewareMode: true,
				watch: {
					// During tests we edit the files too fast and sometimes chokidar
					// misses change events, so enforce polling for consistency
					usePolling: true,
					interval: 100,
				},
				hmr: {
					port: hmrPort,
				},
			},
			appType: 'custom',
		});

		// use vite's connect instance as middleware
		// if you use your own express router (express.Router()), you should use router.use
		app.use(vite.middlewares);
	} else {
		// Set CSP Header.
		app.use(function (req, res, next) {
			res.setHeader(
				'Content-Security-Policy',
				"object-src 'none'; font-src 'self'; img-src 'self'; script-src 'self'; frame-src 'self'",
			);
			next();
		});
		app.use((await import('compression')).default());
		app.use(
			(await import('serve-static')).default(resolve('dist/client'), {
				index: false,
			}),
		);
	}

	app.use('*', async (req, res, next) => {
		const url = req.originalUrl;

		try {
			// 1. Read index.html
			let template, render;

			if (!isProd) {
				template = fs.readFileSync(
					path.resolve(__dirname, 'index.html'),
					'utf-8',
				);

				// 2. Apply Vite HTML transforms. This injects the Vite HMR client, and
				//    also applies HTML transforms from Vite plugins.
				template = await vite.transformIndexHtml(url, template);

				// 3. Load the server entry. vite.ssrLoadModule automatically transforms
				//    your ESM source code to be usable in Node.js! There is no bundling
				//    required, and provides efficient invalidation similar to HMR.
				render = (await vite.ssrLoadModule('/src/entry-server.ts')).render;
			} else {
				template = indexProd;
				render = (await import('./dist/server/entry-server.js')).render;
			}

			const index = template.indexOf(SSR_OUTLET_MARKER);
			const pre = Readable.from(template.substring(0, index));
			const post = Readable.from(
				template.substring(index + SSR_OUTLET_MARKER.length + 1),
			);

			// 4. render the app HTML. This assumes entry-server.js's exported `render`
			//    function calls appropriate framework SSR APIs.
			const renderStream = render(url);

			// 5. Inject the app-rendered HTML into the template.
			const output = Readable.from(concatStreams(pre, renderStream, post));

			// 6. Stream the rendered HTML back.
			res.status(200).set({ 'Content-Type': 'text/html' });
			output.pipe(res);
		} catch (e) {
			// If an error is caught, let Vite fix the stack trace so it maps back to
			// your actual source code.
			!isProd && vite.ssrFixStacktrace(e);
			console.log(e.stack);
			res.status(500).end(e.stack);
		}
	});

	return { app, vite };
}

if (!isTest) {
	createServer().then(({ app }) =>
		app.listen(5173, () => {
			console.log('http://localhost:5173');
		}),
	);
}
