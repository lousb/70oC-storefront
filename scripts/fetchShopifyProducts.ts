import sanityClient from '@sanity/client';
import dotenv from 'dotenv';

dotenv.config();

// Sanity client
const client = sanityClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  token: process.env.SANITY_API_TOKEN!, // must have write access
  useCdn: false,
});

// Shopify env
const SHOPIFY_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN!;
const STOREFRONT_TOKEN = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN!;

const PRODUCTS_QUERY = `
{
  products(first: 50) {
    edges {
      node {
        id
        title
        handle
        images(first: 1) { edges { node { src } } }
        variants(first: 1) { edges { node { price } } }
      }
    }
  }
}
`;

async function fetchProducts() {
  const res = await fetch(`https://${SHOPIFY_DOMAIN}/api/2026-01/graphql.json`, {
    method: 'POST',
    headers: {
      'X-Shopify-Storefront-Access-Token': STOREFRONT_TOKEN,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: PRODUCTS_QUERY }),
  });

  // Tell TypeScript what shape to expect
  const json = (await res.json()) as {
    data: {
      products: {
        edges: {
          node: {
            id: string;
            title: string;
            handle: string;
            images: { edges: { node: { src: string } }[] };
            variants: { edges: { node: { price: string } }[] };
          };
        }[];
      };
    };
  };

  return json.data.products.edges.map(e => e.node);
}

async function syncToSanity() {
  const products = await fetchProducts();

  for (const p of products) {
    await client.createOrReplace({
      _id: `shopifyProduct-${p.id}`,
      _type: 'shopifyProduct',
      title: p.title,
      handle: p.handle,
      shopifyId: p.id,
      price: parseFloat(p.variants.edges[0].node.price),
      url: `https://${SHOPIFY_DOMAIN}/products/${p.handle}`,
    });
  }

  console.log('Shopify products synced to Sanity!');
}

syncToSanity().catch(console.error);