import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import '@/styles/css/v2.css';
import '@/styles/css/v2-sub.css';
import '@/styles/css/blogsStyles.css';
import '@/styles/css/singleBlogStyles.css';
import { ASSET_VERSION } from '@/lib/version';
import Scripts from '../../Scripts';
import Loader from '../../components/Loader';
import Mermaid from '../../components/Mermaid';
import slugs from '@/content/blogs/_slugs.json';

export const dynamicParams = false; // unknown slugs → 404 (handled by CMS route /blogs/post)

type Post = {
  slug: string; title: string; description: string; keywords: string;
  ogTitle: string; ogDescription: string; ogImage: string; ogUrl: string; bodyHtml: string;
};

function load(slug: string): Post | null {
  if (!(slugs as string[]).includes(slug)) return null;
  try {
    return JSON.parse(readFileSync(join(process.cwd(), 'content', 'blogs', `${slug}.json`), 'utf8'));
  } catch {
    return null;
  }
}

export function generateStaticParams() {
  return (slugs as string[]).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = load(slug);
  if (!post) return { title: 'Post not found - Sumit Adak' };
  return {
    title: post.title,
    description: post.description,
    keywords: post.keywords,
    openGraph: {
      type: 'article',
      url: post.ogUrl,
      title: post.ogTitle || post.title,
      description: post.ogDescription || post.description,
      images: post.ogImage ? [post.ogImage] : undefined,
    },
  };
}

export default async function BlogPost({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = load(slug);
  if (!post) notFound();

  // Strip the old speedometer loader from the bodyHtml
  const cleanBodyHtml = post.bodyHtml.replace(
    /<!-- ===================== LOADER — pit-lane wheel burst \(shared\) ===================== -->\s*<div class="loader"[\s\S]*?<\/div>\s*(?=<!-- film grain|<div class="grain")/i,
    ''
  );

  return (
    <>
      <Loader />
      <div dangerouslySetInnerHTML={{ __html: cleanBodyHtml }} />
      <Mermaid />
      <Scripts src={['/js/loader.js', '/js/subpage.js', '/js/singleBlogScript.js']} version={ASSET_VERSION} />
    </>
  );
}
