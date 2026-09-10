import { defineQuery } from "next-sanity";

const pageSeoFields = /* groq */ `
  _type,
  "title": coalesce(title, ^.name),
  description,
  ogImage
`;

const pageBuilderFields = /* groq */ `
  _key,
  _type,
  "cover": cover[] {
    _type,
    "picture": select(_type == "picture" => {
      asset,
      crop,
      hotspot,
      alt,
    }),
    "color": select(_type == "color" => hex)
  },
  content,
  "textColor": coalesce(textColor.hex, 'black'),
  "columns": columns[] {
    _key,
    _type,
    "columnSpan": select(_type == "imageBlock" => coalesce(columnSpan, 1), 1),
    // productBlock
    "product": select(_type == "productBlock" => product-> {
      "title": store.title,
      "slug": store.slug.current,
      "price": store.priceRange.minVariantPrice,
      "imageUrl": store.previewImageUrl,
      "hoverMedia": gallery[featuredHover == true][0].media {
        mediaType,
        "imageUrl": select(mediaType == "image" => image.asset->url),
        "playbackId": select(mediaType == "video" => video.asset->playbackId),
      },
    }),
    // imageBlock
   "items": select(_type == "imageBlock" => items[] {
      mediaType,
      "image": select(mediaType == "image" => {
        "_type": "image",
        "asset": image.asset,
        "crop": image.crop,
        "hotspot": image.hotspot,
        "alt": image.alt,
      }),
      "video": select(mediaType == "video" => {
        "playbackId": video.asset->playbackId,
        "aspectRatio": video.asset->data.aspect_ratio,
      }),
    }),
    "title": select(_type == "imageBlock" => title),
    "description": select(_type == "imageBlock" => description),
  }
`;

const linkFields = /* groq */ `
  _type,
  _key,
  linkType,
  "url": select(
    linkType == 'href' => href,
    linkType == 'home' => '/',
    linkType == 'plp' => '/products',
    linkType == 'page' => '/' + page->slug.current,
    linkType == 'product' => '/products/' + product->store.slug.current,
    linkType == 'collection' => '/collections/' + collection->store.slug.current,
  ),
  "label": select(
      label.length > 0 => label,
      linkType == 'home' => 'Home',
      linkType == 'plp' => 'All Products',
      linkType == 'page' => page->name,
      linkType == 'product' => product->store.title,
      linkType == 'collection' => collection->store.title,
      "Link"
    ),
  openInNewTab
`;

export type LinkFieldsType = {
  _type: "link";
  _key: string;
  linkType: "collection" | "home" | "href" | "page" | "plp" | "product";
  url: string | "/" | "/colections/all" | null;
  label: string | "All Products" | "Home" | "Link" | null;
  openInNewTab: boolean;
};

const homeSectionFields = /* groq */ `
  sectionName,
  "image1": image1{asset, crop, hotspot, alt},
  "image2": image2{asset, crop, hotspot, alt},
  "image3": image3{asset, crop, hotspot, alt},
  sectionIntro,
  sectionDescription,
  "link": link{${linkFields}}
`;

export const SETTINGS_QUERY = defineQuery(`
  *[_type == "settings"][0]{
    _type,
    _id,
    _updatedAt,
    _createdAt,
    "title": coalesce(title, "Untitled Store"),
    metadataBase,
    defaultProductInformation,
    header{
      _type,
      headerDescription,
      announcementBar{
        _type,
        content,
        "link": links[0]{${linkFields}}
      },
      "links": links[]{${linkFields}}
    },
    footer{
      _type,
      "shopLinks": shopLinks[]{${linkFields}},
      infoLinks{
        "stockists": stockists{${linkFields}},
        "shippingAndReturns": shippingAndReturns{${linkFields}},
        "termsAndConditions": termsAndConditions{${linkFields}},
        "privacyPolicy": privacyPolicy{${linkFields}},
      },
      "connectLinks": connectLinks[]{${linkFields}},
    },
  }`);

