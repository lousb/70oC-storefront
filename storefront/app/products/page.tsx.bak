import { sanityFetch } from "../../data/sanity/";
import { SHOP_QUERY } from "../../data/sanity/queries";
import { ShopGrid } from "../../components/shop-grid";

export default async function Page() {
  const { data: shop } = await sanityFetch({
    query: SHOP_QUERY,
    stega: false,
  });

  if (!shop?._id) {
    return <>NO SHOP PAGE FOUND — create the Shop document in Sanity Studio</>;
  }

  return (
    <div>
      <ShopGrid
        pageBuilder={shop.pageBuilder ?? []}
        pageId={shop._id}
        pageType={shop._type}
        title={shop.pageSeo?.title ?? null}
        description={shop.pageSeo?.description ?? null}
      />
    </div>
  );
}