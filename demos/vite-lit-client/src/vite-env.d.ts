/// <reference types="vite/client" />

declare module '*.css' {
	const stylesheet: CSSStyleSheet;
	export default stylesheet;
}

declare module '*.css?lit' {
	const stylesheet: import('lit').CSSResult;
	export default stylesheet;
}
