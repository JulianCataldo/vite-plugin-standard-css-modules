// NOTE: Overriding module declaration doesn't seems to work, contrary to Vite.
// So we disable this for demo purpose, until a solution is found.
//// <reference types="astro/client" />

declare module "*.css" {
	const stylesheet: CSSStyleSheet;
	export default stylesheet;
}

declare module "*.css?lit" {
	const stylesheet: import("lit").CSSResult;
	export default stylesheet;
}
