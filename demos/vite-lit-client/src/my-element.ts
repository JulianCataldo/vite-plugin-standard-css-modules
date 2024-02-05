import { LitElement, css, html, unsafeCSS } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import myStyles from './my-styles.css' with { type: 'css' };

console.log({ myStyles });

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
			<slot></slot>
			<div class="card">
				<button @click=${this._onClick} part="button">
					count is ${this.count}
				</button>
			</div>

			<h1>Hey</h1>

			<pre>${myStyles}</pre>
		`;
	}

	private _onClick() {
		this.count++;
	}

	static styles = [
		myStyles,

		css`
			:host {
				display: block;
			}
		`,
	];
}

declare global {
	interface HTMLElementTagNameMap {
		'my-element': MyElement;
	}
}
