import { render as r } from '@lit-labs/ssr';
import { Readable } from 'node:stream';

import './my-element.js';
import { template } from './page-template.js';

export function render(url: string, context: unknown): Readable {
	console.log({ url, context });
	return Readable.from(r(template));
}

console.log('Hello server');
