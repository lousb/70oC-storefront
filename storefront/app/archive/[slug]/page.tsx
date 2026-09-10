import { notFound } from "next/navigation";
import { sanityFetch } from "../../../data/sanity";
import { POST_QUERY, ALL_POST_SLUGS } from "../../../data/sanity/queries";
import { BlogPageBuilder } from "../../../components/blog-page-builder";
import { MediaItem } from "../../../components/media-item";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const { data } = await sanityFetch({
    query: ALL_POST_SLUGS,
    perspective: "published",
    stega: false,
  });
  return data ?? [];
}

export default async function Page(props: Props) {
  const params = await props.params;
  const { data: post } = await sanityFetch({
    query: POST_QUERY,
    params,
  });

  if (!post?._id) return notFound();

  const dateLabel = post.date
    ? new Date(post.date).toLocaleDateString("en-AU", { year: "numeric", month: "long" })
    : null;

  const metaLine = [
    post.authors?.length ? post.authors.join(", ") : null,
    dateLabel,
    post.readDuration ? `${post.readDuration} min read` : null,
    post.category,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="blog-post-page">
      {/* Header */}
      <div style={{ marginBottom: "4rem" }}>

        <h1 style={{ margin: "0 0 1rem" }}>{post.title}</h1>
        {metaLine && (
          <p style={{ margin: "0 0 0.5rem", fontSize: "0.8rem", opacity: 0.5 }}>
            {metaLine}
          </p>
        )}
        <p style={{ margin: "0 0 0.5rem", fontSize: "0.8rem", opacity: 0.5 }}>
         (SCROLL)
        </p>
      </div>

      {/* Cover */}
      {post.cover && (
        <div style={{ position: "relative", width: "100%", aspectRatio: "16/9", marginBottom: "3rem" }}>
          <MediaItem
            mediaType={post.cover.mediaType}
            image={post.cover.image}
            video={post.cover.video}
            sizes="100vw"
            priority
          />
        </div>
      )}
      {post.excerpt && (
          <p style={{ margin: 0, opacity: 0.6 }}>{post.excerpt}</p>
        )}

      {/* Page builder */}
      {post.pageBuilder?.length > 0 && (
        <BlogPageBuilder blocks={post.pageBuilder} />
      )}
    </div>
  );
}
