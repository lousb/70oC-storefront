import {
  AsteriskIcon,
  CubeIcon,
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
 */

export const structure: StructureResolver = (S, _) =>
  S.list()
    .title("Storefront Content")
    .items([
      singletonListItem(S, SINGLETONS.home),
      singletonListItem(S, SINGLETONS.shop),
      singletonListItem(S, SINGLETONS.archive),
      S.documentTypeListItem("page").title("Pages").icon(DocumentTextIcon),
      S.divider(),
      S.documentTypeListItem("post").title("Stories").icon(EditIcon),
      S.divider(),
      S.documentTypeListItem("collection").title("Collections").icon(CubeIcon),
      S.documentTypeListItem("product").title("Products").icon(AsteriskIcon),
      S.divider(),
      singletonListItem(S, SINGLETONS.settings),
    ]);
