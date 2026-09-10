# 70oC — Storefront

Next.js storefront for the 70oC ecommerce site. Built with the App Router, connecting to Sanity Studio for content and Shopify for commerce.

## Features

- **App Router architecture** — modern routing with built-in layouts
- **Static generation** — fast load times and SEO benefits
- **Dynamic cart** — client-side cart using Shopify's Storefront API
- **Visual Editing** — Sanity Visual Editing support for content previews
- **Type safety** — full TypeScript implementation
- **Responsive design** — mobile-first, CSS Modules

## Getting Started

### Prerequisites

- Node.js ≥20.19.1 (or ≥22.12)
- A Sanity account and project
- A Shopify store with Storefront API access
- (Optional) Klaviyo account for email list management

### Environment

`storefront/.env.local`:

```
NEXT_PUBLIC_SANITY_PROJECT_ID="..."
NEXT_PUBLIC_SANITY_DATASET="production"
NEXT_PUBLIC_SANITY_API_VERSION="yyyy-mm-dd"
NEXT_PUBLIC_SANITY_STUDIO_URL="" # optional, defaults to http://localhost:3333

SANITY_API_READ_TOKEN="..."

SHOPIFY_STOREFRONT_ACCESS_TOKEN="..."
SHOPIFY_STORE_ID="..."
SHOPIFY_STORE_DOMAIN="....myshopify.com"
NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN="....myshopify.com"

KLAVIYO_PRIVATE_API_KEY="..." # optional
```

### Running the Development Server

```bash
npm run dev
```

Or, from the repo root, just the storefront:

```bash
npm run dev:storefront
```

Visit [http://localhost:3000](http://localhost:3000).

## Structure

- `/app` — App Router routes and page components
  - `/[slug]` — dynamic editorial pages
  - `/collections` — collection listing and detail pages
  - `/products` — product detail pages
  - `/archive` — Stories listing and detail pages
  - `/studio` — embedded Sanity Studio
  - `/_cart` — client-side cart components
- `/components` — reusable UI components
- `/sanity` — Sanity client, queries, and types
- `/shopify` — Shopify client and types
- `/styles` — global styles and CSS modules
- `/utils` — helper functions

## Customization

### Styling

CSS Modules for component styling; global styles in `/styles/globals.css`.

### Adding New Routes

1. Create a new directory in `/app`
2. Add a `page.tsx` for the route content
3. Optionally add a `layout.tsx` for route-specific layouts

## Building for Production

```bash
npm run build
```

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Sanity Documentation](https://www.sanity.io/docs)
- [Shopify Storefront API Docs](https://shopify.dev/docs/api/storefront)
