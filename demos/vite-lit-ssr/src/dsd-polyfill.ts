// Polyfill Declarative Shadow DOM if it's not supported in the browser (currently non-Chromium).

export function supportsDeclarativeShadowDOM() {
  return HTMLTemplateElement.prototype.hasOwnProperty("shadowRoot");
}

if (!supportsDeclarativeShadowDOM()) {
  (function attachShadowRoots(root: Document) {
    root.querySelectorAll("template[shadowroot]").forEach((el) => {
      const template = el as HTMLTemplateElement;
      const mode = (template.getAttribute("shadowroot") ||
        "open") as ShadowRootMode;
      const shadowRoot = (template!.parentNode as HTMLElement).attachShadow({
        mode,
      });
      shadowRoot.appendChild(template.content);
      template.remove();
      attachShadowRoots(shadowRoot as any);
    });
  })(document);
}
