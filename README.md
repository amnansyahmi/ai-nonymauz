# AI-Nonymauz

A product landing page for Nonymauz People, KretivOS, PowerOS, Restu.ai, FlowTrack, AI-Nonymauz Cloud, and SecureIntelligence.

## Run locally

Use Node.js 22 or later. No package installation or environment variables are required.

```sh
npm run dev
```

Open http://localhost:4173. Set `PORT` to change the local port.

```sh
npm run check
npm run build
npm start
```

The build copies the static site into `dist/`. Vercel automatically reads the build command and output directory from `vercel.json`. Other static hosts can serve `dist/` directly.

## Features

- Responsive product catalogue with Work & business, Everyday life, and AI & development filters.
- Interactive People, KretivOS, and FlowTrack UI previews with fictional sample records.
- Product detail dialogs, verified app/repository destinations, and shareable `?system=people` links.
- Accessible mobile navigation, FAQ disclosures, and reduced-motion support.
- Browser-local project brief generation and Markdown download; no form submission or data storage.
- Local SVG artwork and a self-hosted Archivo variable font with its license in `assets/`.

Edit public product descriptions, capabilities, and URLs in `products.js`. Layout and design tokens live in `styles.css`. See [design decisions](docs/DESIGN.md) and [verification](docs/VERIFICATION.md).

This landing page does not connect product accounts or expose backend APIs. AI features, installation, and availability depend on each individual system’s configuration.
