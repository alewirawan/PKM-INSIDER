import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ApiError } from "../../lib/api-client";
import { BlogDetailView } from "../../components/BlogDetailView";
import { SiteFooter } from "../../components/SiteFooter";
import { SiteHeader } from "../../components/SiteHeader";
import { getPublicPost } from "../../lib/cms/posts";

export const dynamicParams = true;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublicPost(slug).catch(() => undefined);
  if (!post)
    return {
      title: "Artikel Nurul Huda",
      description: "Artikel terbaru dari komunitas SMP Nurul Huda.",
      openGraph: { images: [] },
      twitter: { images: [] },
    };
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: [{ url: post.image }],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: [post.image],
    },
  };
}

export default async function BlogDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return (
    <>
      <SiteHeader active="/blog" />
      <BlogDetailView slug={slug} initialPost={await getPublicPost(slug).catch((error: unknown) => {
        if (error instanceof ApiError && error.status === 404) notFound();
        throw error;
      })} />
      <SiteFooter />
    </>
  );
}
