import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import '@/styles/css/v2.css';
import '@/styles/css/v2-sub.css';
import '@/styles/css/blogsStyles.css';
import '@/styles/css/singleBlogStyles.css';
import { sbFetch, sbAsset } from '@/lib/supabase';
import { ASSET_VERSION } from '@/lib/version';
import Scripts from '../../Scripts';
import Mermaid from '../../components/Mermaid';
import SubShell from '../../components/SubShell';

export const revalidate = 120;

async function getPost(slug: string) {
  if (!slug) return null;
  const rows = await sbFetch<any>(
    'blogs',
    `select=*&slug=eq.${encodeURIComponent(slug)}&published=eq.true&limit=1`
  );
  return rows && rows[0] ? rows[0] : null;
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ slug?: string }>;
}): Promise<Metadata> {
  const { slug } = await searchParams;
  const post = await getPost(slug || '');
  return {
    title: post ? `${post.title} - Sumit Adak` : 'Post not found - Sumit Adak',
    description: post ? (post.excerpt || post.title) : 'Post not found',
  };
}

const POST_STYLES = `
.post-wrap{max-width:820px;margin:0 auto;padding:clamp(36px,7vh,80px) var(--gutter) clamp(64px,10vh,120px);}
.post-wrap .post-meta{display:flex;gap:14px;align-items:center;flex-wrap:wrap;margin-bottom:18px;}
.post-wrap h1{font-family:var(--font-display);font-weight:600;font-size:clamp(36px,6vw,72px);line-height:1.02;letter-spacing:-0.02em;margin-bottom:22px;}
.post-cover{border-radius:18px;overflow:hidden;border:1px solid var(--line);margin-bottom:34px;}
.post-cover img{width:100%;display:block;}
.post-body{font-size:17px;line-height:1.75;color:#2c2b26;}
.post-body h2,.post-body h3{font-family:var(--font-display);font-weight:600;margin:1.6em 0 0.6em;}
.post-body p{margin-bottom:1.1em;}
.post-body a{color:var(--amber-deep);}
.post-body img{max-width:100%;border-radius:12px;}
.post-body pre{background:var(--ink);color:var(--paper);border-radius:12px;padding:18px;overflow-x:auto;font-family:var(--font-mono);font-size:13.5px;}
.post-body code{font-family:var(--font-mono);font-size:0.92em;}
.post-body blockquote{border-left:3px solid var(--amber);padding-left:18px;color:var(--muted);font-style:italic;margin:1.2em 0;}
.post-404{text-align:center;padding:16vh var(--gutter);}
.post-404 h1{font-family:var(--font-display);font-size:clamp(40px,8vw,100px);}
`;

export default async function DynamicPost({
  searchParams,
}: {
  searchParams: Promise<{ slug?: string }>;
}) {
  const { slug } = await searchParams;
  const post = await getPost(slug || '');

  // static posts live as their own pages — send the visitor there
  if (post && post.is_static) redirect(`/blogs/${post.slug}`);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: POST_STYLES }} />
      <SubShell active="blogs">
        {post ? (
          <article className="post-wrap">
            <div className="post-meta">
              <span className="blog-category-tag">{post.category}</span>
              <span className="blog-date">{post.date_label}</span>
            </div>
            <h1>{post.title}</h1>
            {post.image ? (
              <div className="post-cover"><img src={sbAsset(post.image)} alt={post.title} /></div>
            ) : null}
            <div className="post-body" dangerouslySetInnerHTML={{ __html: post.content_html }} />
          </article>
        ) : (
          <div className="post-404">
            <h1>404<span className="amber">.</span></h1>
            <p className="sub-note">that post took a wrong turn — <a href="/blogs">back to the blogs</a>.</p>
          </div>
        )}
      </SubShell>

      <Mermaid />
      <Scripts src={['/js/loader.js', '/js/subpage.js']} version={ASSET_VERSION} />
    </>
  );
}
