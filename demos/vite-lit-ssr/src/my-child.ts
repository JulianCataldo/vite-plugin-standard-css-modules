import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import myElementStyles from './my-element.css' with { type: 'css' };

console.log({ fromChild: myElementStyles });

@customElement('my-child')
export class MyChild extends LitElement {
	@property({ type: String })
	name: string = '';

	private _click() {
		this.name += '!';
	}

	render() {
		return html`<button @click=${this._click}>Hello ${this.name}</button>`;
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'my-child': MyChild;
	}
}
