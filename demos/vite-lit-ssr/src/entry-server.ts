import { render as r } from '@lit-labs/ssr/lib/render-with-global-dom-shim.js';
import { html } from 'lit';
import { Readable } from 'node:stream';

import './my-element.js';

const template = html`<my-element count="10"><h1>Vite + Lit</h1></my-element>`;

export function render(): Readable {
	return Readable.from(r(template));
}
