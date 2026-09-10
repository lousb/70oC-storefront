# 70oC — Studio

Sanity Studio for the 70oC ecommerce site. Customized to integrate with Shopify and provide visual editing for editorial content.

## Features

- **Product & Collection management** — edit and organize Shopify products with additional content (notes, ingredients, how-to-use, etc.)
- **Home** — 6 fixed sections (Pressure, Flow, Momentum, Repetition, Balance, Bloom)
- **Stories** — blog-style editorial content with a block builder (Media, Header, Question blocks)
- **Visual Editing** — real-time content preview
- **SEO tools** — metadata and social sharing previews
- **Type safety** — full TypeScript with automatic type generation

## Getting Started

### Prerequisites

- Node.js ≥20.19.1 (or ≥22.12)
- A Sanity account
- A Shopify store (for commerce integration)

### Environment

`studio/.env`:

```
SANITY_STUDIO_PROJECT_ID="..."
SANITY_STUDIO_DATASET="production"
SANITY_STUDIO_PREVIEW_URL="" # optional — defaults to http://localhost:3000
SANITY_STUDIO_STUDIO_HOST="" # optional
```

### Running the Studio

```bash
npm run dev
```

Or, from the repo root, just the studio:

```bash
npm run dev:studio
```

Visit [http://localhost:3333](http://localhost:3333).

## Structure

- `/src/schema-types` — content schemas defining the data structure (documents, objects, singletons)
- `/src/components` — custom input components and previews
- `/src/structure` — desk structure customization
- `sanity.config.ts` — plugin configuration

## Customization

### Content schema

1. Edit or add schema files under `/src/schema-types`
2. Register new types in `/src/schema-types/index.ts`
3. Restart the studio to see changes

### Desk structure

Customize how content is organized in the studio via `/src/structure`.

## Shopify Integration

The studio syncs products, collections, and variants from Shopify via the Sanity Connect app. Editorial content (notes, info blocks, page builder) is layered on top through the studio.

## Deployment

```bash
npx sanity deploy
```

Deploys to a `[projectId].sanity.studio` URL.

## Learn More

- [Sanity Documentation](https://www.sanity.io/docs)
- [Sanity Schema Types](https://www.sanity.io/docs/schema-types)
- [Sanity Studio Customization](https://www.sanity.io/docs/studio-customization)