export const HOME_QUERY = defineQuery(`
  *[_type == 'home' ][0]{
    _type,
    _id,
    _updatedAt,
    _createdAt,
    "status": select(_id in path("drafts.**") => "draft", "published"),
    "name": "Home",
    "slug": "/",
    "pressure": pressure{${homeSectionFields}},
    "flow": flow{${homeSectionFields}},
    "momentum": momentum{${homeSectionFields}},
    "repetition": repetition{${homeSectionFields}},
    "balance": balance{${homeSectionFields}},
    "bloom": bloom{${homeSectionFields}},
    pageSeo{${pageSeoFields}}
  }
`);

export const SHOP_QUERY = defineQuery(`
  *[_type == 'shop'][0]{
    _type,
    _id,
    _updatedAt,
    _createdAt,
    "status": select(_id in path("drafts.**") => "draft", "published"),
    "name": "Shop",
    "slug": "/products",
    "pageBuilder": pageBuilder[]{
      ${pageBuilderFields}
    },
    pageSeo{${pageSeoFields}}
  }
`);

export const PAGE_QUERY = defineQuery(`
  *[_type == 'page' && slug.current == $slug][0]{
    _type,
    _id,
    _updatedAt,
    _createdAt,
    "status": select(_id in path("drafts.**") => "draft", "published"),
    "name": coalesce(name, "Untitled Page"),
    "slug": slug.current,
    "pageBuilder": pageBuilder[]{
      ${pageBuilderFields}
    },
    pageSeo{${pageSeoFields}}
  }
`);

export const COLLECTION_QUERY = defineQuery(`
  *[_type == 'collection' && store.slug.current == $slug][0]{
    _type,
    _id,
    _updatedAt,
    _createdAt,
    "status": select(_id in path("drafts.**") => "draft", "published"),
    "name": coalesce(name, "Untitled Collection"),
    "slug": slug.current,
    store,
    "editorial": {
      "_type":'page',
      _id,
      _updatedAt,
      _createdAt,
      "status": select(_id in path("drafts.**") => "draft", "published"),
      "name": coalesce(name, "Untitled Page"),
      "slug": store.slug.current,
      pageBuilder[]{
        ${pageBuilderFields}
      },
    },
    pageSeo{${pageSeoFields}}
  }
`);

export const ALL_COLLECTIONS_QUERY = defineQuery(`
  *[_type == "collection" && defined(store.slug.current) && !store.isDeleted] | order(date desc, _updatedAt desc) {
    ...,
  }
`);

export const ALL_PRODUCTS_QUERY = defineQuery(`
  *[_type == "product" && defined(store.slug.current)] | order(date desc, _updatedAt desc) {
    ...,
  }
`);

export const MORE_PRODUCTS_QUERY = defineQuery(`
  *[_type == "product" && _id != $skip && defined(store.slug.current)] | order(date desc, _updatedAt desc) [0...$limit] {
    ...,
  }
`);

export const PRODUCT_QUERY = defineQuery(`
  *[_type == "product" && store.slug.current == $slug] [0] {
    _type,
    _id,
    _updatedAt,
    _createdAt,
    overwriteDefaultInformationFields,
    "defaultProductInformation": *[ _type == 'settings'][0].defaultProductInformation,
    productInformation,
    category,
    topNotes,
    middleNotes,
    baseNotes,
    ingredients,
    "howToUse": howToUse->{title, content},
    "shipping": shipping->{title, content},
    "whereWeLive": whereWeLive->{title, content},
    "status": select(_id in path("drafts.**") => "draft", "published"),
    "name": coalesce(name, "Untitled Page"),
    "slug": store.slug.current,
   "gallery": gallery[] {
      "mediaType": media.mediaType,
      "image": select(media.mediaType == "image" => {
        "_type": "image",
        "asset": media.image.asset,
        "crop": media.image.crop,
        "hotspot": media.image.hotspot,
        "alt": media.image.alt,
      }),
      "video": select(media.mediaType == "video" => {
        "playbackId": media.video.asset->playbackId,
        "aspectRatio": media.video.asset->data.aspect_ratio,
      }),
      "featuredHover": featuredHover,
    },
    pageBuilder[]{
      ${pageBuilderFields}
    },
    pageSeo{${pageSeoFields}}
  }
`);

export const PRODUCT_METADATA_QUERY = defineQuery(`
  *[_type == "product" && store.slug.current == $slug] [0] {
    _type,
    _id,
    store
  }
`);

