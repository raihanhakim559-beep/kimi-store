import { Link } from "@/i18n/navigation";
import { blogPosts } from "@/lib/data/storefront";

const BlogPage = () => {
  return (
    <div className="space-y-10">
      <header className="bg-muted/50 rounded-3xl border p-8">
        <p className="text-muted-foreground text-xs tracking-[0.4em] uppercase">
          Blog
        </p>
        <h1 className="mt-4 text-4xl font-semibold">
          Stories from the motion lab.
        </h1>
        <p className="text-muted-foreground mt-4">
          Editorial dispatches covering material science, styling tips, and
          training frameworks curated by the Kimi Store collective.
        </p>
      </header>
      <section className="space-y-8">
        {blogPosts.map((post) => (
          <article key={post.slug} className="rounded-2xl border p-6">
            <p className="text-muted-foreground text-xs uppercase">
              {new Date(post.publishedAt).toLocaleDateString()} •{" "}
              {post.minutesToRead} min read
            </p>
            <h2 className="mt-2 text-2xl font-semibold">{post.title}</h2>
            <p className="text-muted-foreground mt-2">{post.excerpt}</p>
            <div className="mt-4 flex items-center justify-between">
              <p className="text-muted-foreground text-sm font-medium">
                By {post.author}
              </p>
              <Link
                href={`/blog/${post.slug}`}
                className="text-sm font-semibold underline-offset-4 hover:underline"
              >
                Read article
              </Link>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
};

export default BlogPage;
