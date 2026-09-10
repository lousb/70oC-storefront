# 70oC

Headless ecommerce site for 70oC — a headless Shopify + Sanity + Next.js build. Shopify handles commerce (products, payments, shipping); Sanity handles editorial content (Home, Stories, product copy, site settings); Next.js renders the storefront.

## Features ✨

- **Next.js App Router** — statically generated pages for speed, SEO, and cost-efficiency
- **Sanity Studio** — visual editing with real-time preview for all content
- **Shopify integration** — leveraging Shopify's commerce infrastructure for products, payments, shipping, etc.
- **Page Builder** — editorial, collection, and product pages built from flexible content blocks
- **Real-time updates** — Sanity Live API and Shopify-Sanity sync with automatic fine-grained revalidation
- **Klaviyo integration** — email list management
- **TypeScript** throughout

## Getting Started 🛠️

### Prerequisites

- Node.js ≥20.19.1 (or ≥22.12) — the Sanity CLI requires this range
- A Shopify store
- A Sanity account/project

### Installation

1. Install dependencies from the repo root:
   ```
   npm install
   ```
2. Env files (already present locally, not committed): `studio/.env`, `storefront/.env.local`, root `.env`
3. Start the development environment:
   ```
   npm run dev
   ```

This starts Sanity Studio (http://localhost:3333) and the Next.js storefront (http://localhost:3000) together.

## Configuration 🔧

### Sanity

```
# studio/.env
SANITY_STUDIO_PROJECT_ID="..."
SANITY_STUDIO_DATASET="production"

# storefront/.env.local
NEXT_PUBLIC_SANITY_PROJECT_ID="..."
NEXT_PUBLIC_SANITY_DATASET="production"
NEXT_PUBLIC_SANITY_API_VERSION="yyyy-mm-dd"
SANITY_API_READ_TOKEN="..."
```

### Shopify

1. Install the [Sanity Connect app](https://apps.shopify.com/sanity-connect) on the Shopify store, pointed at the Sanity project above
2. Create/use a custom app in Shopify Admin (Apps → Develop apps) with Storefront API access
3. Add to `storefront/.env.local`:

```
SHOPIFY_STOREFRONT_ACCESS_TOKEN="..."
SHOPIFY_STORE_ID="..."
SHOPIFY_STORE_DOMAIN="....myshopify.com"
NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN="....myshopify.com"
```

### Klaviyo (optional)

```
KLAVIYO_PRIVATE_API_KEY="..."
```

## Architecture 🏗️

- `/studio` — Sanity Studio configuration and schemas
- `/storefront` — Next.js frontend application
  - `/app` — routes and page components
  - `/components` — reusable UI components
  - `/sanity` — Sanity client and queries
  - `/shopify` — Shopify integration logic

### Data flow

1. **Products & Collections** — managed in Shopify, synced to Sanity via Sanity Connect
2. **Editorial content** — managed in Sanity Studio (Home sections, Stories, product notes/info blocks, site settings)
3. **Cart & Checkout** — handled by the Shopify Storefront API
4. **Frontend** — Next.js reads from Sanity's API (which includes the synced Shopify data)

## Customization 🎨

Styling uses CSS Modules — edit component-specific `.module.css` files or global styles in `storefront/styles/globals.css`. The content schema lives in `/studio/src/schema-types`.

## Deployment 🚀

### Sanity Studio

```
cd studio
npx sanity deploy
```

### Next.js Storefront

```
cd storefront
vercel --prod
```

(or deploy to any other Next.js-compatible host)

---

Built on the open-source [Sanity Photon](https://github.com/soufDev/sanity-photon) starter by Soufiane El Jazouli, customized for 70oC.
