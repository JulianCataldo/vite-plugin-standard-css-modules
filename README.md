# vite-plugin-standard-css-modules

[![NPM](https://img.shields.io/npm/v/vite-plugin-standard-css-modules)](https://www.npmjs.com/package/vite-plugin-standard-css-modules)
![Downloads](https://img.shields.io/npm/dt/vite-plugin-standard-css-modules)
[![ISC License](https://img.shields.io/npm/l/vite-plugin-standard-css-modules)](./LICENSE)
[![GitHub](https://img.shields.io/badge/Repository-222222?logo=github)](https://github.com/JulianCataldo/vite-plugin-standard-css-modules)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen)](https://makeapullrequest.com)  
[![TypeScript](https://img.shields.io/badge/TypeScript-333333?logo=typescript)](http://www.typescriptlang.org/)
[![Prettier](https://img.shields.io/badge/Prettier-333333?logo=prettier)](https://prettier.io)
[![EditorConfig](https://img.shields.io/badge/EditorConfig-333333?logo=editorconfig)](https://editorconfig.org)

Provides a CSSStyleSheet or a CSSResult (Lit) for use with [import attributes](https://tc39.es/proposal-import-attributes/).  
Using the "with" keyword and "type : css".

---

Allows:

```ts
import myStyles1 from './my-styles-1.css' with { type: 'css' };
import myStyles2 from './my-styles-2.css' assert { type: 'css' }; // ⚠️ Deprecated
import myStyles3 from './my-styles-3.css'; // ⚠️ Non-standard
```

To be imported seamlessly, from your project or a dependency (mono-repo…).

---

The API ensures strict defaults while allowing opt-in flexibility, especially for catering to Node usage.

## Installation

```
npm i vite-plugin-standard-css-modules
```

Vite or compatible frameworks configuration:

```ts
import { standardCssModules } from 'vite-plugin-standard-css-modules';

const myEnvironmentViteConfig = {
	// ...

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
};
```

## Configuration

### `targetSsr`/`targetClient`

`CSSStyleSheet` (**default** for `targetClient`) is agnostic, and platform-native.  
Might not work with **SSR** until JS server runtimes support this API or a working minimal implementation.

`CSSResult` (**default** for `targetSsr`) is Lit-specific. On the client, it can lazily provide a `CSSStyleSheet`.  
Works with **SSR**. Set as **default** if executed in an SSR environment. That might change in the future, when Node will support `CSSStyleSheet`.

### `emptySsr`/`emptyClient` (`boolean`)

Useful if, for example, you're using Lit hydration and don't want to load the style on client,
since they are already provided in the Declarative Shadow Dom as a `<style>` tag. In that case,
you'll set `emptyClient` to `true`, resulting in a dummy, empty stylesheet module.

<!-- ### `filter`

`(params: { id: string; importer?: string; ssr?: boolean }): boolean => myMatcher(filePath, myPatterns)`

Provides a callback for selective CSS file handling.
From there, you can use your favorite glob paths matcher, like picomatch, minimatch…
`ssr` is true when the import is from a server-side context.

This hook is useful if you have some non-standards CSS imports you want to preserve, by migrating to the standard syntax, gradually. -->

<!-- ### `ssrOnlyLit`

`boolean` (default: `false`)

Removes the need for the `?lit` query on the server to get a usable asset.
By opting in, you'll get a `CSSStyleSheet` client side and a `CSSResult` while on the server-side, automatically.
All by using the same bare, query-less import (e.g. `./my-styles.css`). -->

### `include`/`exclude` (`string[]`)

Absolute glob patterns.  
E.g. `include: ['**/src/features/counters/counters.scss']`

### Import flags

#### `?lit`

<!-- This plugin aims to get rid of non-standard import queries.
However, you'll find yourself obliged to use a `CSSResult` in a Node (SSR) setup.
Until a leaner solution emerges, you can add the `?lit` flag on a per-file basis.   -->
<!-- This can be useful if you want to do **server-side-only** stuff with some **client-side**
leaves deeper in the tree, whereas the `transformationMode` shown above is all or nothing. -->

```ts
import myStyles1 from './my-styles-1.css?lit' with { type: 'css' };
```

Overrides `CSSStyleSheet` to `CSSResult` on a per-file basis.

For some reasons, like isomorphism, you might want a `CSSResult` on the client side, but it's not needed otherwise.
Lit (on browser) handles those two shapes just fine, without intermediary steps.  
It's possible to mix and fit them in the static `styles` of your custom element.  
Also, note that hydration alleviates the need for loading the CSS on the client too, hence the `emptyClient` option for that cases.

### SSR considerations with `CSSStyleSheet`

If no DOM shims are present in your JS server runtime, you'll get a `CSSStyleSheet is not defined`.  
With a DOM Shim (like the Lit SSR's one), you'll get a `replaceSync method is not defined`, because the `CSSStyleSheet` global object is empty.  
Solution: use `CSSResult` here (it is set as the default with SSR).

## Environments

- Vite 5
- Vite 5 **SSR** (`ssrModuleLoader`)
- Astro 4 **Client** side JS
- Astro 4 **Server** side JS

Tested with Node 20 (LTS) and 2024 majors browsers.  
Firefox / Safari / Chromium are all supporting constructable stylesheets.

## TypeScript

## Pre/post processors

Support all Vite's CSS pipelines and formats (PostCSS, Less, SASS…).

### IDE awareness

```ts
// ./src/vite-env.d.ts
// or
// ./src/env.d.ts

// Add this reference:
/// <reference types="vite-plugin-standard-css-modules/css-modules" />
// (Order matters with Astro)

/// <reference types="vite/client" />
//              (Or `astro/client`)
```

That way,

```ts
import myElementStyles from './my-element.css' with { type: 'css' };
import myElementStyles from './my-element.css?lit' with { type: 'css' };
```

- `./my-element.css` will be cast as `CSSStyleSheet`
- `./my-element.css?lit` will be cast as `CSSResult`

You can also append them manually in your `env.d.ts`, see [css-modules.d.ts](./css-modules.d.ts).

## Demo

Check out the [demo folder](https://github.com/JulianCataldo/vite-plugin-standard-css-modules).

You'll find an Astro minimal setup, which works **exactly the same** as with this
[vite-lit-ssr demo project](https://github.com/vikerman/vite-lit-ssr).

I updated to the latest Lit 3 and Vite 5, and with minor Lit SSR syntax adaption, tested it successfully.

Both of these setups, Homebrewed Lit SSR and Astro, are using `ssrLoadModuleLoader`.  
Basically, you'll get an isomorphic experience thanks to Vite internal tooling which is smoothening environment gaps, minus unresolved DOM limitations in Node.

## How it works?

`file.css` redirects to `file.css?raw` which by-pass all specific Vite handling.  
Then `file.css?inline` is requested and injected back. This means you should get your usual Vite CSS handling at the end (think all the `post-css` stuff).

---

Since the result is handled like any `?raw` imported module with Vite, it's not a "real", living CSS module.  
See the `rollup-plugin-css-modules` documentation for more details about expected limitations, which are shared conceptually, with `vite-plugin-standard-css-modules`.

## Import Attributes

For now, attributes are just "decorative", and act as a reminder for what is a standard CSS Module and what is
not.  
When Vite will support Import Attributes like Rollup and browsers, those flag will be leveraged and no `include`/`exclude` should be needed anymore.

## Improvements

- Support for relative globs in `include`/`exclude`

## Footnotes

100% ESM, **dependency-free**.

You just need the optional `lit` peer-dependency, if you're using `CSSResult` over the default `CSSStyleSheet`.

---

See also [rollup-plugin-css-modules](https://www.npmjs.com/package/rollup-plugin-css-modules).  
Its documentation will bring you insights into the state of this API proposal.

---

**Other projects 👀**…

- [retext-case-police](https://github.com/JulianCataldo/retext-case-police): Check popular names casing. Example: ⚠️ `github` → ✅ `GitHub`.
- [remark-lint-frontmatter-schema](https://github.com/JulianCataldo/remark-lint-frontmatter-schema): Validate your Markdown **frontmatter** data against a **JSON schema**.
- [JSON Schema Form Element](https://github.com/json-schema-form-element/jsfe): Effortless forms, with standards.

---

<div align="center">

**Find this project useful?**

[![GitHub](https://img.shields.io/badge/Star_me_on_GitHub-222222?logo=github&style=social)](https://github.com/JulianCataldo/vite-plugin-standard-css-modules)

</div>

---

🔗  [JulianCataldo.com](https://www.juliancataldo.com)
