import { collection } from "./documents/collection";
import { page } from "./documents/page";
import { post } from "./documents/post";
import { product } from "./documents/product";
import { productInfoBlock } from "./documents/product-info-block";
import { productVariant } from "./documents/product-variant";

import { blockContent } from "./objects/editorial/block-content";
import { contentRow } from "./objects/editorial/content-row";
import { editorialBlock } from "./objects/editorial/editorial-block";
import { imageBlock } from "./objects/editorial/image-block";
import { media } from "./objects/editorial/media";
import { newsletter } from "./objects/editorial/newsletter";
import { picture } from "./objects/editorial/picture";
import { productBlock } from "./objects/editorial/product-block";
import { productInformation } from "./objects/editorial/product-information";
import { storyHeaderBlock } from "./objects/editorial/story-header-block";
import { storyMediaBlock } from "./objects/editorial/story-media-block";
import { storyQuestionBlock } from "./objects/editorial/story-question-block";

import { announcementBar } from "./objects/global/announcement-bar";
import { footer } from "./objects/global/footer";
import { header } from "./objects/global/header";
import { link } from "./objects/global/link";
import { pageSeo } from "./objects/global/page-seo";

import { homeSection } from "./objects/home/home-section";

import { inventory } from "./objects/shopify/inventory";
import { option } from "./objects/shopify/option";
import { placeholderString } from "./objects/shopify/placeholder-string";
import { priceRange } from "./objects/shopify/price-range";
import { productWithVariant } from "./objects/shopify/product-with-variant";
import { proxyString } from "./objects/shopify/proxy-string";
import { shopifyCollection } from "./objects/shopify/shopify-collection";
import { shopifyCollectionRule } from "./objects/shopify/shopify-collection-rule";
import { shopifyProduct } from "./objects/shopify/shopify-product";
import { shopifyProductVariant } from "./objects/shopify/shopify-product-variant";

import { archive } from "./singletons/archive";
import { home } from "./singletons/home";
import { settings } from "./singletons/settings";
import { shop } from "./singletons/shop";

export const schemaTypes = [
  // Singletons
  settings,
  home,
  shop,
  archive,
  // Documents
  collection,
  page,
  post,
  product,
  productInfoBlock,
  productVariant,
  // Objects — Editorial
  blockContent,
  contentRow,
  editorialBlock,
  imageBlock,
  media,
  newsletter,
  picture,
  productBlock,
  productInformation,
  storyHeaderBlock,
  storyMediaBlock,
  storyQuestionBlock,
  // Objects — Global
  announcementBar,
  footer,
  header,
  link,
  pageSeo,
  // Objects — Home
  homeSection,
  // Objects — Shopify
  inventory,
  option,
  placeholderString,
  priceRange,
  productWithVariant,
  proxyString,
  shopifyCollection,
  shopifyCollectionRule,
  shopifyProduct,
  shopifyProductVariant,
];
