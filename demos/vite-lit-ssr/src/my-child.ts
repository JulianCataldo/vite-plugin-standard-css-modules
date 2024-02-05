import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

// import myStyles from './my-styles.css' with { type: 'css' };

@customElement('my-child')
export class MyChild extends LitElement {
	// static styles = [myStyles];

	@property({ type: String })
	name: string = '';

	private _click() {
		this.name += '!';
	}

	render() {
		return html`<button class="my-button" @click=${this._click}>
			Hello ${this.name}
		</button>`;
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'my-child': MyChild;
	}
}
