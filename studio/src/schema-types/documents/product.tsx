import pluralize from "pluralize-esm";
import { defineField, defineType } from "sanity";
import { ShopifyIcon } from "../../components/shopify-icon";
import { ShopifyDocumentStatus } from "../../components/shopify/shopify-document-status";
import { HOME_CATEGORIES } from "../../constants";
import { getPriceRange } from "../../utils/get-price-range";

const GROUPS = [
  {
    default: true,
    name: "editorial",
    title: "Editorial",
  },
  {
    name: "shopifySync",
    title: "Shopify sync",
    icon: ShopifyIcon,
  },
];

export const product = defineType({
  name: "product",
  title: "Product",
  type: "document",
  groups: GROUPS,
  fields: [
    defineField({
      name: "titleProxy",
      title: "Title",
      type: "proxyString",
      options: { field: "store.title" },
    }),
    defineField({
      name: "slugProxy",
      title: "Slug",
      type: "proxyString",
      options: { field: "store.slug.current" },
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "string",
      group: "editorial",
      description: "Which of the 6 Home sections this product belongs to.",
      options: {
        list: HOME_CATEGORIES,
        layout: "dropdown",
      },
    }),
    defineField({
      name: "relatedProducts",
      title: "Related Products",
      description:
        "Up to 3 related products. Each shows as its category icon (at 25% opacity) next to this product's own icon under Add To Cart, linking to that product. A product with no Category set won't show an icon.",
      type: "array",
      of: [
        {
          type: "reference",
          to: [{ type: "product" }],
          options: {
            // Can't relate a product to itself.
            filter: ({ document }) => ({
              filter: "!(_id in [$id, $draftId])",
              params: {
                id: (document?._id ?? "").replace(/^drafts\./, ""),
                draftId: `drafts.${(document?._id ?? "").replace(/^drafts\./, "")}`,
              },
            }),
          },
        },
      ],
      validation: (Rule) => Rule.max(3).unique(),
      group: "editorial",
    }),
    defineField({
      name: "description",
      title: "Description",
      description: "Optional editorial description. Overrides the Shopify description on the storefront when set.",
      type: "text",
      rows: 4,
      group: "editorial",
    }),
    defineField({
      name: "ingredients",
      title: "Ingredients",
      type: "text",
      rows: 4,
      group: "editorial",
    }),
    defineField({
      name: "howToUse",
      title: "How To Use",
      type: "reference",
      to: [{ type: "productInfoBlock" }],
      group: "editorial",
    }),
    defineField({
      name: "shipping",
      title: "Shipping",
      type: "reference",
      to: [{ type: "productInfoBlock" }],
      group: "editorial",
    }),
    defineField({
      name: "whereWeLive",
      title: "Where We Live",
      type: "reference",
      to: [{ type: "productInfoBlock" }],
      group: "editorial",
    }),
    defineField({
      name: "overwriteDefaultInformationFields",
      type: "string",
      group: "editorial",
      description:
        "Which information should be displayed?\n If set to 'No Defaults', only the fields set bellow will show up on the store.\n If set to 'Complement Defaults', the default information fields will also show.",
      options: {
        list: [
          { title: "No defaults", value: "noDefaults" },
          { title: "Complement Defaults", value: "complementDefaults" },
        ],
      },
    }),
    defineField({
      name: "productInformation",
      type: "array",
      of: [{ type: "productInformation" }],
      group: "editorial",
    }),
    defineField({
      name: "gallery",
      title: "Gallery",
      description:
        "This product's media. The Shopify image is not used on the storefront — the first item here is what's shown on product listings (Home, Shop, Collections) and is the main image on the product page. Toggle \"Use as hover image on product cards\" on at most one other item for the hover/alternate view on listings.",
      type: "array",
      of: [
        {
          type: "object",
          name: "galleryItem",
          fields: [
            defineField({
              name: "media",
              type: "media",
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "featuredHover",
              title: "Use as hover image on product cards",
              type: "boolean",
              initialValue: false,
            }),
          ],
          preview: {
            select: {
              mediaType: "media.mediaType",
              image: "media.image",
              featuredHover: "featuredHover",
            },
            prepare({ mediaType, image, featuredHover }) {
              return {
                title: featuredHover ? "⭐ Hover" : mediaType === "video" ? "Video" : "Image",
                media: image,
              };
            },
          },
        },
      ],
      validation: (Rule) =>
        Rule.custom((gallery: any[] | undefined) => {
          if (!gallery) return true;
          const featured = gallery.filter((item) => item.featuredHover);
          if (featured.length > 1) return "Only one item can be set as the hover image.";
          return true;
        }),
      group: "editorial",
    }),
    defineField({
      name: "store",
      title: "Shopify",
      type: "shopifyProduct",
      description: "Product data from Shopify (read-only)",
      group: "shopifySync",
    }),
  ],
  preview: {
    select: {
      isDeleted: "store.isDeleted",
      options: "store.options",
      previewImageUrl: "store.previewImageUrl",
      priceRange: "store.priceRange",
      status: "store.status",
      title: "store.title",
      variants: "store.variants",
    },
    prepare(selection) {
      const {
        isDeleted,
        options,
        previewImageUrl,
        priceRange,
        status,
        title,
        variants,
      } = selection;

      const optionCount = options?.length;
      const variantCount = variants?.length;

      const description = [
        variantCount ? pluralize("variant", variantCount, true) : "No variants",
        optionCount ? pluralize("option", optionCount, true) : "No options",
      ];

      let subtitle = getPriceRange(priceRange);
      if (status !== "active") {
        subtitle = "(Unavailable in Shopify)";
      }
      if (isDeleted) {
        subtitle = "(Deleted from Shopify)";
      }

      return {
        description: description.join(" / "),
        subtitle,
        title,
        media: (
          <ShopifyDocumentStatus
            isActive={status === "active"}
            isDeleted={isDeleted}
            type="product"
            url={previewImageUrl}
            title={title}
          />
        ),
      };
    },
  },
});
