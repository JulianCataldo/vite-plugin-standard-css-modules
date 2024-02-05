# Vite Lit SSR Example

> [!NOTE]  
> [This was](https://github.com/vikerman/vite-lit-ssr) upgraded and slightly adapted for Vite 5 and Lit 3

Minimal example of Lit SSR on top of Vite. Just meant for illustrative and experimentative purposes.

## Running

Install the packages:

```
npm i
```

To run in dev mode:

```
npm run dev
```

To build and run in prod mode:

```
npm run build:client
npm run build:server
npm run serve
```

## Try it in StackBlitz!

If you don't want any of this hassle just try it on StackBlitz at https://stackblitz.com/github/vikerman/vite-lit-ssr.

## How it works

Vite provides a low level [SSR API](https://vitejs.dev/guide/ssr.html) that can be hooked to the [Lit SSR APIs](https://github.com/lit/lit/blob/main/packages/labs/ssr/README.md) to render the initial state of the app on the server. Lit SSR produces Declarative Shadow DOM(DSD) that can be displayed on browsers that support it (currently Chrome and Edge) without needign any JS.

On browsers that don't support DSD (Firefox, Safari), the first thing the client JS bundle does is to load a polyfill that converts the DSD templates to actual shadow root. The full detail of this polyfill can be found at https://web.dev/declarative-shadow-dom/#polyfill. In addition the example has manually added CSS to avoid Flash of Unstyled Content(FOUC) on browsers that don't support DSD. Details at https://web.dev/declarative-shadow-dom/#fouc.

## What's cool about it?

Web Components already provide a portable way to write UI building blocks that are natively supported in the browsers (almost all of them) and can be used inside a variety of contexts (different frameworks, CMS etc.). With the introduction of DSD API it is now possible to use server side render Web components and load them in the browser (that support it) without any JS (something that has always been considered a weakness for Web components).

All this is built on top of Vite which is where most people seem to be these days. Vite provides a fast development experience and a standard way to build production versions of frontend apps. See ["Why Vite?"](https://vitejs.dev/guide/why.html) for more details. The hope is that these ideas can reach more people when done on (meta)frameworks where people already are.

## What's next?

Currently the loading of the client JS is one shot and hydrates the whole DOM tree. The example client bundle is currently only ~25 KiB unzipped with components and Lit framework with SSR support (and ~8.77 KiB gzipped). But an application in real life can keep growing to a point where it can be very bad for performance to do it in one shot. It would be a separate exercise to progressively hydrate it - though Web components do make it easier to do such things, given its clearly defined encapsulation and interfaces.

HMR with SSR currently reloads the whole page. Can we reload just the component code? It can pick up where the older components left off (It should all be serializable in the DOM anyway).

It would also be cool to support different frameworks other than Lit that output web components - Stencil, Angular, Vue, Svelte etc.

## Can I use this?

No. Don't. Look at [Rocket](https://rocket.modern-web.dev/) instead.
