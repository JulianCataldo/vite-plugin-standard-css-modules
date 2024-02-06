import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import litLogo from './assets/lit.svg';
import './my-child.js';

import myElementStyles from './my-element.css' with { type: 'css' };

/**
 * An example element.
 *
 * @slot - This element has a slot
 * @csspart button - The button
 */
@customElement('my-element')
export class MyElement extends LitElement {
	/**
	 * Copy for the read the docs hint.
	 */
	@property()
	docsHint = 'Click on the Vite and Lit logos to learn more';

	/**
	 * The number of times the button has been clicked.
	 */
	@property({ type: Number })
	count = 0;

	render() {
		return html`
			<div>
				<a href="https://vitejs.dev" target="_blank">
					<img src="/vite.svg" class="logo" alt="Vite logo" />
				</a>
				<a href="https://lit.dev" target="_blank">
					<img src=${litLogo} class="logo lit" alt="Lit logo" />
				</a>
			</div>
			<slot></slot>
			<div class="card">
				<button @click=${this._onClick} part="button">
					count is ${this.count}
				</button>
			</div>
			<p class="read-the-docs">${this.docsHint}</p>
			<my-child name="World!"></my-child>
		`;
	}

	private _onClick() {
		this.count++;
	}

	static styles = [myElementStyles];
}

declare global {
	interface HTMLElementTagNameMap {
		'my-element': MyElement;
	}
}
