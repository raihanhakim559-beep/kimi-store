import { notFound } from "next/navigation";

import { Link } from "@/i18n/navigation";
import { getBlogPostBySlug, getBlogPosts } from "@/lib/data/storefront";

const BlogPostPage = async ({ params }: { params: { slug: string } }) => {
  const post = await getBlogPostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  return (
    <article className="space-y-8">
      <header className="bg-muted/40 rounded-3xl border p-8">
        <p className="text-muted-foreground text-xs tracking-[0.4em] uppercase">
          {new Date(post.publishedAt).toLocaleDateString()} •{" "}
          {post.minutesToRead} min read
        </p>
        <h1 className="mt-4 text-4xl font-semibold">{post.title}</h1>
        <p className="text-muted-foreground mt-4">{post.excerpt}</p>
        <p className="text-muted-foreground mt-4 text-sm font-medium">
          By {post.author}
        </p>
      </header>
      <div className="prose prose-neutral dark:prose-invert max-w-none">
        {post.sections.map((section, index) => (
          <div key={`${post.slug}-${index}`} className="space-y-2">
            {section.heading ? <h2>{section.heading}</h2> : null}
            <p>{section.body}</p>
          </div>
        ))}
      </div>
      <footer className="flex flex-wrap gap-4 border-t pt-6 text-sm">
        <Link
          href="/blog"
          className="font-semibold underline-offset-4 hover:underline"
        >
          Back to blog
        </Link>
        <Link
          href="/wishlist"
          className="text-muted-foreground underline-offset-4 hover:underline"
        >
          Save to wishlist
        </Link>
      </footer>
    </article>
  );
};

export const generateStaticParams = async () => {
  const posts = await getBlogPosts();
  return posts.map((post) => ({ slug: post.slug }));
};

export default BlogPostPage;
