# vite-plugin-standard-css-modules

Provide a `CSSStyleSheet` or a `CSSResult` (Lit) for using with [import attributes](https://tc39.es/proposal-import-attributes/).  
Using the "with" keyword and "type : css".

---

Allows:

```ts
import foo from './bar.css' with { type: 'css' };
import foo from './bar.css' assert { type: 'css' }; // ⚠️ Deprecated
import foo from './bar.css'; // ⚠️ Non-standard
```

To be imported seamlessly, from your project or a dependency (mono-repo…).

---

The API provides strict default, while allowing opt-in flexibility, especially for Node usage.

## Configuration

### `transformationMode`

`CSSStyleSheet` (**default**) is agnostic, and platform native.  
Might not work with **SSR** until JS server runtimes support this API or a working minimal implementation.

`CSSResult` is Lit specific. On client, it can lazily provides a `CSSStyleSheet`.  
Works with **SSR**.

### `filter`

`(params: { id: string; importer?: string; ssr?: boolean }): boolean => myMatcher(filePath, myPatterns)`

Provides a callback for selective CSS files handling.  
From there, you can use your favorite glob paths matcher, like picomatch, minimatch…  
`ssr` is true when the import is from a server side context.

This hook is useful if you got some non-standards CSS imports you want to preserve, by migrating to the standard syntax, gradually.

### `ssrOnlyLit`

`boolean` (default: `false`)

Remove the need for the `?lit` query on server to get a usable asset.
By opting in, you'll get a `CSSStyleSheet` client side and a `CSSResult` server-side, automatically.  
All by using the same bare, query-less import (e.g. `./my-styles.css`).

### Import flags

#### `?lit`

This plugin is aiming to get rid of non-standard import queries.  
However you'll find yourself obliged to use a `CSSResult` in a Node setup.  
Until a leaner solution emerge, you can add the `?lit` flag on a per-file basis.  
This can be useful if you want to do **server-side** only stuff with some **client-side**
leafs deeper in the tree, whereas the `transformationMode` shown above is all or nothing.

For some reasons, like isomorphism, you might want a `CSSResult` on client-side, but it's not needed otherwise.
Lit handles those two shapes just fine, without intermediary steps.  
It's possible to mix and fit them in the static `styles` of your custom element.

### SSR considerations with `CSSStyleSheet`

If no DOM shims is present in your JS server runtime, you'll get a `CSSStyleSheet is not defined`.  
With a DOM Shim (like the Lit SSR's one), you'll get a `replaceSync method is not defined`, because the `CSSStyleSheet` global object is empty.  
Solution: use `CSSResult` here.

## Environments

- Vite 5
- Vite 5 **SSR** (`ssrModuleLoader`)
- Astro 4 **Client** side JS
- Astro 4 **Server** side JS

Tested with Node 20 (LTS) and 2024 major browsers.  
Firefox / Safari / Chromium are all supporting constructable stylesheets.

## TypeScript

### IDE awareness

```ts
// env.d.ts

declare module '*.css' {
	const stylesheet: CSSStyleSheet;
	export default stylesheet;
}

// Non-standard but required for SSR use
declare module '*.css?lit' {
	const stylesheet: import('lit').CSSResult;
	export default stylesheet;
}
```

## Demo

Checkout the [demo folder](https://github.com/JulianCataldo/vite-plugin-standard-css-modules).

You'll find an Astro minimal setup, which works **exactly the same** as with this
[vite-lit-ssr demo project](https://github.com/vikerman/vite-lit-ssr).

I updated to the latest Lit 3 and Vite 5, and with minor Lit SSR syntax adaption, tested it successfully.

Both of theses setups, Homebrewed Lit SSR and Astro, are using `ssrLoadModuleLoader`.  
Basically you'll get an isomorphic experience thanks to Vite internal tooling which is smoothening environment gaps, minus unresolved DOM limitations in Node.

### How it works?

`file.css` redirects to `file.css?raw` which by-pass all specific Vite handling.  
Then `file.css?inline` is requested and injected back. Meaning you should get your usual Vite CSS handling at the end (think all the `post-css` stuff).

---

Since the result is handled like any `?raw` imported module with Vite, it's not a "real", living CSS module.  
See the `rollup-plugin-css-modules` documentation for more details about expected limitations, which are shared conceptually, with `vite-plugin-standard-css-modules`.

## Footnotes

ESM, **dependency-free**.

You just need the optional `lit` peer-dependency, if you're using `CSSResult` over the default `CSSStyleSheet`.

---

See also [rollup-plugin-css-modules](https://www.npmjs.com/package/rollup-plugin-css-modules).  
Its documentation will bring you insights on the state of this API proposal.
