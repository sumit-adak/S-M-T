import type { Metadata } from 'next';
import '@/styles/css/v2.css';
import '@/styles/css/v2-sub.css';
import '@/styles/css/blogsStyles.css';
import '@/styles/css/singleBlogStyles.css';
import { sbFetch, sbAsset } from '@/lib/supabase';
import { ASSET_VERSION } from '@/lib/version';
import Scripts from '../Scripts';
import Mermaid from '../components/Mermaid';
import SubShell from '../components/SubShell';
import fallbackPosts from '@/content/blogIndexPosts.json';

export const revalidate = 120;

export const metadata: Metadata = {
  title: 'Blogs - Sumit Adak',
  description:
    'Blogs - Sumit Adak - A Full Stack and AI Developer crafting modern web applications and AI-powered solutions.',
  alternates: { canonical: 'https://sumitadak.dev/blogs/' },
  openGraph: {
    type: 'website', url: 'https://sumitadak.dev/blogs/', title: 'Blogs - Sumit Adak',
    description: 'Welcome to a visual journey that blends code & creativity. Engineered with precision & crafted with passion.',
    images: ['https://sumitadak.dev/assets/sumit-hero.png'],
  },
};

export default async function Blogs({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;

  const sbPosts = await sbFetch<any>('blogs', 'select=*&published=eq.true&order=sort');

  let allPosts = fallbackPosts as any[];
  allPosts = allPosts.map(p => ({
    ...p,
    link: p.link.startsWith('/') ? p.link : '/blogs/' + p.link
  }));

  if (sbPosts) {
    allPosts = sbPosts.map((r) => ({
      title: r.title,
      date: r.date_label,
      category: r.category,
      image: sbAsset(r.image),
      link: r.is_static ? '/blogs/' + r.slug : '/blogs/post?slug=' + encodeURIComponent(r.slug),
    }));
  }

  const categories: string[] = sbPosts
    ? Array.from(new Set(sbPosts.map((r) => r.category).filter(Boolean)))
    : ['HTML & CSS', 'JavaScript', 'Software development'];

  return (
    <>
      <SubShell active="blogs">
        <section className="sub-hero">
          <p className="section-kicker"><span className="idx">//</span> the notebook</p>
          <h1>thoughts in <span className="amber">ink.</span></h1>
          <p className="sub-note">Notes on JavaScript, the web and how things work under the hood — written while learning, published while it still hurts.</p>
        </section>

        <div className="blog-container">
          <aside className="blog-sidebar">
            <h3 className="blog-category-title">Categories</h3>
            <ul className="blog-categories">
              <li><a href="/blogs" className={!category ? 'active' : undefined}>View all</a></li>
              {categories.map((cat) => (
                <li key={cat}>
                  <a href={`?category=${encodeURIComponent(cat)}`} className={category === cat ? 'active' : undefined}>{cat}</a>
                </li>
              ))}
            </ul>
          </aside>

          <main className="blog-content">
            <script dangerouslySetInnerHTML={{ __html: `const allPosts = ${JSON.stringify(allPosts)};` }} />

            <div className="blog-content-header">
              <h3 className="recent-posts-title">Recent posts</h3>
              <div className="search-container">
                <input type="text" placeholder="Search" className="search-input" />
              </div>
            </div>

            <div className="posts-grid"></div>

            <div className="pagination-container" style={{ marginTop: 50, display: 'flex', justifyContent: 'center', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}></div>
          </main>
        </div>
      </SubShell>

      <Mermaid />
      <Scripts src={['/js/loader.js', '/js/subpage.js', '/js/blogScript.js']} version={ASSET_VERSION} />
    </>
  );
}
