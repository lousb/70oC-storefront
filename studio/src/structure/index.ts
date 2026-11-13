import {
  AsteriskIcon,
  CommentIcon,
  DocumentTextIcon,
  EditIcon,
} from "@sanity/icons";

import type { StructureResolver } from "sanity/structure";
import { singletonListItem, SINGLETONS } from "./singletons";

/**
 * Structure builder is useful whenever you want to control how documents are grouped and
 * listed in the studio or for adding additional in-studio previews or content to documents.
 * Learn more: https://www.sanity.io/docs/structure-builder-introduction
 *
 * Note: "productInfoBlock" is intentionally NOT listed here. It stays fully
 * usable — Products reference it via How To Use / Shipping / Where We Live,
 * and those reference fields can create new ones inline — it's just kept out
 * of the sidebar so it doesn't compete with Products as a place to manage content.
 *
 * Also hidden from the sidebar (not deleted - the documents and schemas are
 * untouched, so anything referencing them keeps working): the Shop and Archive
 * singletons, and Collections.
 *
 * Products lists everything synced from Shopify, including Shopify drafts
 * (they stay editable here, and are hidden on the storefront by the queries in
 * storefront/data/sanity/queries.ts). Products deleted in Shopify are left out.
 */

export const structure: StructureResolver = (S, _) =>
  S.list()
    .title("Storefront Content")
    .items([
      singletonListItem(S, SINGLETONS.home),
      S.documentTypeListItem("page").title("Pages").icon(DocumentTextIcon),
      S.divider(),
      S.documentTypeListItem("post").title("Stories").icon(EditIcon),
      S.divider(),
      S.listItem()
        .title("Products")
        .icon(AsteriskIcon)
        .schemaType("product")
        .child(
          S.documentTypeList("product")
            .title("Products")
            .apiVersion("2024-10-01")
            .filter('_type == "product" && store.isDeleted != true'),
        ),
      S.documentTypeListItem("review").title("Reviews").icon(CommentIcon),
      S.divider(),
      singletonListItem(S, SINGLETONS.settings),
    ]);