export const ALL_PRODUCT_PAGES_SLUGS = defineQuery(`
  *[_type == "product" && defined(store.slug.current)]
  {"slug": store.slug.current}
`);

export const ALL_COLLECTION_PAGES_SLUGS = defineQuery(`
  *[_type == "collection" && defined(store.slug.current)]
  {"slug": store.slug.current}
`);

export const ALL_PAGES_SLUGS = defineQuery(`
  *[_type == "page" && defined(slug.current)]
  {"slug": slug.current}
`);

const storyPageBuilderFields = /* groq */ `
  _key,
  _type,
  // storyMediaBlock
  "media": select(_type == "storyMediaBlock" => {
    "mediaType": media.mediaType,
    "image": select(media.mediaType == "image" => {
      "_type": "image",
      "asset": media.image.asset,
      "crop": media.image.crop,
      "hotspot": media.image.hotspot,
      "alt": media.image.alt,
    }),
    "video": select(media.mediaType == "video" => {
      "playbackId": media.video.asset->playbackId,
      "aspectRatio": media.video.asset->data.aspect_ratio,
    }),
  }),
  "layout": select(_type == "storyMediaBlock" => layout),
  "width": select(_type == "storyMediaBlock" => width),
  "caption": select(_type == "storyMediaBlock" => caption),
  "secondMedia": select(_type == "storyMediaBlock" => {
    "mediaType": secondMedia.mediaType,
    "image": select(secondMedia.mediaType == "image" => {
      "_type": "image",
      "asset": secondMedia.image.asset,
      "crop": secondMedia.image.crop,
      "hotspot": secondMedia.image.hotspot,
      "alt": secondMedia.image.alt,
    }),
    "video": select(secondMedia.mediaType == "video" => {
      "playbackId": secondMedia.video.asset->playbackId,
      "aspectRatio": secondMedia.video.asset->data.aspect_ratio,
    }),
  }),
  // storyHeaderBlock
  "text": select(_type == "storyHeaderBlock" => text),
  // storyQuestionBlock
  "question": select(_type == "storyQuestionBlock" => question),
  "answerer": select(_type == "storyQuestionBlock" => answerer),
  "answer": select(_type == "storyQuestionBlock" => answer),
`;

export const ARCHIVE_QUERY = defineQuery(`
  *[_type == "archive"][0]{
    _type,
    _id,
    title,
    description,
    pageSeo{${pageSeoFields}}
  }
`);

export const ALL_POSTS_QUERY = defineQuery(`
  *[_type == "post"] | order(date desc){
    _id,
    title,
    "slug": slug.current,
    authors,
    date,
    readDuration,
    category,
    excerpt,
    "cover": {
      "mediaType": cover.mediaType,
      "image": select(cover.mediaType == "image" => {
        "_type": "image",
        "asset": cover.image.asset,
        "crop": cover.image.crop,
        "hotspot": cover.image.hotspot,
        "alt": cover.image.alt,
      }),
      "video": select(cover.mediaType == "video" => {
        "playbackId": cover.video.asset->playbackId,
        "aspectRatio": cover.video.asset->data.aspect_ratio,
      }),
    },
  }
`);

export const POST_QUERY = defineQuery(`
  *[_type == "post" && slug.current == $slug][0]{
    _type,
    _id,
    title,
    "slug": slug.current,
    authors,
    date,
    readDuration,
    category,
    excerpt,
    "cover": {
      "mediaType": cover.mediaType,
      "image": select(cover.mediaType == "image" => {
        "_type": "image",
        "asset": cover.image.asset,
        "crop": cover.image.crop,
        "hotspot": cover.image.hotspot,
        "alt": cover.image.alt,
      }),
      "video": select(cover.mediaType == "video" => {
        "playbackId": cover.video.asset->playbackId,
        "aspectRatio": cover.video.asset->data.aspect_ratio,
      }),
    },
    "pageBuilder": pageBuilder[]{
      ${storyPageBuilderFields}
    },
    pageSeo{${pageSeoFields}}
  }
`);

export const ALL_POST_SLUGS = defineQuery(`
  *[_type == "post" && defined(slug.current)]
  {"slug": slug.current}
`);
